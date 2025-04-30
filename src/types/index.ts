// Tipos para Sanity
export interface SanityImage {
    _type: string;
    asset: {
        _ref: string;
        _type: string;
    } | null;
}

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
    photo?: string;
}

export interface SanityUserDocument extends SanityResponse, UserData {
    company?: SanityCompanyDocument;
}

// Tipos para el documento de empresa
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
    typeDocumentCompany?: string;
    numDocumentCompany?: string;
    ciiu?: string;
    webSite?: string;
    addressCompany?: string;
    logo?: SanityImage;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
    xtwitter?: string;
}

// Asegurarnos de que el archivo es un módulo
export {}; 