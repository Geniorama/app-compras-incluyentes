'use client';

import { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, TextInput, Label, Spinner } from 'flowbite-react';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';
import { getSanityImageUrl } from '@/utils/sanityImage';

const PAGE_SIZES = [20, 50, 100] as const;

interface CategoryImage {
  asset?: { _ref?: string; url?: string; _id?: string };
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  types?: string[];
  image?: CategoryImage;
  _createdAt?: string;
}

function getCategoryImageUrl(image?: CategoryImage): string {
  if (!image?.asset) return '';
  return getSanityImageUrl(image.asset as { _ref?: string; url?: string; _id?: string });
}

export default function SuperadminCategoriesView() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', types: 'product' });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<(typeof PAGE_SIZES)[number]>(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (searchDebounced.trim()) params.set('search', searchDebounced.trim());
      const res = await fetch(`/api/superadmin/categories?${params}`, {
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories || []);
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
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, currentPage, limit, searchDebounced]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', types: 'product' });
    setIconFile(null);
    setIconPreview(null);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      types: Array.isArray(cat.types) && cat.types.length > 0 ? cat.types[0] : 'product',
    });
    setIconFile(null);
    setIconPreview(cat.image ? getCategoryImageUrl(cat.image) : null);
    setShowModal(true);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('La imagen es demasiado grande. Máximo 2MB.');
        return;
      }
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    try {
      const types = form.types === 'both' ? ['product', 'service'] : [form.types];
      let imageAsset: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined;
      if (iconFile) {
        const formData = new FormData();
        formData.append('image', iconFile);
        const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Error al subir el icono');
        const uploadData = await uploadRes.json();
        imageAsset = { _type: 'image', asset: uploadData.asset };
      }

      if (editingId) {
        const res = await fetch(`/api/superadmin/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            types,
            ...(imageAsset !== undefined && { image: imageAsset }),
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchCategories();
          toast.success('Categoría actualizada');
          setShowModal(false);
        } else {
          toast.error(data.message || 'Error');
        }
      } else {
        const res = await fetch('/api/superadmin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            types,
            image: imageAsset,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchCategories();
          toast.success('Categoría creada');
          setShowModal(false);
        } else {
          toast.error(data.message || 'Error');
        }
      }
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid || !confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`/api/superadmin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        toast.success('Categoría eliminada');
      } else {
        toast.error(data.message || 'Error');
      }
    } catch {
      toast.error('Error al eliminar');
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de categorías</h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm w-64"
              />
            </div>
            <Button onClick={openCreate}>Nueva categoría</Button>
          </div>
        </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <Table.Head>
            <Table.HeadCell>Icono</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell>Descripción</Table.HeadCell>
            <Table.HeadCell>Tipos</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {categories.map((c) => (
              <Table.Row key={c._id}>
                <Table.Cell>
                  <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden bg-gray-100 flex-shrink-0">
                    {c.image?.asset ? (
                      <img
                        src={getCategoryImageUrl(c.image)}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiOutlinePhotograph className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="font-medium">{c.name}</Table.Cell>
                <Table.Cell className="max-w-xs truncate">{c.description || '-'}</Table.Cell>
                <Table.Cell>
                  {Array.isArray(c.types) ? c.types.join(', ') : '-'}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => openEdit(c)}>
                      <HiOutlinePencil className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(c._id)}>
                      <HiOutlineTrash className="h-4 w-4" />
                    </Button>
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

        {categories.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay categorías. Crea la primera.</p>
        )}

        <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{editingId ? 'Editar categoría' : 'Nueva categoría'}</Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label>Icono de la categoría</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded flex items-center justify-center overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                    {iconPreview ? (
                      <img src={iconPreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <HiOutlinePhotograph className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      color="light"
                      size="sm"
                      onClick={() => iconInputRef.current?.click()}
                    >
                      {iconPreview ? 'Cambiar icono' : 'Subir icono'}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={iconInputRef}
                      className="hidden"
                      onChange={handleIconChange}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <TextInput
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <TextInput
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="types">Tipos</Label>
                <select
                  id="types"
                  className="block w-full rounded-lg border border-gray-300"
                  value={form.types}
                  onChange={(e) => setForm({ ...form, types: e.target.value })}
                >
                  <option value="product">Producto</option>
                  <option value="service">Servicio</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Guardar'}
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
