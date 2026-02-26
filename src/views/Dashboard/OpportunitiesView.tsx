'use client';

import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Button,
  Card,
  Spinner,
  Alert,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Label,
} from 'flowbite-react';
import { HiOutlinePlus, HiOutlinePencil, HiCalendar, HiOutlineOfficeBuilding } from 'react-icons/hi';
import toast from 'react-hot-toast';


interface SanityImage {
  asset?: { _ref: string };
}

interface Opportunity {
  _id: string;
  title: string;
  cover?: SanityImage;
  startDate: string;
  maxApplicationDate: string;
  description: string;
  requirements?: string;
  contractValue?: number;
  status: string;
  company?: { _id: string; nameCompany: string };
  applications?: Array<{ _id: string; nameCompany: string }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(value?: number): string {
  if (!value) return '-';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyForInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function parseCurrencyInput(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

function getImageUrl(img?: SanityImage): string {
  if (!img?.asset?._ref) return '';
  const ref = img.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
}

export default function OpportunitiesView() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    maxApplicationDate: '',
    description: '',
    requirements: '',
    contractValue: '',
    status: 'draft',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isLargeCompany = user?.company?.companySize === 'grande';
  const companyId = user?.company?._id;

  useEffect(() => {
    if (user) fetchOpportunities();
  }, [user]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (companyId && isLargeCompany) params.set('companyId', companyId);
      else params.set('status', 'open');
      const res = await fetch(`/api/opportunities?${params}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      startDate: '',
      maxApplicationDate: '',
      description: '',
      requirements: '',
      contractValue: '',
      status: 'draft',
    });
    setCoverFile(null);
    setCoverPreview(null);
    setShowModal(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditingId(opp._id);
    setForm({
      title: opp.title,
      startDate: opp.startDate?.split('T')[0] || '',
      maxApplicationDate: opp.maxApplicationDate?.split('T')[0] || '',
      description: opp.description || '',
      requirements: opp.requirements || '',
      contractValue: opp.contractValue?.toString() || '',
      status: opp.status || 'draft',
    });
    setCoverFile(null);
    setCoverPreview(opp.cover?.asset?._ref ? getImageUrl(opp.cover) : null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.maxApplicationDate || !form.description) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      let coverSanity: { _type: string; asset: { _type: string; _ref: string } } | undefined;
      if (coverFile) {
        const formData = new FormData();
        formData.append('image', coverFile);
        const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Error al subir la portada');
        const uploadData = await uploadRes.json();
        coverSanity = { _type: 'image', asset: uploadData.asset };
      }

      const body = {
        ...form,
        cover: coverSanity,
        startDate: new Date(form.startDate).toISOString(),
        maxApplicationDate: new Date(form.maxApplicationDate).toISOString(),
        contractValue: form.contractValue ? Number(form.contractValue) : undefined,
        senderId: user?.uid,
      };
      if (editingId) {
        const res = await fetch(`/api/opportunities/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success('Oportunidad actualizada');
        setOpportunities((prev) =>
          prev.map((o) => (o._id === editingId ? { ...o, ...data.opportunity } : o))
        );
      } else {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success('Oportunidad creada');
        const params = new URLSearchParams();
        if (companyId && isLargeCompany) params.set('companyId', companyId);
        else params.set('status', 'open');
        params.set('fresh', '1');
        const resList = await fetch(`/api/opportunities?${params}`);
        const dataList = await resList.json();
        setOpportunities(dataList.opportunities || []);
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex container mx-auto my-10">
      <DashboardSidebar />
      <main className="w-full xl:w-3/4 px-3 sm:pl-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Oportunidades</h1>
            <p className="text-gray-600">
              {isLargeCompany
                ? 'Gestiona las licitaciones y convocatorias que publica tu empresa.'
                : 'Explora oportunidades abiertas y postula tu empresa.'}
            </p>
          </div>
          {isLargeCompany && (
            <Button color="blue" onClick={openCreate}>
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Nueva oportunidad
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="xl" />
          </div>
        ) : opportunities.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">
              {isLargeCompany
                ? 'No has publicado ninguna oportunidad. Crea la primera.'
                : 'No hay oportunidades abiertas en este momento.'}
            </p>
            {isLargeCompany && (
              <Button color="blue" onClick={openCreate}>
                Crear oportunidad
              </Button>
            )}
            {!isLargeCompany && (
              <Button color="blue" onClick={() => window.open('/oportunidades', '_blank')}>
                Ver oportunidades públicas
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <Card key={opp._id} className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-40 h-28 flex-shrink-0 rounded overflow-hidden">
                    {opp.cover?.asset?._ref ? (
                      <img
                        src={getImageUrl(opp.cover)}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge color={opp.status === 'open' ? 'success' : opp.status === 'closed' ? 'failure' : 'gray'}>
                        {opp.status === 'open' ? 'Abierta' : opp.status === 'closed' ? 'Cerrada' : 'Borrador'}
                      </Badge>
                      {opp.company && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <HiOutlineOfficeBuilding className="w-4 h-4" />
                          {opp.company.nameCompany}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{opp.title}</h2>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{opp.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4" />
                        Cierre: {formatDate(opp.maxApplicationDate)}
                      </span>
                      {opp.contractValue && <span>{formatCurrency(opp.contractValue)}</span>}
                      {opp.applications && opp.applications.length > 0 && (
                        <span>{opp.applications.length} postulación(es)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" color="light" onClick={() => window.open(`/oportunidades/${opp._id}`, '_blank')}>
                      Ver
                    </Button>
                    {isLargeCompany && opp.company?._id === companyId && (
                      <Button size="sm" color="light" onClick={() => openEdit(opp)}>
                        <HiOutlinePencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
          <Modal.Header>{editingId ? 'Editar oportunidad' : 'Nueva oportunidad'}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label>Portada (opcional)</Label>
                <div className="flex gap-4 items-start">
                  <div className="w-32 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {coverPreview || coverFile ? (
                      <img
                        src={coverFile ? URL.createObjectURL(coverFile) : coverPreview || ''}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setCoverFile(f || null);
                        setCoverPreview(f ? URL.createObjectURL(f) : null);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Se mostrará una imagen por defecto si no añades portada.</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Título *</Label>
                <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha inicio *</Label>
                  <TextInput type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Fecha cierre postulaciones *</Label>
                  <TextInput type="date" value={form.maxApplicationDate} onChange={(e) => setForm((f) => ({ ...f, maxApplicationDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Descripción *</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Requisitos</Label>
                <Textarea rows={3} value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} placeholder="Opcional" />
              </div>
              <div>
                <Label>Valor del contrato (COP)</Label>
                <TextInput
                  type="text"
                  value={form.contractValue ? formatCurrencyForInput(form.contractValue) : ''}
                  onChange={(e) => {
                    const raw = parseCurrencyInput(e.target.value);
                    flushSync(() => setForm((f) => ({ ...f, contractValue: raw })));
                  }}
                  placeholder="$ 0"
                />
              </div>
              {editingId && (
                <div>
                  <Label>Estado</Label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 p-2"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">Borrador</option>
                    <option value="open">Abierta</option>
                    <option value="closed">Cerrada</option>
                  </select>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}
