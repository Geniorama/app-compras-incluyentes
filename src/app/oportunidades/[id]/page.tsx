'use client';

import { useParams } from 'next/navigation';
import OportunidadDetailView from '@/views/Oportunidades/OportunidadDetailView';

export default function OportunidadPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) return null;

  return <OportunidadDetailView id={id} />;
}
