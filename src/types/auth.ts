import { User as FirebaseUser } from "firebase/auth";
import { SanityImage } from './sanity';

export interface Company {
  _id: string;
  nameCompany: string;
  companySize?: string;
}

export interface User extends FirebaseUser {
  firstName?: string;
  lastName?: string;
  photo?: SanityImage;
  company?: Company;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
} 