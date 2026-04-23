'use client';

import { useEffect, useState, useRef } from 'react';
import { Table, Button, Spinner, Modal, TextInput, Label, Select } from 'flowbite-react';
import { HiCheck, HiX, HiOutlinePhotograph, HiOutlineSearch, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';
import { getDepartamentosOptions, getCiudadesOptionsByDepartamento } from '@/utils/departamentosCiudades';
import { getMexicoEstadosOptions, getMexicoMunicipiosByEstado } from '@/data/mexicoStates';
import { LATIN_AMERICA_COUNTRIES } from '@/data/latinAmericaCountries';
import ReactSelect from 'react-select';
import { getCIIUOptions } from '@/utils/ciiuOptions';

const PEOPLE_GROUP_OPTIONS = [
  { value: 'lgbtiq', label: 'LGBTIQ+' },
  { value: 'discapacidad-sensorial', label: 'Personas con discapacidad Sensorial' },
  { value: 'discapacidad-fisico-motora', label: 'Personas con discapacidad Físico Motora' },
  { value: 'discapacidad-psicosocial', label: 'Personas con discapacidad Psicosocial' },
  { value: 'discapacidad-cognitiva', label: 'Personas con discapacidad Cognitiva' },
  { value: 'migrantes', label: 'Migrantes' },
  { value: 'etnia-afrodescendientes', label: 'Etnia y Raza: Afrodescendientes, raizales y palenqueros' },
  { value: 'etnia-indigenas', label: 'Etnia y Raza: Indígenas' },
  { value: 'victimas-reconciliacion-paz', label: 'Víctimas del conflicto armado y personas en proceso de reintegración o reincorporación' },
  { value: 'pospenadas', label: 'Pospenadas' },
  { value: 'diversidad-generacional-mayores-50', label: 'Diversidad Generacional mayores de 50 años' },
  { value: 'diversidad-generacional-primer-empleo', label: 'Diversidad Generacional primer empleo' },
  { value: 'madres-cabeza-familia', label: 'Madres cabeza de familia' },
  { value: 'diversidad-sexual', label: 'Diversidad Sexual' },
  { value: 'etnia-raza-afro', label: 'Etnia, raza o afro' },
  { value: 'personas-migrantes', label: 'Personas migrantes' },
  { value: 'generacional', label: 'Generacional' },
  { value: 'equidad-genero', label: 'Equidad de Género' },
  { value: 'pospenados-reinsertados', label: 'Pospenados o reinsertados' },
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'otro', label: 'Otro' },
];

const PAGE_SIZES = [20, 50, 100] as const;
const COMPANY_SIZES = ['micro', 'pequena', 'mediana', 'grande', 'indefinido'] as const;

interface Company {
  _id: string;
  nameCompany: string;
  businessName?: string;
  department?: string;
  city?: string;
  companySize?: string;
  active: boolean;
  _createdAt?: string;
}

const initialForm = {
  nameCompany: '',
  businessName: '',
  description: '',
  typeDocumentCompany: 'nit' as string,
  numDocumentCompany: '',
  ciiu: '',
  webSite: '',
  addressCompany: '',
  countries: [] as string[],
  country: '',
  department: '',
  city: '',
  companySize: 'indefinido' as string,
  sector: '',
  phone: '',
  active: false,
  facebook: '',
  instagram: '',
  tiktok: '',
  pinterest: '',
  linkedin: '',
  xtwitter: '',
  peopleGroup: [] as string[],
  otherPeopleGroup: '',
  friendlyBizz: false,
  inclusionDEI: false,
  membership: false,
  annualRevenue: '',
  collaboratorsCount: '',
};

const LATAM_OPTIONS = LATIN_AMERICA_COUNTRIES.map((c) => ({ value: c.value, label: c.title }));

