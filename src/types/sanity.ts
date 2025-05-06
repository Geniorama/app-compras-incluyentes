import { SanityImage } from "./index";

export interface SanityDocument {
  _id: string;
  _type: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityProductDocument extends SanityDocument {
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  sku?: string;
  images: SanityImage[];
  company: {
    _type: "reference";
    _ref: string;
  };
}

export interface SanityServiceDocument extends SanityDocument {
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  duration?: string;
  modality?: string;
  availability?: string;
  images: SanityImage[];
  company: {
    _type: "reference";
    _ref: string;
  };
}

export interface SanityDocumentStub {
  _type: string;
  [key: string]: unknown;
} 