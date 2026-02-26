'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Spinner, Alert, Badge } from 'flowbite-react';
import DashboardNavbar from '@/components/dashboard/Navbar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { HiOutlineOfficeBuilding, HiCalendar, HiCurrencyDollar, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface SanityImage {
  asset?: { _ref: string };
}


interface Opportunity {
  _id: string;
  title: string;
  cover?: SanityImage;
  startDate: string;
  maxApplicationDate: string;
  description: string;
  requirements?: string;
  contractValue?: number;
  status: string;
  company?: {
    _id: string;
    nameCompany: string;
    logo?: SanityImage;
  };
  applications?: Array<{ _id: string; nameCompany: string }>;
}

function getImageUrl(logo?: SanityImage): string {
  if (!logo?.asset?._ref) return '';
  const ref = logo.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface OportunidadDetailViewProps {
  id: string;
}

export default function OportunidadDetailView({ id }: OportunidadDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setOpportunity(data.opportunity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const canApply = opportunity?.status === 'open' && user?.company?._id && opportunity.company?._id !== user.company._id;

  const checkIfApplied = () => {
    if (!opportunity?.applications || !user?.company?._id) return false;
    return opportunity.applications.some((a) => a._id === user.company?._id);
  };

  useEffect(() => {
    if (opportunity && user) {
      setAlreadyApplied(checkIfApplied());
    }
  }, [opportunity, user]);

  const handleApply = async () => {
    if (!user?.uid || !id) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/opportunities/${id}/apply`, {
        method: 'POST',
        headers: { 'x-user-id': user.uid },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al postular');
      toast.success('Postulación registrada correctamente');
      setAlreadyApplied(true);
      const updated = await fetch(`/api/opportunities/${id}`).then((r) => r.json());
      setOpportunity(updated.opportunity);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al postular');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex justify-center items-center">
          <Spinner size="xl" />
        </div>
      </>
    );
  }

  if (!opportunity) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <Alert color="failure">Oportunidad no encontrada.</Alert>
            <Link href="/oportunidades" className="inline-block mt-4">
              <Button color="gray">Volver a oportunidades</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isClosed = opportunity.status === 'closed';
  const isExpired = new Date(opportunity.maxApplicationDate) < new Date();

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/oportunidades" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <HiArrowLeft className="w-5 h-5" />
            Volver a oportunidades
          </Link>

          <Card className="overflow-hidden">
            <div className="h-48 sm:h-64 -mx-4 -mt-4 mb-6 overflow-hidden">
              {opportunity.cover?.asset?._ref ? (
                <img
                  src={getImageUrl(opportunity.cover)}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge color={opportunity.status === 'open' ? 'success' : opportunity.status === 'closed' ? 'failure' : 'gray'}>
                {opportunity.status === 'open' ? 'Abierta' : opportunity.status === 'closed' ? 'Cerrada' : 'Borrador'}
              </Badge>
              {isExpired && opportunity.status === 'open' && (
                <Badge color="failure">Postulaciones cerradas</Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{opportunity.title}</h1>

            {opportunity.company && (
              <Link href={`/empresas/${opportunity.company._id}`} className="flex items-center gap-3 mt-4 p-3 rounded-lg hover:bg-gray-50">
                {opportunity.company.logo ? (
                  <img src={getImageUrl(opportunity.company.logo)} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <span className="font-medium text-gray-900">{opportunity.company.nameCompany}</span>
              </Link>
            )}

            <div className="flex flex-wrap gap-6 mt-6 text-gray-600">
              <span className="flex items-center gap-2">
                <HiCalendar className="w-5 h-5" />
                Inicio: {formatDate(opportunity.startDate)}
              </span>
              <span className="flex items-center gap-2">
                <HiCalendar className="w-5 h-5" />
                Cierre postulaciones: {formatDate(opportunity.maxApplicationDate)}
              </span>
              {opportunity.contractValue && (
                <span className="flex items-center gap-2">
                  <HiCurrencyDollar className="w-5 h-5" />
                  Valor: {formatCurrency(opportunity.contractValue)}
                </span>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {opportunity.requirements && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Requisitos</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{opportunity.requirements}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              {!user ? (
                <Alert color="info">
                  <Link href={`/login?redirect=/oportunidades/${id}`}>
                    <Button color="blue">Iniciar sesión para postular tu empresa</Button>
                  </Link>
                </Alert>
              ) : !user.company?._id ? (
                <Alert color="warning">Tu usuario no tiene una empresa asociada. Actualiza tu perfil.</Alert>
              ) : opportunity.company?._id === user.company._id ? (
                <Alert color="info">Esta oportunidad fue publicada por tu empresa.</Alert>
              ) : alreadyApplied ? (
                <Alert color="success">Tu empresa ya está postulada a esta oportunidad.</Alert>
              ) : isClosed || isExpired ? (
                <Alert color="failure">Las postulaciones están cerradas.</Alert>
              ) : (
                <Button color="blue" onClick={handleApply} disabled={applying} className="w-full sm:w-auto">
                  {applying ? 'Postulando...' : 'Postular mi empresa'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
