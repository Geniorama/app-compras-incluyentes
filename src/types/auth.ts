import { User as FirebaseUser } from "firebase/auth";

export interface Company {
  _id: string;
  name: string;
}

export interface User extends FirebaseUser {
  company?: Company;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
} 