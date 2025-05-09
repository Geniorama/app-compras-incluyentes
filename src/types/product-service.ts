import type { SanityImage } from "./sanity";

export interface SanityProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  sku?: string;
  images: SanityImage[];
  createdAt: string;
  updatedAt: string;
}

export interface SanityService {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  duration?: string;
  modality?: string;
  availability?: string;
  images: SanityImage[];
  createdAt: string;
  updatedAt: string;
}

export type Product = SanityProduct;
export type Service = SanityService;

// Re-exportar SanityImage para mantener la consistencia
export type { SanityImage }; 