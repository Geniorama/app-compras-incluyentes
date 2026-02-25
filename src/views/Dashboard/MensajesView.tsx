'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Button, TextInput, Textarea, Avatar, Modal, Tabs, Spinner } from 'flowbite-react';
import { HiOutlineMailOpen, HiPaperAirplane, HiSearch, HiReply, HiChevronDown } from 'react-icons/hi';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Message {
  _id: string;
  subject: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: {
      asset: {
        _ref: string;
      }
    }
  };
  senderCompany: {
    _id: string;
    nameCompany: string;
    logo?: {
      asset: {
        _ref: string;
      }
    }
  };
  recipientCompany?: {
    _id: string;
    nameCompany: string;
    logo?: {
      asset: {
        _ref: string;
      }
    }
  };
  recipientUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: {
      asset: {
        _ref: string;
      }
    }
  };
  content: string;
  createdAt: string;
  read: boolean;
}

interface Company {
  _id: string;
  nameCompany: string;
  logo?: {
    asset: {
      _ref: string;
    }
  }
}

interface VisibleUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position?: string;
  photo?: { asset: { _ref: string } };
  role?: string;
  company?: { _id: string; nameCompany: string };
}

export default function MensajesView() {
  const { user } = useAuth();
  const [mensajesRecibidos, setMensajesRecibidos] = useState<Message[]>([]);
  const [mensajesEnviados, setMensajesEnviados] = useState<Message[]>([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Message | null>(null);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [tipoDestinatario, setTipoDestinatario] = useState<'empresa' | 'persona'>('empresa');
  const [destinatarioEmpresaId, setDestinatarioEmpresaId] = useState('');
  const [destinatarioUserId, setDestinatarioUserId] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenidoNuevo, setContenidoNuevo] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [usuariosVisibles, setUsuariosVisibles] = useState<VisibleUser[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false);
  const [empresaSearchTerm, setEmpresaSearchTerm] = useState('');
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const empresaDropdownRef = useRef<HTMLDivElement>(null);
  const usuarioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMensajes();
      fetchEmpresas();
      fetchUsuariosVisibles();
      
      const urlParams = new URLSearchParams(window.location.search);
      const empresaId = urlParams.get('empresa');
      const userId = urlParams.get('user');
      if (empresaId) {
        setTipoDestinatario('empresa');
        setDestinatarioEmpresaId(empresaId);
        setDestinatarioUserId('');
        setShowNuevoMensaje(true);
        window.history.replaceState({}, '', '/dashboard/mensajes');
      } else if (userId) {
        setTipoDestinatario('persona');
        setDestinatarioUserId(userId);
        setDestinatarioEmpresaId('');
        setShowNuevoMensaje(true);
        window.history.replaceState({}, '', '/dashboard/mensajes');
      }
    }
  }, [user]);

  useEffect(() => {
    if (empresas.length > 0) {
      setEmpresaSearchTerm(empresas.find(empresa => empresa._id === destinatarioEmpresaId)?.nameCompany || '');
    }
  }, [empresas, destinatarioEmpresaId]);

  useEffect(() => {
    if (usuariosVisibles.length > 0 && destinatarioUserId) {
      const u = usuariosVisibles.find(us => us._id === destinatarioUserId);
      setUsuarioSearchTerm(u ? `${u.firstName} ${u.lastName}`.trim() || u.email || '' : '');
    }
  }, [usuariosVisibles, destinatarioUserId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (empresaDropdownRef.current && !empresaDropdownRef.current.contains(target)) {
        setShowEmpresaDropdown(false);
      }
      if (usuarioDropdownRef.current && !usuarioDropdownRef.current.contains(target)) {
        setShowUsuarioDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await fetch('/api/companies');
      const data = await response.json();
      const empresasFiltradas = (data.companies || []).filter(
        (empresa: Company) => empresa._id !== user?.company?._id
      );
      setEmpresas(empresasFiltradas);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const fetchUsuariosVisibles = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await fetch('/api/visible-users');
      const data = await response.json();
      setUsuariosVisibles(data.users || []);
    } catch (error) {
      console.error('Error al cargar usuarios visibles:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchMensajes = async () => {
    try {
      setLoading(true);
      const recibidos: Message[] = [];
      if (user?.company?._id) {
        const res = await fetch(`/api/messages?companyId=${user.company._id}`);
        const data = await res.json();
        recibidos.push(...(data.messages || []));
      }
      if (user?.uid) {
        const res = await fetch(`/api/messages?recipientUserId=${user.uid}`);
        const data = await res.json();
        recibidos.push(...(data.messages || []));
      }
      recibidos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMensajesRecibidos(recibidos);

      if (user?.uid) {
        const enviadosRes = await fetch(`/api/messages?senderId=${user.uid}`);
        const enviadosData = await enviadosRes.json();
        setMensajesEnviados(enviadosData.messages || []);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeido = async (mensajeId: string) => {
    try {
      await fetch('/api/messages/mark-as-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: mensajeId })
      });
      await fetchMensajes();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const enviarMensaje = async () => {
    const body: Record<string, string> = {
      subject: asunto,
      content: contenidoNuevo,
      senderId: user?.uid || ''
    };
    if (tipoDestinatario === 'empresa' && destinatarioEmpresaId.trim()) {
      body.recipientCompanyId = destinatarioEmpresaId;
    } else if (tipoDestinatario === 'persona' && destinatarioUserId.trim()) {
      body.recipientUserId = destinatarioUserId;
    } else {
      return;
    }
    if (!body.subject?.trim() || !body.content?.trim()) return;

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar mensaje');
      }

      if (data.emailEnviado === false) {
        toast.error(`Mensaje guardado, pero no se pudo enviar el email al destinatario. ${data.emailError ? `(${data.emailError})` : ''}`);
      }

      setShowNuevoMensaje(false);
      setTipoDestinatario('empresa');
      setDestinatarioEmpresaId('');
      setDestinatarioUserId('');
      setAsunto('');
      setContenidoNuevo('');
      setEmpresaSearchTerm('');
      setUsuarioSearchTerm('');
      toast.success('Mensaje enviado correctamente');
      await new Promise(r => setTimeout(r, 600));
      await fetchMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar el mensaje');
    }
  };

  const responderMensaje = (mensaje: Message) => {
    setAsunto(`Re: ${mensaje.subject}`);
    setMensajeSeleccionado(null);
    if (mensaje.recipientUser) {
      setTipoDestinatario('persona');
      setDestinatarioUserId(mensaje.sender._id);
      setUsuarioSearchTerm(`${mensaje.sender.firstName} ${mensaje.sender.lastName}`.trim());
      setDestinatarioEmpresaId('');
      setEmpresaSearchTerm('');
    } else {
      setTipoDestinatario('empresa');
      setDestinatarioEmpresaId(mensaje.senderCompany._id);
      setEmpresaSearchTerm(mensaje.senderCompany.nameCompany);
      setDestinatarioUserId('');
      setUsuarioSearchTerm('');
    }
    setShowNuevoMensaje(true);
  };

  const abrirEmpresa = (empresaId: string) => {
    window.open(`/empresas/${empresaId}`, '_blank');
  };

  const filtrarMensajes = (mensajes: Message[]) => {
    if (!searchTerm) return mensajes;
    const termino = searchTerm.toLowerCase();
    const nombreDestinatario = (m: Message) =>
      m.recipientCompany?.nameCompany ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}`.trim() : '');
    return mensajes.filter(mensaje =>
      mensaje.subject.toLowerCase().includes(termino) ||
      mensaje.content.toLowerCase().includes(termino) ||
      mensaje.senderCompany.nameCompany.toLowerCase().includes(termino) ||
      nombreDestinatario(mensaje).toLowerCase().includes(termino) ||
      (mensaje.sender.firstName + ' ' + mensaje.sender.lastName).toLowerCase().includes(termino)
    );
  };

  const filtrarUsuarios = () => {
    if (!usuarioSearchTerm) return usuariosVisibles;
    const termino = usuarioSearchTerm.toLowerCase();
    return usuariosVisibles.filter(u =>
      (u.firstName + ' ' + u.lastName).toLowerCase().includes(termino) ||
      (u.email || '').toLowerCase().includes(termino) ||
      (u.company?.nameCompany || '').toLowerCase().includes(termino)
    );
  };

  const filtrarEmpresas = () => {
    if (!empresaSearchTerm) return empresas;
    const termino = empresaSearchTerm.toLowerCase();
    return empresas.filter(empresa => 
      empresa.nameCompany.toLowerCase().includes(termino)
    );
  };

  const seleccionarEmpresa = (empresa: Company) => {
    setDestinatarioEmpresaId(empresa._id);
    setEmpresaSearchTerm(empresa.nameCompany);
    setDestinatarioUserId('');
    setShowEmpresaDropdown(false);
  };

  const seleccionarUsuario = (u: VisibleUser) => {
    setDestinatarioUserId(u._id);
    setUsuarioSearchTerm(`${u.firstName} ${u.lastName}`.trim() || u.email || '');
    setDestinatarioEmpresaId('');
    setShowUsuarioDropdown(false);
  };

  function getImageUrl(image: { asset?: { _ref: string } }): string {
    if (!image || !image.asset) return '/images/placeholder-product.png';
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
  }

  const renderMensajeItem = (mensaje: Message, tipo: 'recibido' | 'enviado') => {
    const esMensajeSeleccionado = mensajeSeleccionado?._id === mensaje._id;
    const esMensajeInterno = tipo === 'recibido' && mensaje.senderCompany._id === user?.company?._id;
    const esP2P = !!mensaje.recipientUser;
    const empresaMostrar = tipo === 'recibido' ? mensaje.senderCompany : (mensaje.recipientCompany ?? null);
    const usuarioMostrar = tipo === 'recibido' ? (esP2P ? mensaje.sender : null) : (mensaje.recipientUser ?? null);
    const tituloMostrar = tipo === 'recibido'
      ? (esP2P ? `${mensaje.sender.firstName} ${mensaje.sender.lastName}`.trim() : empresaMostrar?.nameCompany)
      : (usuarioMostrar ? `${usuarioMostrar.firstName} ${usuarioMostrar.lastName}`.trim() : empresaMostrar?.nameCompany);
    const logoMostrar = esP2P && (tipo === 'recibido' ? mensaje.sender : usuarioMostrar)?.photo
      ? getImageUrl((tipo === 'recibido' ? mensaje.sender : usuarioMostrar)!.photo!)
      : empresaMostrar?.logo ? getImageUrl(empresaMostrar.logo) : undefined;

    return (
      <div 
        key={mensaje._id}
        className={`p-4 border-b cursor-pointer transition-colors ${
          esMensajeSeleccionado ? 'bg-blue-50' : 'hover:bg-gray-50'
        } ${!mensaje.read && tipo === 'recibido' ? 'bg-blue-50/30' : ''}`}
        onClick={() => {
          setMensajeSeleccionado(mensaje);
          if (!mensaje.read && tipo === 'recibido') {
            marcarComoLeido(mensaje._id);
          }
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar img={logoMostrar} rounded />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                {empresaMostrar ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEmpresa(empresaMostrar._id);
                    }}
                    className="font-medium truncate text-left hover:text-blue-600 transition-colors"
                    title="Ver empresa"
                  >
                    {tituloMostrar}
                  </button>
                ) : (
                  <span className="font-medium truncate block">{tituloMostrar}</span>
                )}
                {esMensajeInterno && (
                  <p className="text-xs text-gray-500">
                    Enviado por: {mensaje.sender.firstName} {mensaje.sender.lastName}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">
                {new Date(mensaje.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="font-medium text-sm text-gray-800 truncate">
              {mensaje.subject}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {mensaje.content}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex container mx-auto my-10">
      <DashboardSidebar />
      <main className="w-3/3 xl:w-3/4 px-3 sm:pl-10">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <TextInput
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={HiSearch}
                />
              </div>
              <Button color="blue" onClick={() => setShowNuevoMensaje(true)}>
                Nuevo mensaje
              </Button>
            </div>
          </div>

          <Tabs>
            <Tabs.Item active title="Recibidos" icon={HiOutlineMailOpen}>
              <div className="divide-y">
                {filtrarMensajes(mensajesRecibidos).map(mensaje => renderMensajeItem(mensaje, 'recibido'))}
              </div>
            </Tabs.Item>
            <Tabs.Item title="Enviados" icon={HiPaperAirplane}>
              <div className="divide-y">
                {filtrarMensajes(mensajesEnviados).map(mensaje => renderMensajeItem(mensaje, 'enviado'))}
              </div>
            </Tabs.Item>
          </Tabs>
        </div>

        {/* Modal para ver mensaje */}
        <Modal
          show={mensajeSeleccionado !== null}
          onClose={() => setMensajeSeleccionado(null)}
          size="xl"
        >
          <Modal.Header>
            {mensajeSeleccionado?.subject}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar
                    img={mensajeSeleccionado?.sender.photo ? getImageUrl(mensajeSeleccionado.sender.photo) : undefined}
                    rounded
                  />
                  <div>
                    <button
                      onClick={() => abrirEmpresa(mensajeSeleccionado?.senderCompany._id || '')}
                      className="font-medium hover:text-blue-600 transition-colors text-left"
                      title="Ver empresa"
                    >
                      {mensajeSeleccionado?.senderCompany.nameCompany}
                    </button>
                    <p className="text-sm text-gray-500">
                      Enviado por: {mensajeSeleccionado?.sender.firstName} {mensajeSeleccionado?.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mensajeSeleccionado?.createdAt && new Date(mensajeSeleccionado.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {mensajeSeleccionado && (
                  <Button
                    color="blue"
                    onClick={() => responderMensaje(mensajeSeleccionado)}
                    className="flex items-center gap-2"
                  >
                    <HiReply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {mensajeSeleccionado?.content}
              </p>
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal para nuevo mensaje */}
        <Modal
          show={showNuevoMensaje}
          onClose={() => setShowNuevoMensaje(false)}
          size="xl"
        >
          <Modal.Header>
            Nuevo mensaje
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinatario</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDestinatario"
                      checked={tipoDestinatario === 'empresa'}
                      onChange={() => {
                        setTipoDestinatario('empresa');
                        setDestinatarioUserId('');
                        setUsuarioSearchTerm('');
                      }}
                    />
                    Empresa
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDestinatario"
                      checked={tipoDestinatario === 'persona'}
                      onChange={() => {
                        setTipoDestinatario('persona');
                        setDestinatarioEmpresaId('');
                        setEmpresaSearchTerm('');
                      }}
                    />
                    Persona
                  </label>
                </div>
                {tipoDestinatario === 'empresa' ? (
                  <div className="relative" ref={empresaDropdownRef}>
                    <TextInput
                      type="text"
                      placeholder="Buscar empresa..."
                      value={empresaSearchTerm}
                      onChange={(e) => {
                        setEmpresaSearchTerm(e.target.value);
                        setShowEmpresaDropdown(true);
                        if (!e.target.value) setDestinatarioEmpresaId('');
                      }}
                    onFocus={() => setShowEmpresaDropdown(true)}
                    disabled={loadingEmpresas}
                    icon={HiSearch}
                    rightIcon={HiChevronDown}
                    className="cursor-pointer"
                  />
                  {showEmpresaDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filtrarEmpresas().length === 0 ? (
                        <div className="p-3 text-gray-500 text-center">
                          {loadingEmpresas ? 'Cargando empresas...' : 'No se encontraron empresas'}
                        </div>
                      ) : (
                        filtrarEmpresas().map(empresa => (
                          <div
                            key={empresa._id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => seleccionarEmpresa(empresa)}
                          >
                            <div className="flex items-center gap-3">
                              {empresa.logo && (
                                <img
                                  src={getImageUrl(empresa.logo)}
                                  alt={empresa.nameCompany}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <span className="font-medium">{empresa.nameCompany}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                ) : (
                  <div className="relative" ref={usuarioDropdownRef}>
                    <TextInput
                      type="text"
                      placeholder="Buscar persona (nombre, email o empresa)..."
                      value={usuarioSearchTerm}
                      onChange={(e) => {
                        setUsuarioSearchTerm(e.target.value);
                        setShowUsuarioDropdown(true);
                        if (!e.target.value) setDestinatarioUserId('');
                      }}
                      onFocus={() => setShowUsuarioDropdown(true)}
                      disabled={loadingUsuarios}
                      icon={HiSearch}
                      rightIcon={HiChevronDown}
                      className="cursor-pointer"
                    />
                    {showUsuarioDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filtrarUsuarios().length === 0 ? (
                          <div className="p-3 text-gray-500 text-center">
                            {loadingUsuarios ? 'Cargando...' : 'No se encontraron usuarios con perfil visible'}
                          </div>
                        ) : (
                          filtrarUsuarios().map(u => (
                            <div
                              key={u._id}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => seleccionarUsuario(u)}
                            >
                              <div className="flex items-center gap-3">
                                {u.photo && (
                                  <img
                                    src={getImageUrl(u.photo)}
                                    alt={`${u.firstName} ${u.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                                  {u.company?.nameCompany && (
                                    <span className="block text-xs text-gray-500">{u.company.nameCompany}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <TextInput
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ingresa el asunto del mensaje"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <Textarea
                  value={contenidoNuevo}
                  onChange={(e) => setContenidoNuevo(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows={6}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              color="blue" 
              onClick={() => setShowConfirmModal(true)}
              disabled={(tipoDestinatario === 'empresa' ? !destinatarioEmpresaId.trim() : !destinatarioUserId.trim()) || !contenidoNuevo.trim() || !asunto.trim()}
            >
              Enviar mensaje
            </Button>
            <Button color="gray" onClick={() => setShowNuevoMensaje(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de confirmación */}
        <Modal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          size="md"
        >
          <Modal.Header>Confirmar envío</Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas enviar este mensaje?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="blue"
              onClick={async () => {
                setShowConfirmModal(false);
                await enviarMensaje();
              }}
            >
              Sí, enviar
            </Button>
            <Button color="gray" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
} 