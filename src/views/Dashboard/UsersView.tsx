"use client";
import { useEffect, useState, useRef } from "react";
import { Table, Button, Spinner, Modal, TextInput, Label, Select, Alert, Checkbox } from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import InternationalPhoneInput from "@/components/InternationalPhoneInput ";
import { HiUser } from "react-icons/hi";

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
  publicProfile?: boolean;
  notifyEmailMessages?: boolean;
  photo?: { _type?: string; asset?: { _ref?: string } };
}

function getImageUrl(image: User["photo"]): string {
  if (!image?.asset?._ref) return "";
  const ref = image.asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp");
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
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
    publicProfile: false,
    notifyEmailMessages: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [companySize, setCompanySize] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      fetchUsers();
      fetchCompanySize();
    }
    // fetchUsers, fetchCompanySize definidos en el componente; omitidos para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const fetchCompanySize = async () => {
    if (!user?.uid) return;
    try {
      const response = await fetch(`/api/profile/get?userId=${user.uid}`);
      const data = await response.json();
      if (data.success && data.data.company?.companySize) {
        setCompanySize(data.data.company.companySize);
      }
    } catch (error) {
      console.error('Error al obtener el tamaño de la empresa:', error);
    }
  };

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. Máximo 10MB. Por favor, redimensiona la foto antes de subirla.');
        return;
      }
      setError('');
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSubmitting(true);
    setError('');
    try {
      let photoAsset: { _type: string; asset: { _type: string; _ref: string } } | undefined;
      if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const uploadRes = await fetch("/api/upload-image", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Error al subir la foto de perfil");
        const uploadData = await uploadRes.json();
        photoAsset = { _type: "image", asset: uploadData.asset };
      }

      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({ ...form, inviterUid: user.uid, photo: photoAsset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al invitar usuario');
      setShowModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '', pronoun: '', position: '', typeDocument: '', numDocument: '', photo: '', publicProfile: false, notifyEmailMessages: false });
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

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setPhotoFile(null);
    setPhotoPreview(userToEdit.photo ? getImageUrl(userToEdit.photo) : null);
    setForm({
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      email: userToEdit.email,
      password: '',
      role: userToEdit.role || 'user',
      phone: userToEdit.phone || '',
      pronoun: userToEdit.pronoun || '',
      position: userToEdit.position || '',
      typeDocument: userToEdit.typeDocument || '',
      numDocument: userToEdit.numDocument || '',
      photo: '',
      publicProfile: userToEdit.publicProfile ?? false,
      notifyEmailMessages: userToEdit.notifyEmailMessages ?? false,
    });
    setShowModal(true);
  };

  // Establecer publicProfile según companySize solo cuando se abre el modal para nuevo usuario
  useEffect(() => {
    if (showModal && !selectedUser && companySize) {
      if (companySize !== "grande") {
        // Si no es grande, el perfil debe ser público obligatoriamente
        setForm(prev => ({ ...prev, publicProfile: true }));
      } else {
        // Si es grande, establecer el valor por defecto a false (pueden cambiarlo)
        setForm(prev => ({ ...prev, publicProfile: false }));
      }
    }
  }, [showModal, selectedUser, companySize]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !user?.uid) return;

    setIsSubmitting(true);
    setError('');
    try {
      let photoToSend: { _type: string; asset: { _type: string; _ref: string } } | undefined;
      if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const uploadRes = await fetch("/api/upload-image", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Error al subir la foto de perfil");
        const uploadData = await uploadRes.json();
        photoToSend = { _type: "image", asset: uploadData.asset };
      }

      const res = await fetch(`/api/users?id=${selectedUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({ ...form, ...(photoToSend && { photo: photoToSend }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario');
      setShowModal(false);
      setSelectedUser(null);
      setPhotoFile(null);
      setPhotoPreview(null);
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
    if (showModal && !selectedUser && form.role !== 'member') {
      sugerirPassword();
    }
  }, [showModal, selectedUser, form.role]);

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
            setPhotoFile(null);
            setPhotoPreview(null);
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
          setPhotoFile(null);
          setPhotoPreview(null);
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
            publicProfile: false,
            notifyEmailMessages: false,
          });
        }}>
          <Modal.Header>{selectedUser ? 'Editar usuario' : 'Agregar usuario'}</Modal.Header>
          <Modal.Body>
            <form onSubmit={selectedUser ? handleUpdateUser : handleAddUser} className="flex flex-col gap-4">
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
                    <Button type="button" color="light" size="sm" onClick={() => photoInputRef.current?.click()}>
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
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select id="role" name="role" value={form.role} onChange={handleInputChange}>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="member">Miembro</option>
                </Select>
              </div>
              {!selectedUser && form.role !== 'member' && (
              <div>
                <Label htmlFor="password">Contraseña sugerida</Label>
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
                  <Button type="button" onClick={sugerirPassword} size="xs" className="flex-grow-0 inline-block">
                    Regenerar
                  </Button>
                </div>
              </div>
              )}
              {!selectedUser && form.role === 'member' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los miembros no requieren contraseña ni acceso al sistema. Solo se almacena su información en la compañía.
                  </p>
                </div>
              )}
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
              {/* Notificaciones por email */}
              <div className="flex items-start">
                <Checkbox
                  id="notifyEmailMessages"
                  checked={form.notifyEmailMessages}
                  onChange={(e) => setForm({ ...form, notifyEmailMessages: e.target.checked })}
                  className="mt-1 mr-2"
                />
                <div>
                  <Label htmlFor="notifyEmailMessages" className="font-medium">
                    Notificar por email cuando reciba mensajes
                  </Label>
                  <p className="text-xs text-gray-600">
                    Si está activo, el usuario recibirá un correo cuando reciba mensajes en la plataforma.
                  </p>
                </div>
              </div>
              {/* Campo de perfil público - solo visible y habilitado para empresas grandes */}
              {companySize === "grande" && (
                <div className="flex items-start">
                  <Checkbox
                    id="publicProfile"
                    checked={form.publicProfile}
                    onChange={(e) => setForm({ ...form, publicProfile: e.target.checked })}
                    className="mt-1 mr-2"
                  />
                  <div>
                    <Label htmlFor="publicProfile" className="font-medium">
                      Perfil público
                    </Label>
                    <p className="text-xs text-gray-600">
                      Activa esta opción para que el perfil del usuario sea visible públicamente en la plataforma.
                    </p>
                  </div>
                </div>
              )}
              {/* Mensaje informativo para empresas no grandes */}
              {companySize && companySize !== "grande" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El perfil del usuario será público automáticamente ya que la empresa no es de tamaño grande.
                  </p>
                </div>
              )}
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