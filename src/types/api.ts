import { SanityUserDocument } from './index';

export interface RouteParams {
  id: string;
}

export interface ApiUserResponse {
  user?: SanityUserDocument;
  message?: string;
  error?: string;
}

export interface ApiUsersResponse {
  users: SanityUserDocument[];
  message?: string;
  error?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  pronoun?: string;
  position?: string;
  typeDocument?: string;
  numDocument?: string;
} 