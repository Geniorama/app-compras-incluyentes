import { createClient } from '@sanity/client'

// Cliente público para lectura
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-27',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  withCredentials: true
})

// Cliente para operaciones de escritura
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-27',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  withCredentials: true
}) 