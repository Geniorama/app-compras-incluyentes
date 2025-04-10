"use client";

import { Label, TextInput, Button } from "flowbite-react";
import { SlSocialLinkedin, SlSocialFacebook, SlSocialInstagram, SlSocialPintarest } from "react-icons/sl";
import { RiTwitterXFill, RiTiktokLine  } from "react-icons/ri";
// import InternationalPhoneInput from "./InternationalPhoneInput ";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";
import { Select } from "flowbite-react";

export default function RegisterForm() {
  return (
    <div className="flex flex-col xl:flex-row gap-10">
      <div className="border-r border-slate-200 p-5 w-full xl:w-1/4 bg-white">
        <Button className="mb-8" outline color="blue">
          Ir al inicio
        </Button>
        <h2 className="text-3xl font-bold mb-8">Crea tu cuenta</h2>

        <div className="flex flex-col gap-14 mb-10 relative">
          <span className="h-48 w-[1px] bg-slate-400 absolute left-[16px] z-0"></span>
          <div className="text-blue-600 relative">
            <span className="inline-flex w-8 h-8 justify-center items-center border border-blue-600 rounded-full bg-blue-200 mr-2">
              1
            </span>
            <span>Información Empresarial</span>
          </div>

          <div className="text-gray-400 relative bg-white">
            <span className="inline-flex w-8 h-8 justify-center items-center border border-gray-400 rounded-full mr-2">
              2
            </span>
            <span>Información Personal</span>
          </div>

          <div className="text-gray-400 relative bg-white">
            <span className="inline-flex w-8 h-8 justify-center items-center border border-gray-400 rounded-full mr-2">
              3
            </span>
            <span>Seguridad</span>
          </div>
        </div>
      </div>

      <div className="p-5 w-full xl:w-3/4 bg-white">
        <form className="mt-5" action="">
          <fieldset>
            <Accordion>
              {/* Datos de empresa */}
              <AccordionPanel>
                <AccordionTitle className="text-blue-600 font-bold">
                  Empresa
                </AccordionTitle>
                <AccordionContent>
                  <div>
                    <Label htmlFor="logo">Logo de la marca</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="bg-red-500 w-[100px] h-[100px] flex items-center justify-center rounded-full min-w-[100px]">
                        <span className="text-xl font-bold text-white">
                          Logo
                        </span>
                      </div>
                      <div>
                        <Button className="font-bold" color="light">
                          Subir logo
                        </Button>
                      </div>
                      <div>
                        <ul className="text-xs md:text-sm mt-2">
                          <li>Se recomienda al menos 800px * 800px</li>
                          <li>Formato WebP, JPG o PNG</li>
                        </ul>
                      </div>
                    </div>
                    <input
                      className="hidden"
                      type="file"
                      name="logo"
                      id="logo"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                    <div className="w-full md:w-1/2 px-2 space-y-1">
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
                    <div className="w-full md:w-1/2 px-2 space-y-1">
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
                    <div className="w-full md:w-1/2 px-2 space-y-1">
                      <Label htmlFor="tipo-documento">Documento</Label>
                      <div className="flex items-center space-x-1">
                        <Select
                          id="tipo-documento"
                          name="tipo-documento"
                          className="w-[100px]"
                          color="blue"
                          required
                          theme={{
                            field: {
                              select: {
                                base: "border-slate-200 focus:border-blue-600 w-full",
                              },
                            },
                          }}
                        >
                          <option value="nit">NIT</option>
                          <option value="cc">CC</option>
                          <option value="ce">CE</option>
                        </Select>
                        <TextInput
                          className="w-auto flex-grow"
                          required
                          color="blue"
                          id="num-documento"
                          placeholder="Número de documento"
                          name="num-documento"
                          theme={{
                            field: {
                              input: {
                                base: "border-slate-200 focus:border-blue-600 w-full",
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label htmlFor="ciiu">Código CIIU</Label>
                      <TextInput
                        required
                        color="blue"
                        id="ciiu"
                        placeholder="Código CIIU"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label htmlFor="ciiu">Página Web</Label>
                      <TextInput
                        required
                        color="blue"
                        id="pagina-web"
                        placeholder="misitio.com"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label htmlFor="ciiu">Dirección</Label>
                      <TextInput
                        required
                        color="blue"
                        id="direccion"
                        placeholder="Calle 123 # 45-67"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionPanel>

              <AccordionPanel>
                <AccordionTitle className="text-blue-600 font-bold">
                  Redes Sociales (opcional)
                </AccordionTitle>
                <AccordionContent>
                  <div className="flex flex-col md:flex-row flex-wrap gap-y-4 -mx-2">
                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="facebook">
                        <span className="inline-block mr-1">
                          <SlSocialFacebook />
                        </span>
                        Facebook
                      </Label>
                      <TextInput
                        required
                        color="blue"
                        id="facebook"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="instagram">
                        <span className="inline-block mr-1">
                          <SlSocialInstagram />
                        </span>
                        Instagram
                        </Label>
                      <TextInput
                        required
                        color="blue"
                        id="instagram"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="tiktok">
                        <span className="inline-block mr-1">
                          <RiTiktokLine />
                        </span>
                        Tik Tok
                      </Label>
                      <TextInput
                        required
                        color="blue"
                        id="tiktok"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="pinterest">
                        <span className="inline-block mr-1">
                          <SlSocialPintarest />
                        </span>
                        Pinterest
                      </Label>
                      <TextInput
                        required
                        color="blue"
                        id="pinterest"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="linkedin">
                        <span className="inline-block mr-1">
                          <SlSocialLinkedin />
                        </span>
                        Linked In 
                      </Label>
                      <TextInput
                        required
                        color="blue"
                        id="linkedin"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                      <Label className="flex items-center" htmlFor="xtwitter">
                        <span className="inline-block mr-1">
                          <RiTwitterXFill />
                        </span>
                        Twitter
                      </Label>
                      <TextInput
                        required
                        color="blue"
                        id="xtwitter"
                        placeholder="Añadir enlace"
                        theme={{
                          field: {
                            input: {
                              base: "border-slate-200 focus:border-blue-600 w-full",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
