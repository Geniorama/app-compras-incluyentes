'use client';

import { useEffect, useState, useRef } from 'react';
import { Table, Button, Spinner, Modal, TextInput, Label, Select, Alert } from 'flowbite-react';
import { useAuth } from '@/context/AuthContext';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';
import { HiUser, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  pronoun?: string;
  position?: string;
  typeDocument?: string;
  numDocument?: string;
  role?: string;
  firebaseUid?: string;
  publicProfile?: boolean;
  notifyEmailMessages?: boolean;
  photo?: { _type?: string; asset?: { _ref?: string } };
  _createdAt?: string;
  company?: { _id: string; nameCompany: string };
}

interface Company {
  _id: string;
  nameCompany: string;
}

function getImageUrl(image: User['photo']): string {
  if (!image?.asset?._ref) return '';
  const ref = image.asset._ref
    .replace('image-', '')
    .replace('-jpg', '.jpg')
    .replace('-png', '.png')
    .replace('-webp', '.webp');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
}

function generarPassword(longitud = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=,.?';
  let password = '';
  for (let i = 0; i < longitud; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const PAGE_SIZES = [20, 50, 100] as const;

export default function SuperadminUsersView() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<(typeof PAGE_SIZES)[number]>(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    companyId: '',
    phone: '',
    pronoun: '',
    position: '',
    typeDocument: '',
    numDocument: '',
    publicProfile: false,
    notifyEmailMessages: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (searchDebounced.trim()) params.set('search', searchDebounced.trim());
      const res = await fetch(`/api/superadmin/users?${params}`, {
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users || []);
        setTotal(data.data.total ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch('/api/superadmin/companies', {
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (data.success) setCompanies(data.data.companies || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, currentPage, limit, searchDebounced]);

  const resetForm = () => {
    setSelectedUser(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      companyId: '',
      phone: '',
      pronoun: '',
      position: '',
      typeDocument: '',
      numDocument: '',
      publicProfile: false,
      notifyEmailMessages: false,
    });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. Máximo 10MB.');
        return;
      }
      setError('');
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const sugerirPassword = () => {
    setForm({ ...form, password: generarPassword() });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSubmitting(true);
    setError('');
    try {
      let photoAsset: { _type: string; asset: { _type: string; _ref: string } } | undefined;
      if (photoFile) {
        const formData = new FormData();
        formData.append('image', photoFile);
        const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Error al subir la foto');
        const uploadData = await uploadRes.json();
        photoAsset = { _type: 'image', asset: uploadData.asset };
      }

      const res = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          ...form,
          companyId: form.role === 'superadmin' ? null : form.companyId || undefined,
          photo: photoAsset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear usuario');

      toast.success('Usuario creado correctamente');
      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !selectedUser) return;

    setIsSubmitting(true);
    setError('');
    try {
      let photoAsset: { _type: string; asset: { _type: string; _ref: string } } | undefined;
      if (photoFile) {
        const formData = new FormData();
        formData.append('image', photoFile);
        const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Error al subir la foto');
        const uploadData = await uploadRes.json();
        photoAsset = { _type: 'image', asset: uploadData.asset };
      }

      const res = await fetch(`/api/superadmin/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          ...form,
          companyId: form.role === 'superadmin' ? null : form.companyId || undefined,
          photo: photoAsset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario');

      toast.success('Usuario actualizado correctamente');
      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || !userToDelete) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/superadmin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar usuario');

      toast.success('Usuario eliminado correctamente');
      setShowDeleteModal(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setSelectedUser(u);
    setPhotoPreview(u.photo ? getImageUrl(u.photo) : null);
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      companyId: u.company?._id || '',
      phone: u.phone || '',
      pronoun: u.pronoun || '',
      position: u.position || '',
      typeDocument: u.typeDocument || '',
      numDocument: u.numDocument || '',
      publicProfile: u.publicProfile ?? false,
      notifyEmailMessages: u.notifyEmailMessages ?? false,
    });
    setShowModal(true);
  };

  const openDelete = (u: User) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
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
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o empresa..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm w-64"
              />
            </div>
            <Button color="blue" onClick={openCreate}>
              Agregar usuario
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <Table.Head>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Rol</Table.HeadCell>
              <Table.HeadCell>Empresa</Table.HeadCell>
              <Table.HeadCell>Registro</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {users.map((u) => (
                <Table.Row key={u._id}>
                  <Table.Cell>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '-'}</Table.Cell>
                  <Table.Cell>{u.email}</Table.Cell>
                  <Table.Cell>{u.role || '-'}</Table.Cell>
                  <Table.Cell>{u.company?.nameCompany || '-'}</Table.Cell>
                  <Table.Cell>
                    {u._createdAt ? new Date(u._createdAt).toLocaleDateString() : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(u)}>
                        <HiOutlinePencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => openDelete(u)}
                        disabled={u.role === 'superadmin' || u.firebaseUid === user?.uid}
                      >
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

        {users.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay usuarios registrados.</p>
        )}

        {/* Modal Crear/Editar */}
        <Modal show={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
          <Modal.Header>{selectedUser ? 'Editar usuario' : 'Agregar usuario'}</Modal.Header>
          <Modal.Body>
            <form
              onSubmit={selectedUser ? handleUpdate : handleCreate}
              className="flex flex-col gap-4"
            >
              <div>
                <Label>Foto de perfil</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <HiUser className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      color="light"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="firstName">Nombre</Label>
                  <TextInput id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} required />
                </div>
                <div className="flex-1">
                  <Label htmlFor="lastName">Apellido</Label>
                  <TextInput id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  disabled={!!selectedUser}
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select id="role" name="role" value={form.role} onChange={handleInputChange}>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="member">Miembro</option>
                  <option value="superadmin">Superadmin</option>
                </Select>
              </div>
              {(form.role !== 'superadmin' || !selectedUser) && (
                <div>
                  <Label htmlFor="companyId">Empresa</Label>
                  <Select
                    id="companyId"
                    name="companyId"
                    value={form.companyId}
                    onChange={handleInputChange}
                    required={form.role !== 'superadmin'}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nameCompany}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              {!selectedUser && form.role !== 'member' && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="flex gap-2">
                    <TextInput
                      id="password"
                      name="password"
                      type="text"
                      value={form.password}
                      onChange={handleInputChange}
                      required={form.role !== 'member'}
                      className="flex-1"
                    />
                    <Button type="button" onClick={sugerirPassword} size="xs">
                      Generar
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <TextInput id="phone" name="phone" value={form.phone} onChange={handleInputChange} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="pronoun">Pronombre</Label>
                  <TextInput id="pronoun" name="pronoun" value={form.pronoun} onChange={handleInputChange} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="position">Cargo</Label>
                  <TextInput id="position" name="position" value={form.position} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="typeDocument">Tipo de documento</Label>
                <Select id="typeDocument" name="typeDocument" value={form.typeDocument} onChange={handleInputChange}>
                  <option value="">Seleccionar...</option>
                  <option value="cc">CC</option>
                  <option value="ce">CE</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="numDocument">Número de documento</Label>
                <TextInput id="numDocument" name="numDocument" value={form.numDocument} onChange={handleInputChange} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifyEmailMessages"
                  checked={form.notifyEmailMessages}
                  onChange={(e) => setForm({ ...form, notifyEmailMessages: e.target.checked })}
                />
                <Label htmlFor="notifyEmailMessages">Notificar por email cuando reciba mensajes</Label>
              </div>
              {error && <Alert color="failure">{error}</Alert>}
              <Button type="submit" color="blue" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : selectedUser ? 'Actualizar' : 'Crear usuario'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Modal Eliminar */}
        <Modal show={showDeleteModal} onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
          <Modal.Header>Confirmar eliminación</Modal.Header>
          <Modal.Body>
            <p className="text-gray-600">
              ¿Estás seguro de eliminar a{' '}
              <strong>{userToDelete ? [userToDelete.firstName, userToDelete.lastName].filter(Boolean).join(' ') : ''}</strong> (
              {userToDelete?.email})? Esta acción no se puede deshacer y se eliminará también su cuenta de Firebase.
            </p>
            {error && <Alert color="failure" className="mt-2">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button color="failure" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
            <Button color="gray" onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}
