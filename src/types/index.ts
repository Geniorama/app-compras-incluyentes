// Tipos para Sanity
export type { SanityImage } from './sanity';

// Tipos base para documentos de Sanity
export interface SanityResponse {
    _id: string;
    _type: string;
    _rev: string;
    _updatedAt: string;
    _createdAt: string;
}

// Tipos para el documento de usuario
export interface UserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    pronoun?: string;
    position?: string;
    typeDocument?: string;
    numDocument?: string;
}

export interface SanityUserDocument extends SanityResponse, UserData {
    company?: SanityCompanyDocument;
}

// Tipos para el documento de empresa
import type { Product, Service } from './product-service';
export interface CompanyData {
    nameCompany?: string;
    businessName?: string;
    typeDocumentCompany?: string;
    numDocumentCompany?: string;
    ciiu?: string;
    webSite?: string;
    addressCompany?: string;
    logo?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
    xtwitter?: string;
    sector?: string;
    phone?: string;
    photo?: string | import('./sanity').SanityImage;
    products?: Product[];
    services?: Service[];
}

export interface SanityCompanyDocument extends SanityResponse, CompanyData {}

// Tipos para las respuestas de la API
export interface ApiResponse {
    success: boolean;
    error?: string;
    data?: {
        user?: SanityUserDocument;
        company?: SanityCompanyDocument;
    };
}

// Tipo combinado para el perfil completo (usado en el frontend)
export interface UserProfile extends UserData {
    company?: SanityCompanyDocument;
    // Los campos de la empresa son opcionales en el perfil
    nameCompany?: string;
    businessName?: string;
    role?: string;
    typeDocumentCompany?: string;
    numDocumentCompany?: string;
    ciiu?: string;
    webSite?: string;
    addressCompany?: string;
    logo?: string | import('./sanity').SanityImage;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
    xtwitter?: string;
    photo?: string | import('./sanity').SanityImage;
}

// Centralizar types de productos y servicios
export type { SanityProduct as Product, SanityService as Service } from './product-service';

// Asegurarnos de que el archivo es un módulo
export {}; 