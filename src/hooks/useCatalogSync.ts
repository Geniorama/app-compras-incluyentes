import { useEffect, useRef } from 'react';

interface UseCatalogSyncOptions {
  onCatalogUpdate?: () => void;
  syncInterval?: number; // en milisegundos
}

export const useCatalogSync = (options: UseCatalogSyncOptions = {}) => {
  const { onCatalogUpdate, syncInterval = 30000 } = options; // 30 segundos por defecto
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para notificar actualizaciones del catálogo
  const notifyCatalogUpdate = () => {
    if (onCatalogUpdate) {
      onCatalogUpdate();
    }
    
    // También podemos emitir un evento personalizado para que otros componentes lo escuchen
    window.dispatchEvent(new CustomEvent('catalog-updated'));
  };

  // Función para refrescar datos frescos del catálogo
  const refreshCatalogData = async () => {
    try {
      const response = await fetch('/api/catalog/fresh');
      if (response.ok) {
        notifyCatalogUpdate();
        return true;
      }
    } catch (error) {
      console.error('Error refreshing catalog data:', error);
    }
    return false;
  };

  // Configurar sincronización automática
  useEffect(() => {
    if (syncInterval > 0) {
      intervalRef.current = setInterval(() => {
        refreshCatalogData();
      }, syncInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncInterval]);

  return {
    refreshCatalogData,
    notifyCatalogUpdate
  };
};
