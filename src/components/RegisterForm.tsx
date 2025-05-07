"use client";

/**
 * TODO:
 * - Validar que el correo electrónico no esté en uso
 * - Validar que el número de teléfono no esté en uso
 * - Validar que el número de documento no esté en uso
 * - Validar que el nombre de la empresa no esté en uso
 * - Validar que el nombre de la empresa no sea demasiado largo
 * - Validar que el nombre de la empresa no contenga caracteres especiales
 * - Manejar los errores de la API de Firebase
 * - Manejar los errores de la API de Sanity
 */

import { Label, TextInput, Button, Spinner, Select } from "flowbite-react";
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
import { useState, useEffect } from "react";
import { RiCheckboxCircleFill } from "react-icons/ri";
import LogoColor from "@/assets/img/logo-color.webp";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import dataCIIU from "@/data/ciiu";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { RiEyeLine } from "react-icons/ri";
import { RiEyeOffLine } from "react-icons/ri";
import ReactSelect from "react-select";

interface FormData {
  nameCompany: string;
  businessName: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  webSite: string;
  addressCompany: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  typeDocument: string;
  numDocument: string;
  pronoun: string;
  position: string;
  password: string;
  confirmPassword: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
}

export default function RegisterForm() {
  const [stepActive, setStepActive] = useState(1);
  const [activeNextButton, setActiveNextButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [optionsCIIU, setOptionsCIIU] = useState<{value: string, label: string}[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

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

  const isPasswordValid = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const validateStep = () => {
    if (stepActive === 1) {
      return Boolean(
        nameCompany &&
        businessName &&
        typeDocumentCompany &&
        numDocumentCompany &&
        ciiu &&
        webSite &&
        addressCompany && 
        logo
      );
    } else if (stepActive === 2) {
      return Boolean(
        firstName &&
        lastName &&
        email &&
        phone &&
        typeDocument &&
        numDocument &&
        pronoun &&
        position &&
        photo &&
        isValidEmail(email)
      );
    } else if (stepActive === 3) {
      return Boolean(password && confirmPassword && (password === confirmPassword) && isPasswordValid(password));
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
    logo,
    photo
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  interface CIIUData {
    clasificacion_ciiu: string;
    agencia: string;
    empresas_asociativas_de: string;
    empresas_de_economia_solidaria: string;
    empresas_unipersonales: string;
    entidades_sin_animo_de_lucro: string;
    establecimientos: string;
    personas_naturales: string;
    sociedad_anonima: string;
    sociedad_limitada: string;
    sociedad_por_acciones: string;
    sociedades_en_comandita_simple: string;
    sucursal: string;
  }

  useEffect(() => {
    if(dataCIIU) {
      const options = dataCIIU.map((item: CIIUData) => ({
        value: item.clasificacion_ciiu,
        label: item.clasificacion_ciiu,
      }));
      setOptionsCIIU(options);
    }
  },[dataCIIU])

  const handleRegister = async (data: FormData) => {
    try {
      setIsLoading(true); // Iniciamos el estado de carga
      
      // 1. Registrar usuario en Firebase
      const firebaseUser = await registerUser(data.email, data.password);
      
      if (firebaseUser) {
        // 2. Subir imágenes a Sanity primero
        let logoSanity = null;
        let photoSanity = null;

        if (logo) {
          logoSanity = await uploadImageToSanity(logo);
        }
        if (photo) {
          photoSanity = await uploadImageToSanity(photo);
        }

        // 3. Crear usuario en Sanity con las referencias de las imágenes
        const response = await fetch('/api/create-sanity-user', {
          method: 'POST',
          body: JSON.stringify({
            ...data,
            firebaseUid: firebaseUser.uid,
            logo: logoSanity,
            photo: photoSanity,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          router.push("/dashboard");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear usuario en Sanity');
        }
      }
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsLoading(false); // Finalizamos el estado de carga independientemente del resultado
    }
  }

  // Función auxiliar para subir imágenes a Sanity
  const uploadImageToSanity = async (file: File) => {
    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      const fileType = file.type.split('/')[1];

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileType,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Obtiene el archivo seleccionado
    if (file) {
      setLogo(file); // Guarda el archivo en el estado
      setLogoPreview(URL.createObjectURL(file)); // Genera una URL para la vista previa
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Abre la ventana para seleccionar un archivo
    }
  };

  const handlePhotoUploadClick = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const onSubmit = (data: FormData) => {
    handleRegister(data);
  };

  const handleNextStep = async () => {
    if (stepActive === 2) {
      // Validar email antes de avanzar al paso 3
      const isEmailValid = await validateEmail(email);
      if (!isEmailValid) return;
    }
    
    if (stepActive < 3) {
      setStepActive(stepActive + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepActive > 1) {
      setStepActive(stepActive - 1);
    }
  };

  const validateEmail = async (email: string) => {
    if (!email || !isValidEmail(email)) return false;
    
    setIsCheckingEmail(true);
    setEmailError(null);
    
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setEmailError(data.message || 'Error al verificar el email');
        return false;
      }
      
      if (data.exists) {
        setEmailError('Este correo electrónico ya está registrado');
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      setEmailError(error instanceof Error ? error.message : 'Error al verificar el email');
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:gap-10">
      <div className="lg:border-r border-slate-200 p-5 w-full xl:w-1/4 bg-white relative">
        <div>
          <Button onClick={() => router.push("/")} className="mb-8 flex flex-wrap gap-2" outline color="blue">
            <RiArrowLeftLine className="mr-2 h-5 w-5" />
            <span>Ir al inicio</span>
          </Button>
          <h2 className="text-3xl font-bold mb-8">Crea tu cuenta</h2>

          <div className="flex flex-col gap-8 lg:gap-14 xl:mb-10 relative">
            <span className="h-32 lg:h-48 w-[1px] bg-slate-400 absolute left-[16px] z-0"></span>
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
        <div className="hidden lg:block mt-60"></div>
        <div className="hidden lg:block text-center lg:absolute left-0 right-0 bottom-0">
          <img
            className="w-full max-w-max mx-auto"
            src={LogoColor.src}
            alt=""
          />
        </div>
      </div>

      <div className="xl:p-5 w-full xl:w-3/4 bg-white">
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
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 mt-2">
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
                        accept="image/*"
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
                        <Label htmlFor="nameCompany">Nombre de la marca <span className="text-red-500">*</span></Label>
                        <TextInput
                          {...register("nameCompany", {
                            required: "El nombre de la empresa es obligatorio",
                          })}
                          color="blue"
                          id="nameCompany"
                          placeholder="Nombre de la marca"
                        />
                      </div>
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="businessName">Razón social <span className="text-red-500">*</span></Label>
                        <TextInput
                          {...register("businessName", {
                            required: "La razón social es obligatoria",
                          })}
                          color="blue"
                          id="businessName"
                          placeholder="Razón social"
                        />
                      </div>
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="typeDocumentCompany">Documento <span className="text-red-500">*</span></Label>
                        <div className="flex items-center space-x-1">
                          <Select
                            {...register("typeDocumentCompany", {
                              required: "El tipo de documento es obligatorio",
                            })}
                            id="typeDocumentCompany"
                            className="w-[100px]"
                            color="blue"
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
                            type="number"
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="ciiu">Código CIIU (actividad principal) <span className="text-red-500">*</span></Label>
                        {isClient && (
                          <ReactSelect
                            options={optionsCIIU}
                            value={optionsCIIU.find(option => option.value === ciiu) || null}
                            onChange={option => setValue('ciiu', option?.value || '')}
                            placeholder="Selecciona o busca un código CIIU"
                            isSearchable
                            name="ciiu"
                            inputId="ciiu"
                          />
                        )}
                        {errors.ciiu && (
                          <p className="text-red-500 text-sm mt-1">{errors.ciiu.message}</p>
                        )}
                      </div>

                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="webSite">Página Web <span className="text-red-500">*</span></Label>
                        <TextInput
                          {...register("webSite", {
                            required: "La página web es obligatoria",
                          })}
                          color="blue"
                          id="webSite"
                          type="url"
                          pattern="https?://.+"
                          placeholder="https://www.misitio.com"
                        />
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="addressCompany">Dirección <span className="text-red-500">*</span></Label>
                        <TextInput
                          {...register("addressCompany", {
                            required: "La dirección es obligatoria",
                          })}
                          color="blue"
                          id="addressCompany"
                          placeholder="Calle 123 # 45-67"
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
                          type="url"
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
                          type="url"
                          placeholder="Añadir enlace"
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
                          type="url"
                          placeholder="Añadir enlace"
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
                          type="url"
                          placeholder="Añadir enlace"
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
                          type="url"
                          placeholder="Añadir enlace"
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
                          type="url"
                          placeholder="Añadir enlace"
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
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-2">
                  <div onClick={handlePhotoUploadClick} className={`${photoPreview ? 'bg-white' : 'bg-red-500'} w-[80px] h-[80px] flex items-center justify-center rounded-full min-w-[80px] cursor-pointer`}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Foto de perfil" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xl font-bold text-white">Foto</span>
                    )}
                  </div>
                  <div>
                    <Button onClick={handlePhotoUploadClick} className="font-bold" color="light">
                      Subir foto
                    </Button>
                  </div>
                  <div>
                    <ul className="text-xs md:text-sm md:mt-2 lg:mt-0">
                      <li>Se recomienda al menos 800px * 800px</li>
                      <li>Formato WebP, JPG o PNG</li>
                    </ul>
                  </div>
                </div>
                <input
                  accept="image/*"
                  ref={photoInputRef}
                  className="hidden"
                  type="file"
                  name="fotoPerfil"
                  id="foto-perfil"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="firstName">Nombre(s) <span className="text-red-500">*</span></Label>
                  <TextInput
                    {...register("firstName", {
                      required: "El nombre es obligatorio",
                    })}
                    color="blue"
                    id="firstName"
                    placeholder="John"
                  />
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="lastName">Apellido(s) <span className="text-red-500">*</span></Label>
                  <TextInput
                    {...register("lastName", {
                      required: "El apellido es obligatorio",
                    })}
                    color="blue"
                    id="apellido"
                    placeholder="Doe"
                  />
                </div>

                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="pronoun">Pronombre</Label>
                  <TextInput
                    {...register("pronoun")}
                    color="blue"
                    id="pronoun"
                    placeholder="Él, Ella, Elle"
                  />
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="position">Cargo <span className="text-red-500">*</span></Label>
                  <TextInput
                    {...register("position", {
                      required: "El cargo es obligatorio",
                    })}
                    color="blue"
                    id="position"
                    placeholder="CEO"
                  />
                </div>

                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="email">Correo electrónico <span className="text-red-500">*</span></Label>
                  <TextInput
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "El correo electrónico no es válido",
                      },
                      onChange: async (e) => {
                        const value = e.target.value;
                        if (value && isValidEmail(value)) {
                          await validateEmail(value);
                        } else {
                          setEmailError(null);
                        }
                      }
                    })}
                    type="email"
                    color={emailError ? "failure" : "blue"}
                    id="email"
                    placeholder="email@miempresa.com"
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                  {isCheckingEmail && (
                    <p className="text-blue-500 text-sm mt-1">Verificando email...</p>
                  )}
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="phone">Número de teléfono <span className="text-red-500">*</span></Label>
                  <InternationalPhoneInput
                    {...register("phone", {
                      required: "El número de teléfono es obligatorio",
                      setValueAs: (value) => {
                        // Asegurarnos de que el valor incluya el código del país
                        if (!value.startsWith('+')) {
                          return `+57${value}`; // Código por defecto de Colombia
                        }
                        return value;
                      }
                    })}
                    name="phone"
                    id="phone"
                    placeholder="Número de teléfono"
                    color="blue"
                  />
                </div>

                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="typeDocument">Documento <span className="text-red-500">*</span></Label>
                  <div className="flex items-center space-x-1">
                    <Select
                      {...register("typeDocument", {
                        required: "El tipo de documento es obligatorio",
                      })}
                      id="typeDocument"
                      className="w-[100px]"
                      color="blue"
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
                      type="number"
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
                  <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <TextInput
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                          value: 10,
                          message: "La contraseña debe tener al menos 10 caracteres",
                        },
                        validate: {
                          isValid: (value) => isPasswordValid(value) || "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
                        }
                      })}
                      required
                      color="blue"
                      id="password"
                      placeholder="**********"
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                  <ul className="text-xs text-slate-500 md:text-sm mt-2 lg:mt-0 space-y-1">
                    <li className="text-xs">
                      <RiCheckboxCircleFill className={`text-sm inline-block ${password?.length >= 10 ? 'text-blue-600' : 'text-slate-500'}`} />{" "}
                      Al menos 10 carácteres
                    </li>
                    <li className="text-xs">
                      <RiCheckboxCircleFill className={`text-sm inline-block ${password?.match(/[A-Z]/) ? 'text-blue-600' : 'text-slate-500'}`} />{" "}
                      1 letra mayúscula
                    </li>
                    <li className="text-xs">
                      <RiCheckboxCircleFill className={`text-sm inline-block ${password?.match(/[!@#$%^&*(),.?":{}|<>]/) ? 'text-blue-600' : 'text-slate-500'}`} />{" "}
                      1 carácter especial como .,#@?*
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="confirm-password">Confirmar contraseña <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <TextInput
                      {...register("confirmPassword", {
                        required: "La confirmación de contraseña es obligatoria",
                        validate: (value) => {
                          if (password !== value) {
                            return "Las contraseñas no coinciden";
                          }
                        },
                      })}
                      required
                      color="blue"
                      id="confirm-password"
                      placeholder="**********"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </fieldset>
          )}

          <div className="mt-5 flex flex-col md:flex-row gap-4 md:gap-2 justify-between items-center">
            <div>
              <p className="text-sm">
                Si ya tienes una cuenta{" "}
                <Link className="text-blue-600" href={"/login"}>
                  inicia sesión aquí
                </Link>
              </p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              {stepActive > 1 && (
                <Button
                  onClick={handlePrevStep}
                  className="w-full md:w-auto min-w-32"
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
                  className="w-full md:w-auto min-w-32"
                  type="button"
                >
                  Siguiente
                </Button>
              ) : (
                <Button 
                  className="w-full md:w-auto min-w-32" 
                  type="submit"
                  disabled={!activeNextButton || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-3" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
