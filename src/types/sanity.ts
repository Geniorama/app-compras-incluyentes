export interface SanityImage {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
        _id?: string;
        url?: string;
    };
}

export interface SanityDocument {
  _id: string;
  _type: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityCategory {
  _id: string;
  name: string;
  description: string;
  image: SanityImage;
  types: ('product' | 'service')[];
  slug: {
    _type: 'slug';
    current: string;
  };
}

export interface SanityProductDocument {
  _id: string;
  _type: 'product';
  name: string;
  description?: string;
  price?: number;
  status: 'active' | 'inactive';
  sku?: string;
  images?: SanityImage[];
  category?: SanityCategoryDocument[];
  company?: {
    _ref: string;
    _type: 'reference';
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SanityServiceDocument {
  _id: string;
  _type: 'service';
  name: string;
  description?: string;
  price?: number;
  status: 'active' | 'inactive';
  duration?: string;
  modality?: string;
  availability?: string;
  images?: SanityImage[];
  category?: SanityCategoryDocument[];
  company?: {
    _ref: string;
    _type: 'reference';
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SanityCategoryDocument {
  _id: string;
  _ref?: string;
  name: string;
  description?: string;
  image?: SanityImage;
  types?: string[];
  slug?: {
    current: string;
  };
}

export interface SanityDocumentStub {
  _type: string;
  [key: string]: unknown;
} 