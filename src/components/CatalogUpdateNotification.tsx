"use client";

import { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { HiRefresh, HiX } from 'react-icons/hi';

interface CatalogUpdateNotificationProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function CatalogUpdateNotification({ onRefresh, isRefreshing = false }: CatalogUpdateNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleCatalogUpdate = () => {
      setShowNotification(true);
      setLastUpdate(new Date());
    };

    window.addEventListener('catalog-updated', handleCatalogUpdate);
    
    return () => {
      window.removeEventListener('catalog-updated', handleCatalogUpdate);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">
            Catálogo actualizado
          </h4>
          <p className="text-xs text-blue-600 mb-3">
            {lastUpdate ? `Última actualización: ${lastUpdate.toLocaleTimeString()}` : 'Nuevos productos disponibles'}
          </p>
          <div className="flex gap-2">
            <Button
              size="xs"
              color="blue"
              onClick={() => {
                onRefresh();
                setShowNotification(false);
              }}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <HiRefresh className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Ver cambios'}
            </Button>
            <Button
              size="xs"
              color="gray"
              onClick={() => setShowNotification(false)}
            >
              <HiX className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
