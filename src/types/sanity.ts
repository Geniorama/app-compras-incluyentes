export interface SanityImage {
    _type: string;
    asset: {
        _ref: string;
        _type: string;
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

export interface SanityProductDocument extends SanityDocument {
  name: string;
  description?: string;
  category: SanityCategory;
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
  category: SanityCategory;
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

export interface SanityCategoryDocument extends SanityDocument {
  name: string;
  description: string;
  image: SanityImage;
  types: ('product' | 'service')[];
  slug: {
    _type: 'slug';
    current: string;
  };
  category: SanityCategory[];
}

export interface SanityDocumentStub {
  _type: string;
  [key: string]: unknown;
} 