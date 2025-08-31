import { createClient } from '@sanity/client';

// Cliente público para lectura
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: true, // Habilitamos el CDN para mejor rendimiento
  perspective: 'published', // Solo datos publicados
});

// Cliente para operaciones de escritura que requieren autenticación
export const getAuthenticatedClient = () => {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-05-03',
    useCdn: false, // Mantenemos false para escritura para datos frescos
    token: process.env.SANITY_API_TOKEN
  });
};

// Cliente para operaciones que requieren datos frescos pero no autenticación
export const getFreshClient = () => {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-05-03',
    useCdn: false, // Sin CDN para datos frescos
  });
};