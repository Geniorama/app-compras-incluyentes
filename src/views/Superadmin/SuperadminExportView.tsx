'use client';

import { Button, Card } from 'flowbite-react';
import { HiOutlineDownload } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';

export default function SuperadminExportView() {
  const { user } = useAuth();

  const exportCsv = (type: string) => {
    if (!user?.uid) return;
    fetch(`/api/superadmin/export?type=${type}`, {
      headers: { 'x-user-id': user.uid },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Error al exportar:', err));
  };

  return (
    <div className="flex container mx-auto mt-10">
      <SuperadminSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Exportar datos (CSV)</h1>
      <p className="text-gray-600 mb-6">
        Descarga los datos de la plataforma en formato CSV para análisis externo.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex flex-col items-center text-center p-4">
            <HiOutlineDownload className="h-12 w-12 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Usuarios</h3>
            <p className="text-sm text-gray-500 mb-4">
              Listado completo de usuarios registrados
            </p>
            <Button onClick={() => exportCsv('users')}>Descargar CSV</Button>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center p-4">
            <HiOutlineDownload className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Empresas</h3>
            <p className="text-sm text-gray-500 mb-4">
              Listado completo de empresas
            </p>
            <Button onClick={() => exportCsv('companies')}>Descargar CSV</Button>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center p-4">
            <HiOutlineDownload className="h-12 w-12 text-purple-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Categorías</h3>
            <p className="text-sm text-gray-500 mb-4">
              Listado de categorías de productos/servicios
            </p>
            <Button onClick={() => exportCsv('categories')}>Descargar CSV</Button>
          </div>
        </Card>
      </div>
      </main>
    </div>
  );
}
