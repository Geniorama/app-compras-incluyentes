"use client";
import { useEffect, useState } from "react";
import { Table, Button, Spinner, Modal, TextInput, Label, Select, Alert } from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import InternationalPhoneInput from "@/components/InternationalPhoneInput ";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  phone?: string;
  pronoun?: string;
  position?: string;
  typeDocument?: string;
  numDocument?: string;
}

function generarPassword(longitud = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=,.?";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    pronoun: '',
    position: '',
    typeDocument: '',
    numDocument: '',
    photo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      fetchUsers();
    }
  }, [user?.uid]);

    const fetchUsers = async () => {
    if (!user?.uid) return;
    
      setLoading(true);
    try {
      const res = await fetch("/api/users", {
        headers: {
          'x-user-id': user.uid
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener usuarios');
      setUsers(data.data?.users || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al obtener usuarios');
      }
    } finally {
      setLoading(false);
    }
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({ ...form, inviterUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al invitar usuario');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '', pronoun: '', position: '', typeDocument: '', numDocument: '', photo: '' });
      await fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role || 'user',
      phone: user.phone || '',
      pronoun: user.pronoun || '',
      position: user.position || '',
      typeDocument: user.typeDocument || '',
      numDocument: user.numDocument || '',
      photo: '',
    });
    setShowModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !user?.uid) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario');
      setShowModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sugerirPassword = () => {
    const nueva = generarPassword();
    setForm(f => ({ ...f, password: nueva }));
  };

  useEffect(() => {
    if (showModal && !selectedUser) {
      sugerirPassword();
    }
  }, [showModal, selectedUser]);

  if (!user?.uid) {
    return (
      <div className="flex container mx-auto mt-10">
        <DashboardSidebar />
        <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
          <Alert color="failure">
            No tienes permisos para ver esta página
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Usuarios y Permisos</h1>
          <Button color="blue" onClick={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}>Agregar usuario</Button>
        </div>
        {error && <Alert color="failure" className="mb-4">{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : (
          <Table>
            <Table.Head>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Rol</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user._id}>
                  <Table.Cell>{user.firstName} {user.lastName}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.role || "user"}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button size="xs" color="blue" onClick={() => handleEditUser(user)}>
                        Editar
                      </Button>
                      <span className="text-gray-400 text-xs">No se puede eliminar</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <Modal show={showModal} onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
          setForm({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'user',
            phone: '',
            pronoun: '',
            position: '',
            typeDocument: '',
            numDocument: '',
            photo: '',
          });
        }}>
          <Modal.Header>{selectedUser ? 'Editar usuario' : 'Agregar usuario'}</Modal.Header>
          <Modal.Body>
            <form onSubmit={selectedUser ? handleUpdateUser : handleAddUser} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <TextInput id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} required />
                </div>
                <div className="w-1/2">
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
              {!selectedUser && (
              <div>
                <Label htmlFor="password">Contraseña sugerida</Label>
                <div className="flex gap-2">
                  <TextInput
                    id="password"
                    name="password"
                    type="text"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                    className="flex-1"
                  />
                  <Button type="button" onClick={sugerirPassword} size="xs" className="flex-grow-0 inline-block">
                    Regenerar
                  </Button>
                </div>
              </div>
              )}
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select id="role" name="role" value={form.role} onChange={handleInputChange}>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <InternationalPhoneInput
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={async ({ target }) => { setForm({ ...form, phone: target.value }); return true; }}
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="pronoun">Pronombre</Label>
                  <TextInput id="pronoun" name="pronoun" value={form.pronoun} onChange={handleInputChange} />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="position">Cargo</Label>
                  <TextInput id="position" name="position" value={form.position} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="typeDocument">Tipo de documento</Label>
                <Select
                  id="typeDocument"
                  name="typeDocument"
                  value={form.typeDocument}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona...</option>
                  <option value="cc">CC</option>
                  <option value="ce">CE</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="numDocument">Número de documento</Label>
                <TextInput id="numDocument" name="numDocument" value={form.numDocument} onChange={handleInputChange} />
              </div>
              {error && <Alert color="failure">{error}</Alert>}
              <Button type="submit" color="blue" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : (selectedUser ? 'Actualizar usuario' : 'Agregar usuario')}
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      </main>
    </div>
  );
} 