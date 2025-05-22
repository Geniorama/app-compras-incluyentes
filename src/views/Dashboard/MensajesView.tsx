'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, TextInput, Textarea, Avatar, Modal, Tabs, Spinner } from 'flowbite-react';
import { HiOutlineMailOpen, HiPaperAirplane, HiSearch } from 'react-icons/hi';
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
  company: {
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

  useEffect(() => {
    if (user) {
      fetchMensajes();
    }
  }, [user]);

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
          companyId: destinatarioEmpresaId
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      setShowNuevoMensaje(false);
      setDestinatarioEmpresaId('');
      setAsunto('');
      setContenidoNuevo('');
      await fetchMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const filtrarMensajes = (mensajes: Message[]) => {
    if (!searchTerm) return mensajes;
    const termino = searchTerm.toLowerCase();
    return mensajes.filter(mensaje => 
      mensaje.subject.toLowerCase().includes(termino) ||
      mensaje.content.toLowerCase().includes(termino) ||
      `${mensaje.sender.firstName} ${mensaje.sender.lastName}`.toLowerCase().includes(termino) ||
      `${mensaje.company.nameCompany}`.toLowerCase().includes(termino)
    );
  };

  function getImageUrl(image: any): string {
    if (!image || !image.asset) return '/images/placeholder-product.png';
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
  }

  const renderMensajeItem = (mensaje: Message, tipo: 'recibido' | 'enviado') => {
    const esMensajeSeleccionado = mensajeSeleccionado?._id === mensaje._id;
    // Para recibido, mostrar el remitente; para enviado, mostrar la empresa destinataria
    const nombrePersona = tipo === 'recibido'
      ? `${mensaje.sender.firstName} ${mensaje.sender.lastName}`
      : mensaje.company.nameCompany;
    const avatarImg = tipo === 'recibido'
      ? (mensaje.sender.photo ? getImageUrl(mensaje.sender.photo) : undefined)
      : (mensaje.company.logo ? getImageUrl(mensaje.company.logo) : undefined);

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
          <Avatar
            img={avatarImg}
            rounded
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="font-medium truncate">
                {nombrePersona}
              </p>
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
      <main className="w-3/3 xl:w-3/4 pl-10">
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
                    <p className="font-medium">
                      {mensajeSeleccionado?.sender.firstName} {mensajeSeleccionado?.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mensajeSeleccionado?.createdAt && new Date(mensajeSeleccionado.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {mensajeSeleccionado && (
                  <Button
                    color="blue"
                    onClick={() => {
                      setDestinatarioEmpresaId(mensajeSeleccionado.company._id || '');
                      setAsunto(`Re: ${mensajeSeleccionado.subject || ''}`);
                      setShowNuevoMensaje(true);
                      setMensajeSeleccionado(null);
                    }}
                  >
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
                  ID de la empresa destinataria
                </label>
                <TextInput
                  type="text"
                  value={destinatarioEmpresaId}
                  onChange={(e) => setDestinatarioEmpresaId(e.target.value)}
                  placeholder="Ingresa el ID de la empresa destinataria"
                />
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