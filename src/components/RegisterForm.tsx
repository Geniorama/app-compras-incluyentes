"use client";

import { Label, TextInput, Button } from "flowbite-react";
import InternationalPhoneInput from "./InternationalPhoneInput ";

export default function RegisterForm() {
  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="text-blue-600">
            <span className="inline-flex w-7 h-7 justify-center items-center border-2 border-blue-600 rounded-full bg-blue-200 font-bold mr-1">1</span>
            <span>Información empresarial</span>
        </div>

        <div className="text-gray-400">
            <span className="inline-flex w-7 h-7 justify-center items-center border-2 border-gray-400 rounded-full font-bold mr-1">2</span>
            <span>Información personal</span>
        </div>

        <div className="text-gray-400">
            <span className="inline-flex w-7 h-7 justify-center items-center border-2 border-gray-400 rounded-full font-bold mr-1">3</span>
            <span>Seguridad</span>
        </div>
      </div>

      <h2 className="text-center font-bold text-2xl">Crea tu cuenta</h2>

      <form className="mt-5" action="">
        <fieldset>
          <div>
            <Label htmlFor="logo">Logo de la marca</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="bg-red-500 w-[100px] h-[100px] flex items-center justify-center rounded-full min-w-[100px]">
                <span className="text-xl font-bold text-white">Logo</span>
              </div>
              <div>
                <Button className="font-bold" color="light">
                  Subir logo
                </Button>
                <ul className="text-xs md:text-sm mt-2">
                  <li>Se recomienda al menos 800px * 800px</li>
                  <li>Formato WebP, JPG o PNG</li>
                </ul>
              </div>
            </div>
            <input className="hidden" type="file" name="logo" id="logo" />
          </div>

          <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
            <div className="w-full md:w-1/2 lg:w-1/3 px-2">
              <Label htmlFor="name">Nombre de la marca</Label>
              <TextInput
                required
                color="blue"
                id="name"
                placeholder="Nombre de la marca"
                theme={{
                  field: {
                    input: {
                      base: "border-slate-200 focus:border-blue-600 w-full",
                    },
                  },
                }}
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 px-2">
              <Label htmlFor="email">Razón social</Label>
              <TextInput
                required
                color="blue"
                id="email"
                placeholder="Razón social"
                theme={{
                  field: {
                    input: {
                      base: "border-slate-200 focus:border-blue-600 w-full",
                    },
                  },
                }}
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 px-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <TextInput
                required
                color="blue"
                id="email"
                placeholder="Correo"
                theme={{
                  field: {
                    input: {
                      base: "border-slate-200 focus:border-blue-600 w-full",
                    },
                  },
                }}
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 px-2">
              <Label htmlFor="email">Número de teléfono</Label>
              <InternationalPhoneInput />
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
