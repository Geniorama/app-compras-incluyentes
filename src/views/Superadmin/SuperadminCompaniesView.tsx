'use client';

import { useEffect, useState, useRef } from 'react';
import { Table, Button, Spinner, Modal, TextInput, Label } from 'flowbite-react';
import { HiCheck, HiX, HiOutlinePhotograph, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';

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
  webSite: '',
  addressCompany: '',
  department: '',
  city: '',
  companySize: 'indefinido' as string,
  sector: '',
  phone: '',
  active: false,
};

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
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchCompanies = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (searchDebounced.trim()) params.set('search', searchDebounced.trim());
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
  }, [user?.uid, currentPage, limit, searchDebounced]);

  const openCreate = () => {
    setForm(initialForm);
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'active') {
      setForm((f) => ({ ...f, active: (e.target as HTMLInputElement).checked }));
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
      setShowModal(false);
      await fetchCompanies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear empresa');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex container mx-auto mt-10">
        <SuperadminSidebar />
        <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0 flex justify-center items-center">
          <Spinner size="xl" />
        </main>
      </div>
    );
  }

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
          <div className="flex gap-2 items-center">
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
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <Table.Head>
            <Table.HeadCell>Empresa</Table.HeadCell>
            <Table.HeadCell>Departamento</Table.HeadCell>
            <Table.HeadCell>Tamaño</Table.HeadCell>
            <Table.HeadCell>Estado</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {companies.map((c) => (
              <Table.Row key={c._id}>
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

        <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
          <Modal.Header>Agregar empresa</Modal.Header>
          <form onSubmit={handleCreate}>
            <Modal.Body>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <TextInput
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <TextInput
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
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
                    <TextInput
                      id="sector"
                      name="sector"
                      value={form.sector}
                      onChange={handleInputChange}
                    />
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
                <div className="flex items-center gap-2">
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
            </Modal.Body>
            <Modal.Footer>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Crear empresa'}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </main>
    </div>
  );
}
