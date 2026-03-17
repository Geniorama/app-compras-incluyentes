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
    country?: string;
    department?: string;
    city?: string;
    publicProfile?: boolean;
    notifyEmailMessages?: boolean;
}

export interface SanityUserDocument extends SanityResponse, UserData {
    company?: SanityCompanyDocument;
}

// Tipos para el documento de empresa
import type { Product, Service } from './product-service';
export interface CompanyData {
    nameCompany?: string;
    businessName?: string;
    description?: string;
    typeDocumentCompany?: string;
    numDocumentCompany?: string;
    ciiu?: string;
    webSite?: string;
    addressCompany?: string;
    department?: string;
    city?: string;
    country?: string;
    countries?: string[];
    companySize?: string;
    peopleGroup?: string | string[];
    otherPeopleGroup?: string;
    friendlyBizz?: boolean;
    inclusionDEI?: boolean;
    diverseSupplier?: boolean;
    membership?: boolean;
    annualRevenue?: number;
    collaboratorsCount?: number;
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
    chamberOfCommerce?: string | import('./sanity').SanityImage;
    taxIdentificationDocument?: string | import('./sanity').SanityImage;
    chamberOfCommerceValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
    taxIdentificationDocumentValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
    chamberOfCommerceComments?: string;
    taxIdentificationDocumentComments?: string;
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
    // Campos del usuario (ubicación personal)
    userCountry?: string;
    userDepartment?: string;
    userCity?: string;
    // Los campos de la empresa son opcionales en el perfil
    nameCompany?: string;
    businessName?: string;
    description?: string;
    role?: string;
    typeDocumentCompany?: string;
    numDocumentCompany?: string;
    ciiu?: string;
    webSite?: string;
    addressCompany?: string;
    department?: string;
    city?: string;
    country?: string;
    countries?: string[];
    companySize?: string;
    peopleGroup?: string | string[];
    otherPeopleGroup?: string;
    friendlyBizz?: boolean;
    inclusionDEI?: boolean | string;
    membership?: boolean;
    annualRevenue?: number;
    collaboratorsCount?: number;
    logo?: string | import('./sanity').SanityImage;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
    xtwitter?: string;
    photo?: string | import('./sanity').SanityImage;
    chamberOfCommerce?: string | import('./sanity').SanityImage;
    taxIdentificationDocument?: string | import('./sanity').SanityImage;
    chamberOfCommerceValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
    taxIdentificationDocumentValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
    chamberOfCommerceComments?: string;
    taxIdentificationDocumentComments?: string;
}

// Centralizar types de productos y servicios
export type { SanityProduct as Product, SanityService as Service } from './product-service';

// Asegurarnos de que el archivo es un módulo
export {}; 