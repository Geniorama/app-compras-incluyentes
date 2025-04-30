'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sanityClient } from '@/lib/sanity.client';
import { Button, TextInput, Textarea, Avatar, Modal, Tabs, Spinner } from 'flowbite-react';
import DashboardNavbar from '@/components/dashboard/Navbar';
import { HiOutlineMailOpen, HiPaperAirplane, HiTrash, HiSearch } from 'react-icons/hi';

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
  receiver: {
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

export default function MensajesView() {
  const { user } = useAuth();
  const [mensajesRecibidos, setMensajesRecibidos] = useState<Message[]>([]);
  const [mensajesEnviados, setMensajesEnviados] = useState<Message[]>([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Message | null>(null);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenidoNuevo, setContenidoNuevo] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchMensajes();
    }
  }, [user]);

  const fetchMensajes = async () => {
    try {
      setLoading(true);
      // Obtener mensajes recibidos
      const recibidos = await sanityClient.fetch(
        `*[_type == "message" && receiver._ref == $userId && !deleted] | order(createdAt desc) {
          _id,
          subject,
          content,
          createdAt,
          read,
          sender->{ _id, firstName, lastName, photo },
          receiver->{ _id, firstName, lastName, photo }
        }`,
        { userId: user?.uid }
      );
      setMensajesRecibidos(recibidos);

      // Obtener mensajes enviados
      const enviados = await sanityClient.fetch(
        `*[_type == "message" && sender._ref == $userId && !deleted] | order(createdAt desc) {
          _id,
          subject,
          content,
          createdAt,
          read,
          sender->{ _id, firstName, lastName, photo },
          receiver->{ _id, firstName, lastName, photo }
        }`,
        { userId: user?.uid }
      );
      setMensajesEnviados(enviados);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeido = async (mensajeId: string) => {
    try {
      await sanityClient
        .patch(mensajeId)
        .set({ read: true })
        .commit();
      
      await fetchMensajes();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const eliminarMensaje = async (mensajeId: string) => {
    try {
      await sanityClient
        .patch(mensajeId)
        .set({ deleted: true })
        .commit();
      await fetchMensajes();
      setMensajeSeleccionado(null);
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
    }
  };

  const enviarMensaje = async () => {
    if (!destinatarioId.trim() || !contenidoNuevo.trim() || !asunto.trim()) return;

    try {
      await sanityClient.create({
        _type: 'message',
        subject: asunto,
        content: contenidoNuevo,
        sender: {
          _type: 'reference',
          _ref: user?.uid
        },
        receiver: {
          _type: 'reference',
          _ref: destinatarioId
        },
        createdAt: new Date().toISOString(),
        read: false,
        deleted: false
      });

      setShowNuevoMensaje(false);
      setDestinatarioId('');
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
      `${mensaje.receiver.firstName} ${mensaje.receiver.lastName}`.toLowerCase().includes(termino)
    );
  };

  const renderMensajeItem = (mensaje: Message, tipo: 'recibido' | 'enviado') => {
    const esMensajeSeleccionado = mensajeSeleccionado?._id === mensaje._id;
    const persona = tipo === 'recibido' ? mensaje.sender : mensaje.receiver;
    
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
            img={persona.photo ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${persona.photo.asset._ref}` : undefined}
            rounded
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="font-medium truncate">
                {persona.firstName} {persona.lastName}
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
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8 pt-20">
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
                    img={mensajeSeleccionado?.sender.photo ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${mensajeSeleccionado.sender.photo.asset._ref}` : undefined}
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
                <Button
                  color="failure"
                  size="sm"
                  onClick={() => mensajeSeleccionado && eliminarMensaje(mensajeSeleccionado._id)}
                >
                  <HiTrash className="mr-2 h-5 w-5" />
                  Eliminar
                </Button>
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
                  ID del destinatario
                </label>
                <TextInput
                  type="text"
                  value={destinatarioId}
                  onChange={(e) => setDestinatarioId(e.target.value)}
                  placeholder="Ingresa el ID del destinatario"
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
              onClick={enviarMensaje}
              disabled={!destinatarioId.trim() || !contenidoNuevo.trim() || !asunto.trim()}
            >
              Enviar mensaje
            </Button>
            <Button color="gray" onClick={() => setShowNuevoMensaje(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
} 