// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { User, AuthContextType } from "@/types/auth";
import { sanityClient } from "@/lib/sanity.client";

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener la información de la empresa del usuario
          const userData = await sanityClient.fetch(
            `*[_type == "user" && firebaseUid == $firebaseUid][0]{
              company->{
                _id,
                name
              }
            }`,
            { firebaseUid: firebaseUser.uid }
          );

          // Extender el usuario de Firebase con la información de la empresa
          const extendedUser = {
            ...firebaseUser,
            company: userData?.company
          } as User;

          setUser(extendedUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
