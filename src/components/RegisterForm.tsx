"use client";

import { Label, TextInput, Button } from "flowbite-react";
import {
  SlSocialLinkedin,
  SlSocialFacebook,
  SlSocialInstagram,
  SlSocialPintarest,
} from "react-icons/sl";
import { RiTwitterXFill, RiTiktokLine } from "react-icons/ri";
import { RiArrowLeftLine } from "react-icons/ri";
import Link from "next/link";
import InternationalPhoneInput from "./InternationalPhoneInput ";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";
import { Select } from "flowbite-react";
import { useState } from "react";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { RiCloseCircleFill } from "react-icons/ri";
import LogoColor from "@/assets/img/logo-color.webp";
import { useForm } from "react-hook-form";
import { useRef, useEffect } from "react";

export default function RegisterForm() {
  const [stepActive, setStepActive] = useState(1);
  const [activeNextButton, setActiveNextButton] = useState(false);
  const [logo, setLogo] = useState<File | null>(null); // Estado para almacenar el archivo seleccionado
  const [logoPreview, setLogoPreview] = useState<string | null>(null); // Estado para la vista previa del logo

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Fields Step 1
  const nameCompany = watch("nameCompany");
  const businessName = watch("businessName");
  const typeDocumentCompany = watch("typeDocumentCompany");
  const numDocumentCompany = watch("numDocumentCompany");
  const ciiu = watch("ciiu");
  const webSite = watch("webSite");
  const addressCompany = watch("addressCompany");

  // Fields Step 2
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const phone = watch("phone");
  const typeDocument = watch("typeDocument");
  const numDocument = watch("numDocument");
  const pronoun = watch("pronoun");
  const position = watch("position");


 
  // Fields Step 3
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");


  const validateStep = () => {
    if (stepActive === 1) {
      return (
        nameCompany &&
        businessName &&
        typeDocumentCompany &&
        numDocumentCompany &&
        ciiu &&
        webSite &&
        addressCompany
      );
    } else if (stepActive === 2) {
      return (
        firstName &&
        lastName &&
        email &&
        phone &&
        typeDocument &&
        numDocument &&
        pronoun &&
        position
      );
    } else if (stepActive === 3) {
      return password && confirmPassword && password === confirmPassword;
    }
    return false;
  };

  useEffect(() => {
    setActiveNextButton(validateStep());
  }, [
    nameCompany,
    businessName,
    typeDocumentCompany,
    numDocumentCompany,
    ciiu,
    webSite,
    addressCompany,
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    stepActive,
    typeDocument,
    numDocument,
    pronoun,
    position,
  ]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Obtiene el archivo seleccionado
    if (file) {
      setLogo(file); // Guarda el archivo en el estado
      setLogoPreview(URL.createObjectURL(file)); // Genera una URL para la vista previa
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Abre la ventana para seleccionar un archivo
    }
  };

  const onSubmit = (data: any) => {
    console.log(data); // Aquí puedes manejar los datos del formulario
  };

  const handleNextStep = () => {
    if (stepActive < 3) {
      setStepActive(stepActive + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepActive > 1) {
      setStepActive(stepActive - 1);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-10">
      <div className="border-r border-slate-200 p-5 w-full xl:w-1/4 bg-white relative">
        <div>
          <Button className="mb-8 flex flex-wrap gap-2" outline color="blue">
            <RiArrowLeftLine className="mr-2 h-5 w-5" />
            <span>Ir al inicio</span>
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

            <div
              className={`${
                stepActive >= 2 ? "text-blue-600" : "text-gray-400"
              } relative `}
            >
              <span
                className={`inline-flex w-8 h-8 justify-center items-center border ${
                  stepActive >= 2
                    ? "border-blue-600 bg-blue-200"
                    : "border-gray-400 bg-white"
                } rounded-full mr-2`}
              >
                2
              </span>
              <span>Información Personal</span>
            </div>

            <div
              className={`${
                stepActive >= 3 ? "text-blue-600" : "text-gray-400"
              } relative`}
            >
              <span
                className={`inline-flex w-8 h-8 justify-center items-center border ${
                  stepActive >= 3
                    ? "border-blue-600 bg-blue-200"
                    : "border-gray-400 bg-white"
                } rounded-full mr-2`}
              >
                3
              </span>
              <span>Seguridad</span>
            </div>
          </div>
        </div>
        <div className="mt-60"></div>
        <div className="text-center lg:absolute left-0 right-0 bottom-0">
          <img
            className="w-full max-w-max mx-auto"
            src={LogoColor.src}
            alt=""
          />
        </div>
      </div>

      <div className="p-5 w-full xl:w-3/4 bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5" action="">
          {/* Información Empresarial */}
          {stepActive === 1 && (
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
                        <div
                          onClick={handleUploadClick}
                          className={`${logoPreview ? "bg-white border-slate-200" : "bg-red-500 border-red-500"} border  w-[100px] h-[100px] flex items-center justify-center rounded-full min-w-[100px] cursor-pointer`}
                        >
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Vista previa del logo"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-xl font-bold text-white">Logo</span>
                          )}
                        </div>
                        <div>
                          <Button
                            onClick={handleUploadClick}
                            className="font-bold"
                            color="light"
                          >
                            Subir logo
                          </Button>
                        </div>
                        <div>
                          <ul className="text-xs md:text-sm mt-2 lg:mt-0">
                            <li>Se recomienda al menos 800px * 800px</li>
                            <li>Formato WebP, JPG o PNG</li>
                          </ul>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        name="logo"
                        id="logo"
                        onChange={handleLogoChange}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="nameCompany">Nombre de la marca</Label>
                        <TextInput
                          {...register("nameCompany", {
                            required: "El nombre de la empresa es obligatorio",
                          })}
                          color="blue"
                          id="nameCompany"
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
                        <Label htmlFor="businessName">Razón social</Label>
                        <TextInput
                          {...register("businessName", {
                            required: "La razón social es obligatoria",
                          })}
                          color="blue"
                          id="businessName"
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
                        <Label htmlFor="typeDocumentCompany">Documento</Label>
                        <div className="flex items-center space-x-1">
                          <Select
                            {...register("typeDocumentCompany", {
                              required: "El tipo de documento es obligatorio",
                            })}
                            id="typeDocumentCompany"
                            className="w-[100px]"
                            color="blue"
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
                            {...register("numDocumentCompany", {
                              required: "El número de documento es obligatorio",
                            })}
                            className="w-auto flex-grow"
                            color="blue"
                            id="numDocumentCompany"
                            placeholder="Número de documento"
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
                          {...register("ciiu", {
                            required: "El código CIIU es obligatorio",
                          })}
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
                        <Label htmlFor="webSite">Página Web</Label>
                        <TextInput
                          {...register("webSite", {
                            required: "La página web es obligatoria",
                          })}
                          color="blue"
                          id="webSite"
                          type="url"
                          pattern="https?://.+"
                          placeholder="https://www.misitio.com"
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
                        <Label htmlFor="addressCompany">Dirección</Label>
                        <TextInput
                          {...register("addressCompany", {
                            required: "La dirección es obligatoria",
                          })}
                          color="blue"
                          id="addressCompany"
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
                          {...register("facebook")}
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
                        <Label
                          className="flex items-center"
                          htmlFor="instagram"
                        >
                          <span className="inline-block mr-1">
                            <SlSocialInstagram />
                          </span>
                          Instagram
                        </Label>
                        <TextInput
                          {...register("instagram")}
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
                          {...register("tiktok")}
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
                        <Label
                          className="flex items-center"
                          htmlFor="pinterest"
                        >
                          <span className="inline-block mr-1">
                            <SlSocialPintarest />
                          </span>
                          Pinterest
                        </Label>
                        <TextInput
                          {...register("pinterest")}
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
                          {...register("linkedin")}
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
                          {...register("xtwitter")}
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
          )}

          {/* Información de contacto */}
          {stepActive === 2 && (
            <fieldset>
              <div>
                <Label htmlFor="foto-perfil">Foto de perfil</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="bg-red-500 w-[80px] h-[80px] flex items-center justify-center rounded-full min-w-[80px]">
                    <span className="text-xl font-bold text-white">Foto</span>
                  </div>
                  <div>
                    <Button className="font-bold" color="light">
                      Subir foto
                    </Button>
                  </div>
                  <div>
                    <ul className="text-xs md:text-sm mt-2 lg:mt-0">
                      <li>Se recomienda al menos 800px * 800px</li>
                      <li>Formato WebP, JPG o PNG</li>
                    </ul>
                  </div>
                </div>
                <input
                  className="hidden"
                  type="file"
                  name="fotoPerfil"
                  id="foto-perfil"
                />
              </div>

              <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="firstName">Nombre(s)</Label>
                  <TextInput
                    {...register("firstName", {
                      required: "El nombre es obligatorio",
                    })}
                    color="blue"
                    id="firstName"
                    placeholder="John"
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
                  <Label htmlFor="lastName">Apellido(s)</Label>
                  <TextInput
                    {...register("lastName", {
                      required: "El apellido es obligatorio",
                    })}
                    color="blue"
                    id="apellido"
                    placeholder="Doe"
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
                  <Label htmlFor="pronoun">Pronombre</Label>
                  <TextInput
                    {...register("pronoun")}
                    color="blue"
                    id="pronoun"
                    placeholder="Él, Ella, Elle"
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
                  <Label htmlFor="position">Cargo</Label>
                  <TextInput
                    {...register("position", {
                      required: "El cargo es obligatorio",
                    })}
                    color="blue"
                    id="position"
                    placeholder="CEO"
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
                  <Label htmlFor="email">Correo electrónico</Label>
                  <TextInput
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "El correo electrónico no es válido",
                      },
                    })}
                    type="email"
                    color="blue"
                    id="email"
                    placeholder="email@miempresa.com"
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
                  <Label htmlFor="phone">Número de teléfono</Label>
                  <InternationalPhoneInput
                    {...register("phone", {
                      required: "El número de teléfono es obligatorio",
                    })}
                    id="phone"
                    placeholder="Número de teléfono"
                    color="blue"
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
                  <Label htmlFor="typeDocument">Documento</Label>
                  <div className="flex items-center space-x-1">
                    <Select
                      {...register("typeDocument", {
                        required: "El tipo de documento es obligatorio",
                      })}
                      id="typeDocument"
                      className="w-[100px]"
                      color="blue"
                      theme={{
                        field: {
                          select: {
                            base: "border-slate-200 focus:border-blue-600 w-full",
                          },
                        },
                      }}
                    >
                      <option value="cc">CC</option>
                      <option value="ce">CE</option>
                    </Select>
                    <TextInput
                      {...register("numDocument", {
                        required: "El número de documento es obligatorio",
                      })}
                      className="w-auto flex-grow"
                      color="blue"
                      id="numDocument"
                      placeholder="Número de documento"
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
              </div>
            </fieldset>
          )}

          {/* Seguridad */}
          {stepActive === 3 && (
            <fieldset>
              <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="password">Contraseña</Label>
                  <TextInput
                    required
                    color="blue"
                    id="password"
                    placeholder="**********"
                    type="password"
                    theme={{
                      field: {
                        input: {
                          base: "border-slate-200 focus:border-blue-600 w-full",
                        },
                      },
                    }}
                  />
                  <ul className="text-xs text-slate-500 md:text-sm mt-2 lg:mt-0 space-y-1">
                    <li className="text-xs">
                      <RiCheckboxCircleFill className="text-sm inline-block text-blue-600" />{" "}
                      Al menos 10 carácteres
                    </li>
                    <li className="text-xs">
                      <RiCloseCircleFill className="text-sm inline-block text-slate-500" />{" "}
                      1 letra mayúscula
                    </li>
                    <li className="text-xs">
                      <RiCloseCircleFill className="text-sm inline-block text-slate-500" />{" "}
                      1 carácter especial como .,#@?*
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <TextInput
                    required
                    color="blue"
                    id="confirm-password"
                    placeholder="**********"
                    type="password"
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
            </fieldset>
          )}

          <div className="mt-5 flex gap-2 justify-between items-center">
            <div>
              <p className="text-sm">
                Si ya tienes una cuenta{" "}
                <Link className="text-blue-600" href={"/login"}>
                  inicia sesión aquí
                </Link>
              </p>
            </div>
            <div className="flex gap-2">
              {stepActive > 1 && (
                <Button
                  onClick={handlePrevStep}
                  className="min-w-32"
                  type="button"
                  color="light"
                >
                  Regresar
                </Button>
              )}
              {stepActive < 3 ? (
                <Button
                  disabled={!activeNextButton}
                  onClick={handleNextStep}
                  className="min-w-32"
                  type="button"
                >
                  Siguiente
                </Button>
              ) : (
                <Button className="min-w-32" type="submit">
                  Crear cuenta
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
