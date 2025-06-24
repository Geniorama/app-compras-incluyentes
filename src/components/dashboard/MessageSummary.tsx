'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Spinner } from 'flowbite-react';
import { HiOutlineMailOpen } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface MessageSummaryProps {
  className?: string;
}

interface Message {
  _id: string;
  subject: string;
  sender: {
    firstName: string;
    lastName: string;
  };
  senderCompany: {
    nameCompany: string;
  };
  recipientCompany: {
    nameCompany: string;
  };
  createdAt: string;
  read: boolean;
}

export default function MessageSummary({ className = '' }: MessageSummaryProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company?._id) {
      fetchRecentMessages();
    }
  }, [user]);

  const fetchRecentMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?companyId=${user?.company?._id}&limit=5`);
      const data = await response.json();
      setRecentMessages(data.messages?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error al obtener mensajes recientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  if (!user?.company?._id) return null;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HiOutlineMailOpen className="h-5 w-5" />
          Mensajes Recientes
        </h3>
        <Button 
          size="sm" 
          color="blue"
          onClick={() => router.push('/dashboard/mensajes')}
        >
          Ver todos
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : recentMessages.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <HiOutlineMailOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No hay mensajes nuevos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentMessages.map((message) => {
            // const esMensajeInterno = message.senderCompany._id === user?.company?._id;
            const esMensajeInterno = true;
            
            return (
              <div 
                key={message._id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  !message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
                onClick={() => router.push('/dashboard/mensajes')}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      De: {message.senderCompany.nameCompany}
                    </p>
                    {esMensajeInterno && (
                      <p className="text-xs text-gray-500 truncate">
                        Por: {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
} 