'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  recipientCompany: {
    _id: string;
    nameCompany: string;
    logo?: {
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

export default function MensajesView() {
  const { user } = useAuth();
  const [mensajesRecibidos, setMensajesRecibidos] = useState<Message[]>([]);
  const [mensajesEnviados, setMensajesEnviados] = useState<Message[]>([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Message | null>(null);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [destinatarioEmpresaId, setDestinatarioEmpresaId] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenidoNuevo, setContenidoNuevo] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [empresaSearchTerm, setEmpresaSearchTerm] = useState('');
  const empresaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMensajes();
      fetchEmpresas();
      
      // Verificar si hay un parámetro de empresa en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const empresaId = urlParams.get('empresa');
      if (empresaId) {
        setDestinatarioEmpresaId(empresaId);
        setShowNuevoMensaje(true);
        // Limpiar la URL
        window.history.replaceState({}, '', '/dashboard/mensajes');
      }
    }
  }, [user]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (empresaDropdownRef.current && !empresaDropdownRef.current.contains(event.target as Node)) {
        setShowEmpresaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await fetch('/api/companies');
      const data = await response.json();
      // Filtrar para excluir la empresa del usuario actual
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

  const fetchMensajes = async () => {
    try {
      setLoading(true);
      // Obtener mensajes recibidos (por empresa)
      const recibidosRes = await fetch(`/api/messages?companyId=${user?.company?._id}`);
      const recibidosData = await recibidosRes.json();
      setMensajesRecibidos(recibidosData.messages || []);

      // Obtener mensajes enviados (por usuario)
      const enviadosRes = await fetch(`/api/messages?senderId=${user?.uid}`);
      const enviadosData = await enviadosRes.json();
      setMensajesEnviados(enviadosData.messages || []);
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
    if (!destinatarioEmpresaId.trim() || !contenidoNuevo.trim() || !asunto.trim()) return;

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: asunto,
          content: contenidoNuevo,
          senderId: user?.uid,
          recipientCompanyId: destinatarioEmpresaId
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      setShowNuevoMensaje(false);
      setDestinatarioEmpresaId('');
      setAsunto('');
      setContenidoNuevo('');
      setEmpresaSearchTerm('');
      await fetchMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const responderMensaje = (mensaje: Message) => {
    // Para responder, necesitamos enviar el mensaje a la empresa remitente original
    const empresaRemitente = mensaje.senderCompany._id;
    const empresaRemitenteNombre = mensaje.senderCompany.nameCompany;
    setDestinatarioEmpresaId(empresaRemitente);
    setEmpresaSearchTerm(empresaRemitenteNombre);
    setAsunto(`Re: ${mensaje.subject}`);
    setShowNuevoMensaje(true);
    setMensajeSeleccionado(null);
  };

  const abrirEmpresa = (empresaId: string) => {
    window.open(`/empresas/${empresaId}`, '_blank');
  };

  const filtrarMensajes = (mensajes: Message[]) => {
    if (!searchTerm) return mensajes;
    const termino = searchTerm.toLowerCase();
    return mensajes.filter(mensaje => 
      mensaje.subject.toLowerCase().includes(termino) ||
      mensaje.content.toLowerCase().includes(termino) ||
      mensaje.senderCompany.nameCompany.toLowerCase().includes(termino) ||
      mensaje.recipientCompany.nameCompany.toLowerCase().includes(termino)
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
    setShowEmpresaDropdown(false);
  };

  function getImageUrl(image: { asset?: { _ref: string } }): string {
    if (!image || !image.asset) return '/images/placeholder-product.png';
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
  }

  const renderMensajeItem = (mensaje: Message, tipo: 'recibido' | 'enviado') => {
    const esMensajeSeleccionado = mensajeSeleccionado?._id === mensaje._id;
    const esMensajeInterno = tipo === 'recibido' && mensaje.senderCompany._id === user?.company?._id;
    
    // Para mensajes recibidos, mostrar la empresa remitente
    // Para mensajes enviados, mostrar la empresa destinataria
    const empresaMostrar = tipo === 'recibido' ? mensaje.senderCompany : mensaje.recipientCompany;
    const logoEmpresa = empresaMostrar.logo ? getImageUrl(empresaMostrar.logo) : undefined;

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
          <Avatar img={logoEmpresa} rounded />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirEmpresa(empresaMostrar._id);
                  }}
                  className="font-medium truncate text-left hover:text-blue-600 transition-colors"
                  title="Ver empresa"
                >
                  {empresaMostrar.nameCompany}
                </button>
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
    <div className="flex container mx-auto mt-10">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa destinataria
                </label>
                <div className="relative" ref={empresaDropdownRef}>
                  <TextInput
                    type="text"
                    placeholder="Buscar empresa..."
                    value={empresaSearchTerm}
                    onChange={(e) => {
                      setEmpresaSearchTerm(e.target.value);
                      setShowEmpresaDropdown(true);
                      if (!e.target.value) {
                        setDestinatarioEmpresaId('');
                      }
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
              disabled={!destinatarioEmpresaId.trim() || !contenidoNuevo.trim() || !asunto.trim()}
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