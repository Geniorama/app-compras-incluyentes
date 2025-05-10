import type { SanityUserDocument } from './index';

declare module 'next/server' {
  interface NextRequest {
    searchParams?: URLSearchParams;
  }
}

export interface RouteParams {
  id: string;
}

export interface RouteContext {
  params: RouteParams;
}

export interface PageProps {
  params?: RouteParams;
  searchParams?: URLSearchParams;
}

export interface LayoutProps {
  children?: React.ReactNode;
  params?: RouteParams;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserApiResponse extends ApiResponse {
  data?: {
    user?: SanityUserDocument;
  };
}

export interface UsersApiResponse extends ApiResponse {
  data?: {
    users: SanityUserDocument[];
  };
} 