"use client"

import { TextInput, Label, Checkbox, Button, Alert } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

interface DataProps {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [error, setError] = useState('');
  const [data, setData] = useState<DataProps>({
    email: '',
    password: '',
  });
  const router = useRouter();

  const handleLogin = async (data: DataProps) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/dashboard"); // Redirige tras login
    } else {
      setError('Credenciales incorrectas');	
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log(data);
    handleLogin(data);
    setError('Tu usuario aún no ha sido activado');	
  }

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setData({ ...data, [name]: value });
    setError('');
  }

  


  return (
    <form onSubmit={(e) => onSubmit(e)} className="w-full flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <TextInput
          type="email"
          color="blue"
          id="email"
          name="email"
          placeholder="micorreo@business.com"
          required
          value={data.email}
          onChange={(e) => onChange(e)}
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <TextInput
          type="password"
          color="blue"
          id="password"
          name="password"
          placeholder="**********"
          required
          value={data.password}
          onChange={(e) => onChange(e)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Checkbox color="blue" className="mr-1" id="remember" name="remember" />
          <Label htmlFor="remember">Recuérdame</Label>
        </div>
        <Link className="text-sm" href="/forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error && <Alert color="red">{error}</Alert>}

      <Button type="submit">Inicia sesión</Button>

      <p className="text-sm text-center mt-5">Si no tienes una cuenta <Link className="text-blue-600 underline" href={'/register'}>Regístrate aquí</Link></p>
    </form>
  );
}
