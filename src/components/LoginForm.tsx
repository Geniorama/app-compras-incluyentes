"use client"

import { TextInput, Label, Checkbox, Button, Alert } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { UserCredential } from "firebase/auth";
interface DataProps {
  email: string;
  password: string;
}

type User = UserCredential['user'];

interface UserCredentialExtends extends User {
  accessToken?: string;
}

export default function LoginForm() {
  const [error, setError] = useState('');
  const [data, setData] = useState<DataProps>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const onCheckboxChange = (e: FormEvent<HTMLInputElement>) => {
    setRememberMe(e.currentTarget.checked);
  };

  const handleLogin = async (data: DataProps) => {
    try {
      const response:UserCredentialExtends = await loginUser(data.email, data.password);
      const token = response.accessToken;

      if (!token) {
        setError("No se pudo obtener el token de acceso.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('authToken', token);
      }
     
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error desconocido al iniciar sesión.");
      }
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    handleLogin(data);
  }

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setData({ ...data, [name]: value });
    setError('');
  }

  


  return (
    <form onSubmit={(e) => onSubmit(e)} className="w-full flex flex-col gap-4">
      <div>
        <Label className="block mb-2" htmlFor="email">Correo electrónico</Label>
        <TextInput
          type="email"
          color="blue"
          id="email"
          name="email"
          placeholder="micorreo@business.com"
          required
          value={data.email}
          onChange={(e) => onChange(e)}
          theme={{
            field:{
              input:{
                base: "border-slate-200 focus:border-blue-600 w-full",
              }
            }
          }}
        />
      </div>
      <div>
        <Label className="block mb-2" htmlFor="password">Contraseña</Label>
        <TextInput
          type="password"
          color="blue"
          id="password"
          name="password"
          placeholder="**********"
          required
          value={data.password}
          onChange={(e) => onChange(e)}
          theme={{
            field:{
              input:{
                base: "border-slate-200 focus:border-blue-600 w-full",
              }
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Checkbox onChange={(e) => onCheckboxChange(e)} color="blue" className="mr-1" id="remember" name="remember" />
          <Label htmlFor="remember">Recordarme</Label>
        </div>
        <Link className="text-sm underline hover:opacity-60" href="/forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error && <Alert color="red">{error}</Alert>}

      <Button type="submit">Inicia sesión</Button>

      <p className="text-sm text-center mt-5">Si no tienes una cuenta <Link className="text-blue-600 underline hover:opacity-60 font-bold" href={'/register'}>Regístrate aquí</Link></p>
    </form>
  );
}
