'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from 'flowbite-react';
import { HiOutlineMailOpen } from 'react-icons/hi';

interface MessageNotificationProps {
  className?: string;
}

export default function MessageNotification({ className = '' }: MessageNotificationProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.company?._id || user?.uid) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.company?._id) params.set('companyId', user.company._id);
      if (user?.uid) params.set('userId', user.uid);
      if (params.toString()) {
        const response = await fetch(`/api/messages/unread-count?${params.toString()}`);
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error al obtener conteo de mensajes:', error);
    }
  };

  if (!user?.company?._id && !user?.uid) return null;

  return (
    <div className={`relative ${className}`}>
      <HiOutlineMailOpen className="h-6 w-6" />
      {unreadCount > 0 && (
        <Badge 
          color="red" 
          className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
} 