"use client";
import { useEffect, useState } from "react";
import { Table, Button, Spinner, Modal, TextInput, Label, Select } from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import InternationalPhoneInput from "@/components/InternationalPhoneInput ";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
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
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inviterUid: user?.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al invitar usuario');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '', pronoun: '', position: '', typeDocument: '', numDocument: '', photo: '' });
      // Refrescar lista
      const resUsers = await fetch("/api/users");
      const dataUsers = await resUsers.json();
      setUsers(dataUsers.users || []);
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
    if (showModal) {
      sugerirPassword();
    }
    // eslint-disable-next-line
  }, [showModal]);

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Usuarios y Permisos</h1>
          <Button color="blue" onClick={() => setShowModal(true)}>Agregar usuario</Button>
        </div>
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
                    <Button size="xs">Editar</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>Agregar usuario</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
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
                <TextInput id="email" name="email" type="email" value={form.email} onChange={handleInputChange} required />
              </div>
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
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" color="blue" disabled={isSubmitting}>
                {isSubmitting ? 'Agregando...' : 'Agregar usuario'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      </main>
    </div>
  );
} 