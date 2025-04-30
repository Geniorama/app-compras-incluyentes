'use client';

import { Button, Card } from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";
import { HiOutlineBell, HiOutlineTrash, HiCheck } from "react-icons/hi";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsView() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Nuevo pedido recibido',
            message: 'Has recibido un nuevo pedido de Juan Pérez',
            type: 'info',
            isRead: false,
            createdAt: '2024-02-20T10:00:00Z'
        },
        {
            id: '2',
            title: 'Producto actualizado',
            message: 'El producto "Laptop HP" ha sido actualizado exitosamente',
            type: 'success',
            isRead: true,
            createdAt: '2024-02-19T15:30:00Z'
        },
        // Agrega más notificaciones de ejemplo según necesites
    ]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const deleteNotification = (notificationId: string) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    };

    const deleteAllNotifications = () => {
        setNotifications([]);
    };

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col md:flex-row container mx-auto mt-4 md:mt-10 px-4 md:px-0">
            <DashboardSidebar />
            <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <HiOutlineBell className="h-5 w-5 md:h-6 md:w-6" />
                        Notificaciones
                    </h1>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                            color="gray"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={notifications.every(n => n.isRead)}
                            className="w-full sm:w-auto text-sm"
                        >
                            <HiCheck className="mr-2 h-4 w-4" />
                            <span className="whitespace-nowrap">Marcar todas como leídas</span>
                        </Button>
                        <Button
                            color="failure"
                            size="sm"
                            onClick={deleteAllNotifications}
                            disabled={notifications.length === 0}
                            className="w-full sm:w-auto text-sm"
                        >
                            <HiOutlineTrash className="mr-2 h-4 w-4" />
                            <span className="whitespace-nowrap">Eliminar todas</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card>
                            <div className="text-center py-4 text-gray-500">
                                No tienes notificaciones
                            </div>
                        </Card>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-3 md:p-4 rounded-lg border ${getNotificationStyle(notification.type)} ${
                                    !notification.isRead ? 'border-l-4' : ''
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base break-words">
                                            {notification.title}
                                        </h3>
                                        <p className="mt-1 text-gray-600 text-sm break-words">
                                            {notification.message}
                                        </p>
                                        <p className="mt-2 text-xs md:text-sm text-gray-500">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 self-end sm:self-start">
                                        {!notification.isRead && (
                                            <Button
                                                color="gray"
                                                size="xs"
                                                onClick={() => markAsRead(notification.id)}
                                                className="min-w-[32px] h-8"
                                            >
                                                <HiCheck className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            color="failure"
                                            size="xs"
                                            onClick={() => deleteNotification(notification.id)}
                                            className="min-w-[32px] h-8"
                                        >
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 