export default function SuperadminCompaniesView() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<(typeof PAGE_SIZES)[number]>(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [existingLogo, setExistingLogo] = useState<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const departamentosOptions = getDepartamentosOptions();
  const mexEstadosOptions = getMexicoEstadosOptions();
  const ciiuOptions = getCIIUOptions();

  useEffect(() => {
    if (!form.department || !form.country) {
      setCityOptions([]);
      return;
    }
    if (form.country === 'MX') {
      setCityOptions(getMexicoMunicipiosByEstado(form.department));
    } else {
      setCityOptions(getCiudadesOptionsByDepartamento(form.department));
    }
  }, [form.department, form.country]);

  const fetchCompanies = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (searchDebounced.trim()) params.set('search', searchDebounced.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/superadmin/companies?${params}`, {
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data.companies || []);
        setTotal(data.data.total ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, currentPage, limit, searchDebounced, statusFilter]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, limit, searchDebounced, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogo(null);
    setShowModal(true);
  };

  const openEdit = async (id: string) => {
    if (!user?.uid) return;
    setEditingId(id);
    setLoadingEdit(true);
    setShowModal(true);
    try {
      const res = await fetch(`/api/superadmin/companies/${id}`, {
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error al cargar empresa');
      const c = data.data.company as {
        nameCompany?: string;
        businessName?: string;
        description?: string;
        typeDocumentCompany?: string;
        numDocumentCompany?: string;
        ciiu?: string;
        webSite?: string;
        addressCompany?: string;
        countries?: string[];
        country?: string;
        department?: string;
        city?: string;
        companySize?: string;
        sector?: string;
        phone?: string;
        active?: boolean;
        facebook?: string;
        instagram?: string;
        tiktok?: string;
        pinterest?: string;
        linkedin?: string;
        xtwitter?: string;
        peopleGroup?: string[];
        otherPeopleGroup?: string;
        friendlyBizz?: boolean;
        inclusionDEI?: boolean;
        membership?: boolean;
        annualRevenue?: number;
        collaboratorsCount?: number;
        logo?: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
      };
      setForm({
        nameCompany: c.nameCompany || '',
        businessName: c.businessName || '',
        description: c.description || '',
        typeDocumentCompany: c.typeDocumentCompany || 'nit',
        numDocumentCompany: c.numDocumentCompany || '',
        ciiu: c.ciiu || '',
        webSite: c.webSite || '',
        addressCompany: c.addressCompany || '',
        countries: Array.isArray(c.countries) ? c.countries : (c.country ? [c.country] : []),
        country: c.country || '',
        department: c.department || '',
        city: c.city || '',
        companySize: c.companySize || 'indefinido',
        sector: c.sector || '',
        phone: c.phone || '',
        active: Boolean(c.active),
        facebook: c.facebook || '',
        instagram: c.instagram || '',
        tiktok: c.tiktok || '',
        pinterest: c.pinterest || '',
        linkedin: c.linkedin || '',
        xtwitter: c.xtwitter || '',
        peopleGroup: Array.isArray(c.peopleGroup) ? c.peopleGroup : [],
        otherPeopleGroup: c.otherPeopleGroup || '',
        friendlyBizz: Boolean(c.friendlyBizz),
        inclusionDEI: Boolean(c.inclusionDEI),
        membership: Boolean(c.membership),
        annualRevenue: c.annualRevenue ? String(c.annualRevenue) : '',
        collaboratorsCount: c.collaboratorsCount ? String(c.collaboratorsCount) : '',
      });
      setLogoFile(null);
      setExistingLogo(c.logo || null);
      setLogoPreview(
        c.logo?.asset?._ref
          ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${c.logo.asset._ref
              .replace('image-', '')
              .replace('-jpg', '.jpg')
              .replace('-png', '.png')
              .replace('-webp', '.webp')}`
          : null
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar empresa');
      setShowModal(false);
      setEditingId(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('La imagen es demasiado grande. Máximo 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!form.nameCompany.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }
    setSaving(true);
    try {
      let logoAsset: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined;
      if (logoFile) {
        const formData = new FormData();
        formData.append('image', logoFile);
        const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Error al subir el logo');
        const uploadData = await uploadRes.json();
        logoAsset = { _type: 'image', asset: uploadData.asset };
      }

      if (editingId) {
        const res = await fetch(`/api/superadmin/companies/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
          body: JSON.stringify({
            ...form,
            logo: logoAsset ?? existingLogo ?? undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Error al actualizar empresa');
        toast.success('Empresa actualizada correctamente');
      } else {
        const res = await fetch('/api/superadmin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
          body: JSON.stringify({
            ...form,
            logo: logoAsset,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al crear empresa');
        toast.success('Empresa creada correctamente');
      }

      setShowModal(false);
      setEditingId(null);
      await fetchCompanies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar empresa');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === companies.length && companies.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(companies.map((c) => c._id)));
    }
  };

  const runBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!user?.uid || selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch('/api/superadmin/companies/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ ids: Array.from(selectedIds), action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error en la acción masiva');
      }
      toast.success(
        action === 'delete'
          ? `${data.data.count} empresa(s) eliminada(s)`
          : action === 'activate'
          ? `${data.data.count} empresa(s) aprobada(s)`
          : `${data.data.count} empresa(s) desactivada(s)`
      );
      setSelectedIds(new Set());
      setBulkAction(null);
      await fetchCompanies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error en la acción masiva');
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (!user?.uid) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/superadmin/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (data.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === id ? { ...c, active } : c))
        );
        toast.success(active ? 'Empresa aprobada' : 'Empresa desactivada');
      } else {
        toast.error(data.message || 'Error');
      }
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex container mx-auto mt-10">
      <SuperadminSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de empresas</h1>
            <p className="text-sm text-gray-500 mt-1">
              Agregar empresas o aprobar/desactivar las existentes para que aparezcan en el catálogo.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'pending');
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 text-sm py-2 px-3"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="pending">Pendientes</option>
            </select>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, departamento o ciudad..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm w-64"
              />
            </div>
            <Button color="blue" onClick={openCreate}>
              Agregar empresa
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <span className="text-sm text-blue-900 font-medium">
              {selectedIds.size} empresa(s) seleccionada(s)
            </span>
            <div className="flex gap-2">
              <Button
                size="xs"
                color="success"
                onClick={() => setBulkAction('activate')}
                disabled={bulkBusy}
              >
                <HiCheck className="mr-1 h-4 w-4" />
                Aprobar
              </Button>
              <Button
                size="xs"
                color="warning"
                onClick={() => setBulkAction('deactivate')}
                disabled={bulkBusy}
              >
                <HiX className="mr-1 h-4 w-4" />
                Desactivar
              </Button>
              <Button
                size="xs"
                color="failure"
                onClick={() => setBulkAction('delete')}
                disabled={bulkBusy}
              >
                <HiOutlineTrash className="mr-1 h-4 w-4" />
                Eliminar
              </Button>
              <Button size="xs" color="gray" onClick={() => setSelectedIds(new Set())} disabled={bulkBusy}>
                Limpiar selección
              </Button>
            </div>
          </div>
        )}
      <div className="relative overflow-x-auto rounded-lg border border-gray-200">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <Spinner size="xl" />
          </div>
        )}
        <Table>
          <Table.Head>
            <Table.HeadCell className="w-10">
              <input
                type="checkbox"
                aria-label="Seleccionar todas las empresas de la página"
                checked={companies.length > 0 && selectedIds.size === companies.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
            </Table.HeadCell>
            <Table.HeadCell>Empresa</Table.HeadCell>
            <Table.HeadCell>Departamento</Table.HeadCell>
            <Table.HeadCell>Tamaño</Table.HeadCell>
            <Table.HeadCell>Estado</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {companies.map((c) => (
              <Table.Row key={c._id} className={selectedIds.has(c._id) ? 'bg-blue-50' : ''}>
                <Table.Cell className="w-10">
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar ${c.nameCompany}`}
                    checked={selectedIds.has(c._id)}
                    onChange={() => toggleSelect(c._id)}
                    className="rounded border-gray-300"
                  />
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <p className="font-medium">{c.nameCompany}</p>
                    {c.businessName && (
                      <p className="text-xs text-gray-500">{c.businessName}</p>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{[c.department, c.city].filter(Boolean).join(', ') || '-'}</Table.Cell>
                <Table.Cell>{c.companySize || '-'}</Table.Cell>
                <Table.Cell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded ${
                      c.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.active ? 'Activa' : 'Pendiente'}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(c._id)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </Button>
                    {updatingId === c._id ? (
                      <Spinner size="sm" />
                    ) : c.active ? (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => toggleActive(c._id, false)}
                      >
                        <HiX className="mr-1 h-4 w-4" />
                        Desactivar
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => toggleActive(c._id, true)}
                      >
                        <HiCheck className="mr-1 h-4 w-4" />
                        Aprobar
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Registros por página:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) as 20 | 50 | 100);
                setCurrentPage(1);
              }}
              className="rounded border border-gray-300 text-sm py-1.5 px-2"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {total > 0
                ? `${Math.min((currentPage - 1) * limit + 1, total)}-${Math.min(currentPage * limit, total)} de ${total}`
                : '0 registros'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              color="gray"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              color="gray"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * limit >= total || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>

        {companies.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay empresas registradas.</p>
        )}

        <Modal show={bulkAction !== null} onClose={() => !bulkBusy && setBulkAction(null)} size="md">
          <Modal.Header>
            {bulkAction === 'activate'
              ? 'Aprobar empresas'
              : bulkAction === 'deactivate'
              ? 'Desactivar empresas'
              : 'Eliminar empresas'}
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-700">
              {bulkAction === 'delete'
                ? `Se eliminarán ${selectedIds.size} empresa(s) de forma permanente. Esta acción no se puede deshacer.`
                : bulkAction === 'activate'
                ? `Se activarán ${selectedIds.size} empresa(s) y aparecerán en el catálogo.`
                : `Se desactivarán ${selectedIds.size} empresa(s) y dejarán de aparecer en el catálogo.`}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color={bulkAction === 'delete' ? 'failure' : bulkAction === 'activate' ? 'success' : 'warning'}
              disabled={bulkBusy}
              onClick={() => bulkAction && runBulkAction(bulkAction)}
            >
              {bulkBusy ? <Spinner size="sm" /> : 'Confirmar'}
            </Button>
            <Button color="gray" onClick={() => setBulkAction(null)} disabled={bulkBusy}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} size="2xl">
          <Modal.Header>{editingId ? 'Editar empresa' : 'Agregar empresa'}</Modal.Header>
          <form onSubmit={handleCreate}>
            <Modal.Body>
              {loadingEdit ? (
                <div className="flex justify-center py-8">
                  <Spinner size="xl" />
                </div>
              ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <Label htmlFor="nameCompany">Nombre de la empresa *</Label>
                  <TextInput
                    id="nameCompany"
                    name="nameCompany"
                    value={form.nameCompany}
                    onChange={handleInputChange}
                    placeholder="Ej: Mi Empresa S.A.S."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Razón social</Label>
                  <TextInput
                    id="businessName"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleInputChange}
                    placeholder="Se usa el nombre si se deja vacío"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="typeDocumentCompany">Tipo de documento</Label>
                    <select
                      id="typeDocumentCompany"
                      name="typeDocumentCompany"
                      value={form.typeDocumentCompany}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300"
                    >
                      <option value="nit">NIT</option>
                      <option value="rut">RUT</option>
                      <option value="rfc">RFC</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="numDocumentCompany">Número de documento</Label>
                    <TextInput
                      id="numDocumentCompany"
                      name="numDocumentCompany"
                      value={form.numDocumentCompany}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ciiu">CIIU</Label>
                  <ReactSelect
                    id="ciiu"
                    instanceId="superadmin-ciiu"
                    options={ciiuOptions}
                    value={ciiuOptions.find((o) => o.value === form.ciiu) || null}
                    onChange={(selected) => {
                      const v = (selected as { value?: string } | null)?.value || '';
                      setForm((f) => ({ ...f, ciiu: v }));
                    }}
                    placeholder="Selecciona un CIIU"
                    isClearable
                    noOptionsMessage={() => 'No hay opciones'}
                    className="text-sm mt-1"
                  />
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded flex items-center justify-center overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                      ) : (
                        <HiOutlinePhotograph className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        color="light"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={logoInputRef}
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="countries">Países donde opera la empresa</Label>
                  <ReactSelect
                    id="countries"
                    instanceId="superadmin-countries"
                    isMulti
                    options={LATAM_OPTIONS}
                    value={LATAM_OPTIONS.filter((o) => form.countries.includes(o.value))}
                    onChange={(selected) => {
                      const values = Array.isArray(selected) ? selected.map((s) => s.value) : [];
                      setForm((f) => {
                        const next = { ...f, countries: values };
                        if (!values.includes('CO') && !values.includes('MX')) {
                          next.country = '';
                          next.department = '';
                          next.city = '';
                        } else if (next.country && !values.includes(next.country)) {
                          next.country = values.includes('CO') ? 'CO' : 'MX';
                          next.department = '';
                          next.city = '';
                        }
                        return next;
                      });
                    }}
                    placeholder="Selecciona uno o más países"
                    noOptionsMessage={() => 'No hay opciones'}
                    className="text-sm mt-1"
                  />
                </div>
                {(form.countries.includes('CO') || form.countries.includes('MX')) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="country">País de la sede</Label>
                      <Select
                        id="country"
                        value={form.country}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((f) => ({ ...f, country: v, department: '', city: '' }));
                        }}
                      >
                        <option value="">Selecciona</option>
                        {form.countries.includes('CO') && <option value="CO">Colombia</option>}
                        {form.countries.includes('MX') && <option value="MX">México</option>}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">{form.country === 'MX' ? 'Estado' : 'Departamento'}</Label>
                      <Select
                        id="department"
                        value={form.department}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((f) => ({ ...f, department: v, city: '' }));
                        }}
                        disabled={!form.country}
                      >
                        <option value="">Selecciona</option>
                        {(form.country === 'MX' ? mexEstadosOptions : departamentosOptions).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">{form.country === 'MX' ? 'Municipio' : 'Ciudad'}</Label>
                      <Select
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        disabled={!form.department}
                      >
                        <option value="">Selecciona</option>
                        {cityOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companySize">Tamaño de empresa</Label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={form.companySize}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300"
                    >
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <select
                      id="sector"
                      name="sector"
                      value={form.sector}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300"
                    >
                      <option value="">Selecciona un sector</option>
                      <option value="COMERCIO">Comercio</option>
                      <option value="MANUFACTURA">Manufactura</option>
                      <option value="SERVICIOS">Servicios</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="webSite">Sitio web</Label>
                  <TextInput
                    id="webSite"
                    name="webSite"
                    type="url"
                    value={form.webSite}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="addressCompany">Dirección</Label>
                  <TextInput
                    id="addressCompany"
                    name="addressCompany"
                    value={form.addressCompany}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <TextInput
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <TextInput
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Redes sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <TextInput id="facebook" name="facebook" value={form.facebook} onChange={handleInputChange} placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <TextInput id="instagram" name="instagram" value={form.instagram} onChange={handleInputChange} placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <TextInput id="linkedin" name="linkedin" value={form.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/..." />
                    </div>
                    <div>
                      <Label htmlFor="xtwitter">X (Twitter)</Label>
                      <TextInput id="xtwitter" name="xtwitter" value={form.xtwitter} onChange={handleInputChange} placeholder="https://x.com/..." />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok</Label>
                      <TextInput id="tiktok" name="tiktok" value={form.tiktok} onChange={handleInputChange} placeholder="https://tiktok.com/@..." />
                    </div>
                    <div>
                      <Label htmlFor="pinterest">Pinterest</Label>
                      <TextInput id="pinterest" name="pinterest" value={form.pinterest} onChange={handleInputChange} placeholder="https://pinterest.com/..." />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Diversidad e inclusión</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="peopleGroup">Grupos poblacionales</Label>
                      <ReactSelect
                        id="peopleGroup"
                        instanceId="superadmin-people-group"
                        isMulti
                        options={PEOPLE_GROUP_OPTIONS}
                        value={PEOPLE_GROUP_OPTIONS.filter((o) => form.peopleGroup.includes(o.value))}
                        onChange={(selected) => {
                          const values = Array.isArray(selected) ? selected.map((s) => s.value) : [];
                          setForm((f) => ({ ...f, peopleGroup: values }));
                        }}
                        placeholder="Selecciona uno o más grupos"
                        noOptionsMessage={() => 'No hay opciones'}
                        className="text-sm mt-1"
                      />
                    </div>
                    {form.peopleGroup.includes('otro') && (
                      <div>
                        <Label htmlFor="otherPeopleGroup">Otro grupo poblacional</Label>
                        <TextInput id="otherPeopleGroup" name="otherPeopleGroup" value={form.otherPeopleGroup} onChange={handleInputChange} />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="inclusionDEI"
                        name="inclusionDEI"
                        checked={form.inclusionDEI}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="inclusionDEI">Empresa con política DEI</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="friendlyBizz"
                        name="friendlyBizz"
                        checked={form.friendlyBizz}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="friendlyBizz">Friendly Biz</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="membership"
                        name="membership"
                        checked={form.membership}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="membership">Empresa miembro de la Cámara</Label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Información financiera</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="annualRevenue">Ingresos anuales (COP)</Label>
                      <TextInput
                        id="annualRevenue"
                        name="annualRevenue"
                        type="number"
                        min={0}
                        value={form.annualRevenue}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="collaboratorsCount">Cantidad de colaboradores</Label>
                      <TextInput
                        id="collaboratorsCount"
                        name="collaboratorsCount"
                        type="number"
                        min={0}
                        value={form.collaboratorsCount}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={form.active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="active">Activar empresa (visible en catálogo)</Label>
                </div>
              </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button type="submit" disabled={saving || loadingEdit}>
                {saving ? <Spinner size="sm" /> : editingId ? 'Guardar cambios' : 'Crear empresa'}
              </Button>
              <Button color="gray" onClick={() => { setShowModal(false); setEditingId(null); }}>
                Cancelar
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </main>
    </div>
  );
}
