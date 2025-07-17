"use client";

import {
  Label,
  TextInput,
  Button,
  Spinner,
  Select,
  Modal,
  Radio,
} from "flowbite-react";
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
import {
  getDepartamentosOptions,
  getCiudadesOptionsByDepartamento,
} from "@/utils/departamentosCiudades";

interface FormData {
  nameCompany: string;
  businessName: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  webSite: string;
  addressCompany: string;
  department: string;
  city: string;
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
  membership?: string;
}

// Agregar interfaces para validaciones
interface ValidationErrors {
  [key: string]: string;
}

export default function RegisterForm() {
  const [stepActive, setStepActive] = useState(2);
  const [activeNextButton, setActiveNextButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [optionsCIIU, setOptionsCIIU] = useState<
    { value: string; label: string }[]
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [ciudadesOptions, setCiudadesOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>();

  // Fields Step 1
  const nameCompany = watch("nameCompany");
  const businessName = watch("businessName");
  const typeDocumentCompany = watch("typeDocumentCompany");
  const numDocumentCompany = watch("numDocumentCompany");
  const ciiu = watch("ciiu");
  const webSite = watch("webSite");
  const addressCompany = watch("addressCompany");
  const department = watch("department");
  const city = watch("city");

  // Fields Step 2
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const phone = watch("phone");
  const typeDocument = watch("typeDocument");
  const numDocument = watch("numDocument");
  const pronoun = watch("pronoun");
  const position = watch("position");
  const membership = watch("membership");
  // Fields Step 3
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const isPasswordValid = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Función para validar campos específicos
  const validateField = (
    name: string,
    value: string | undefined
  ): string | null => {
    if (value === undefined) return "Este campo es obligatorio";
    switch (name) {
      case "nameCompany":
        if (!value) return "El nombre de la marca es obligatorio";
        if (value.length < 3)
          return "El nombre de la marca debe tener al menos 3 caracteres";
        if (value.length > 50)
          return "El nombre de la marca no puede tener más de 50 caracteres";
        if (!/^[a-zA-Z0-9\s-]+$/.test(value))
          return "El nombre de la marca solo puede contener letras, números, espacios y guiones";
        return null;

      case "businessName":
        if (!value) return "La razón social es obligatoria";
        if (value.length < 3)
          return "La razón social debe tener al menos 3 caracteres";
        if (value.length > 100)
          return "La razón social no puede tener más de 100 caracteres";
        return null;

      case "numDocumentCompany":
        if (!value) return "El número de documento es obligatorio";
        if (typeDocumentCompany === "nit" && !/^\d{9,10}$/.test(value))
          return "El NIT debe tener entre 9 y 10 dígitos";
        if (
          (typeDocumentCompany === "cc" || typeDocumentCompany === "ce") &&
          !/^\d{8,10}$/.test(value)
        )
          return "El documento debe tener entre 8 y 10 dígitos";
        return null;

      case "webSite":
        if (!value) return "La página web es obligatoria";
        if (!/^https?:\/\/.+/.test(value))
          return "La URL debe comenzar con http:// o https://";
        return null;

      case "addressCompany":
        if (!value) return "La dirección es obligatoria";
        if (value.length < 5)
          return "La dirección debe tener al menos 5 caracteres";
        if (value.length > 200)
          return "La dirección no puede tener más de 200 caracteres";
        return null;

      case "department":
        if (!value) return "El departamento es obligatorio";
        return null;

      case "city":
        if (!value) return "La ciudad es obligatoria";
        return null;

      case "firstName":
        if (!value) return "El nombre es obligatorio";
        if (value.length < 2)
          return "El nombre debe tener al menos 2 caracteres";
        if (value.length > 50)
          return "El nombre no puede tener más de 50 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value))
          return "El nombre solo puede contener letras, espacios y guiones";
        return null;

      case "lastName":
        if (!value) return "El apellido es obligatorio";
        if (value.length < 2)
          return "El apellido debe tener al menos 2 caracteres";
        if (value.length > 50)
          return "El apellido no puede tener más de 50 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value))
          return "El apellido solo puede contener letras, espacios y guiones";
        return null;

      case "position":
        if (!value) return "El cargo es obligatorio";
        if (value.length < 2)
          return "El cargo debe tener al menos 2 caracteres";
        if (value.length > 50)
          return "El cargo no puede tener más de 50 caracteres";
        return null;

      case "phone":
        if (!value) return "El número de teléfono es obligatorio";
        if (!/^\+?\d{10,15}$/.test(value.replace(/\D/g, "")))
          return "El número de teléfono debe tener entre 10 y 15 dígitos";
        return null;

      case "numDocument":
        if (!value) return "El número de documento es obligatorio";
        if (!/^\d{8,10}$/.test(value))
          return "El documento debe tener entre 8 y 10 dígitos";
        return null;

      case "password":
        if (!value) return "La contraseña es obligatoria";
        if (value.length < 10)
          return "La contraseña debe tener al menos 10 caracteres";
        if (!/[A-Z]/.test(value))
          return "La contraseña debe contener al menos una mayúscula";
        if (!/[a-z]/.test(value))
          return "La contraseña debe contener al menos una minúscula";
        if (!/\d/.test(value))
          return "La contraseña debe contener al menos un número";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
          return "La contraseña debe contener al menos un carácter especial";
        return null;

      case "confirmPassword":
        if (!value) return "La confirmación de contraseña es obligatoria";
        if (value !== password) return "Las contraseñas no coinciden";
        return null;

      default:
        return null;
    }
  };

  // Función para validar todos los campos del paso actual
  const validateCurrentStep = (): boolean => {
    const currentErrors: ValidationErrors = {};
    let isValid = true;

    if (stepActive === 1) {
      const fieldsToValidate: (keyof FormData)[] = [
        "nameCompany",
        "businessName",
        "typeDocumentCompany",
        "numDocumentCompany",
        "ciiu",
        "webSite",
        "addressCompany",
        "department",
        "city",
      ];

      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        const error = validateField(field, value);
        if (error) {
          currentErrors[field] = error;
          isValid = false;
        }
      });

      if (!logo) {
        currentErrors.logo = "El logo es obligatorio";
        isValid = false;
      }
    } else if (stepActive === 2) {
      const fieldsToValidate: (keyof FormData)[] = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "typeDocument",
        "numDocument",
        "pronoun",
        "position",
      ];

      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        const error = validateField(field, value);
        if (error) {
          currentErrors[field] = error;
          isValid = false;
        }
      });

      if (!photo) {
        currentErrors.photo = "La foto de perfil es obligatoria";
        isValid = false;
      }

      if (emailError) {
        currentErrors.email = emailError;
        isValid = false;
      }
    } else if (stepActive === 3) {
      const fieldsToValidate: (keyof FormData)[] = [
        "password",
        "confirmPassword",
      ];
      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        const error = validateField(field, value);
        if (error) {
          currentErrors[field] = error;
          isValid = false;
        }
      });
    }

    setValidationErrors(currentErrors);
    return isValid;
  };

  // Modificar la función handleNextStep
  const handleNextStep = async () => {
    if (stepActive === 2) {
      const isEmailValid = await validateEmail(email);
      if (!isEmailValid) return;
    }

    if (validateCurrentStep()) {
      setStepActive(stepActive + 1);
    }
  };

  // Modificar el useEffect para validar el paso actual
  useEffect(() => {
    const isValid = validateCurrentStep();
    setActiveNextButton(isValid);
  }, [
    nameCompany,
    businessName,
    typeDocumentCompany,
    numDocumentCompany,
    ciiu,
    webSite,
    addressCompany,
    department,
    city,
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
    photo,
    emailError,
    membership,
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
    if (dataCIIU) {
      const options = dataCIIU.map((item: CIIUData) => ({
        value: item.clasificacion_ciiu,
        label: item.clasificacion_ciiu,
      }));
      setOptionsCIIU(options);
    }
  }, [dataCIIU]);

  // Actualizar opciones de ciudades cuando cambie el departamento
  useEffect(() => {
    if (department) {
      const ciudades = getCiudadesOptionsByDepartamento(department);
      setCiudadesOptions(ciudades);
      // Limpiar la ciudad seleccionada cuando cambie el departamento
      setValue("city", "");
    } else {
      setCiudadesOptions([]);
    }
  }, [department, setValue]);

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
        const response = await fetch("/api/create-sanity-user", {
          method: "POST",
          body: JSON.stringify({
            ...data,
            firebaseUid: firebaseUser.uid,
            logo: logoSanity,
            photo: photoSanity,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setShowSuccessModal(true);
          return;
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al crear usuario en Sanity"
          );
        }
      }
    } catch (error) {
      console.error("Error en el proceso de registro:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsLoading(false); // Finalizamos el estado de carga independientemente del resultado
    }
  };

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
      const fileType = file.type.split("/")[1];

      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: base64,
          fileType,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      return await response.json();
    } catch (error) {
      console.error("Error al subir imagen:", error);
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
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.message || "Error al verificar el email");
        return false;
      }

      if (data.exists) {
        setEmailError("Este correo electrónico ya está registrado");
        return false;
      }

      return true;
    } catch (error: unknown) {
      setEmailError(
        error instanceof Error ? error.message : "Error al verificar el email"
      );
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:gap-10">
      <div className="lg:border-r border-slate-200 p-5 w-full xl:w-1/4 bg-white relative">
        <div>
          <Button
            onClick={() => router.push("/")}
            className="mb-8 flex flex-wrap gap-2"
            outline
            color="blue"
          >
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
                      <Label htmlFor="logo">
                        Logo de la marca <span className="text-red-500">*</span>
                      </Label>
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
                            <span className="text-xl font-bold text-white">
                              Logo
                            </span>
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
                      {validationErrors.logo && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.logo}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="nameCompany">
                          Nombre de la marca{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          {...register("nameCompany", {
                            required: "El nombre de la empresa es obligatorio",
                            onChange: (e) => {
                              const error = validateField(
                                "nameCompany",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  nameCompany: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          color={
                            validationErrors.nameCompany ? "failure" : "blue"
                          }
                          id="nameCompany"
                          placeholder="Nombre de la marca"
                        />
                        {validationErrors.nameCompany && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.nameCompany}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="businessName">
                          Razón social <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          {...register("businessName", {
                            required: "La razón social es obligatoria",
                            onChange: (e) => {
                              const error = validateField(
                                "businessName",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  businessName: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          color={
                            validationErrors.businessName ? "failure" : "blue"
                          }
                          id="businessName"
                          placeholder="Razón social"
                        />
                        {validationErrors.businessName && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.businessName}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="typeDocumentCompany">
                          Documento <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-1">
                          <Select
                            {...register("typeDocumentCompany", {
                              required: "El tipo de documento es obligatorio",
                              onChange: (e) => {
                                const error = validateField(
                                  "typeDocumentCompany",
                                  e.target.value
                                );
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    typeDocumentCompany: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const { ...rest } = prev;
                                    return rest;
                                  });
                                }
                              },
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
                              onChange: (e) => {
                                const error = validateField(
                                  "numDocumentCompany",
                                  e.target.value
                                );
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    numDocumentCompany: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const { ...rest } = prev;
                                    return rest;
                                  });
                                }
                              },
                            })}
                            className="w-auto flex-grow"
                            color="blue"
                            id="numDocumentCompany"
                            placeholder="Número de documento"
                            type="number"
                          />
                        </div>
                        {validationErrors.numDocumentCompany && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.numDocumentCompany}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="ciiu">
                          Código CIIU (actividad principal){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        {isClient && (
                          <ReactSelect
                            options={optionsCIIU}
                            value={
                              optionsCIIU.find(
                                (option) => option.value === ciiu
                              ) || null
                            }
                            onChange={(option) =>
                              setValue("ciiu", option?.value || "")
                            }
                            placeholder="Selecciona o busca un código CIIU"
                            isSearchable
                            name="ciiu"
                            inputId="ciiu"
                          />
                        )}
                        {validationErrors.ciiu && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.ciiu}
                          </p>
                        )}
                      </div>

                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="webSite">
                          Página Web <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          {...register("webSite", {
                            required: "La página web es obligatoria",
                            onChange: (e) => {
                              const error = validateField(
                                "webSite",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  webSite: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          color={validationErrors.webSite ? "failure" : "blue"}
                          id="webSite"
                          type="url"
                          pattern="https?://.+"
                          placeholder="https://www.misitio.com"
                        />
                        {validationErrors.webSite && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.webSite}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="addressCompany">
                          Dirección <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          {...register("addressCompany", {
                            required: "La dirección es obligatoria",
                            onChange: (e) => {
                              const error = validateField(
                                "addressCompany",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  addressCompany: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          color={
                            validationErrors.addressCompany ? "failure" : "blue"
                          }
                          id="addressCompany"
                          placeholder="Calle 123 # 45-67"
                        />
                        {validationErrors.addressCompany && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.addressCompany}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="department">
                          Departamento <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          {...register("department", {
                            required: "El departamento es obligatorio",
                            onChange: (e) => {
                              const error = validateField(
                                "department",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  department: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          id="department"
                          className="w-full"
                          color="blue"
                        >
                          <option value="">Selecciona un departamento</option>
                          {getDepartamentosOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {validationErrors.department && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.department}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                        <Label htmlFor="city">
                          Ciudad <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          {...register("city", {
                            required: "La ciudad es obligatoria",
                            onChange: (e) => {
                              const error = validateField(
                                "city",
                                e.target.value
                              );
                              if (error) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  city: error,
                                }));
                              } else {
                                setValidationErrors((prev) => {
                                  const { ...rest } = prev;
                                  return rest;
                                });
                              }
                            },
                          })}
                          id="city"
                          className="w-full"
                          color="blue"
                          disabled={!department}
                        >
                          <option value="">Selecciona una ciudad</option>
                          {ciudadesOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {validationErrors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.city}
                          </p>
                        )}
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
                <Label htmlFor="foto-perfil">
                  Foto de perfil <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-2">
                  <div
                    onClick={handlePhotoUploadClick}
                    className={`${photoPreview ? "bg-white" : "bg-red-500"} w-[80px] h-[80px] flex items-center justify-center rounded-full min-w-[80px] cursor-pointer`}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">Foto</span>
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={handlePhotoUploadClick}
                      className="font-bold"
                      color="light"
                    >
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
                {validationErrors.photo && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.photo}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row flex-wrap mt-5 gap-y-4 -mx-2">
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="firstName">
                    Nombre(s) <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    {...register("firstName", {
                      required: "El nombre es obligatorio",
                      onChange: (e) => {
                        const error = validateField(
                          "firstName",
                          e.target.value
                        );
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            firstName: error,
                          }));
                        } else {
                          setValidationErrors((prev) => {
                            const { ...rest } = prev;
                            return rest;
                          });
                        }
                      },
                    })}
                    color={validationErrors.firstName ? "failure" : "blue"}
                    id="firstName"
                    placeholder="John"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="lastName">
                    Apellido(s) <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    {...register("lastName", {
                      required: "El apellido es obligatorio",
                      onChange: (e) => {
                        const error = validateField("lastName", e.target.value);
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            lastName: error,
                          }));
                        } else {
                          setValidationErrors((prev) => {
                            const { ...rest } = prev;
                            return rest;
                          });
                        }
                      },
                    })}
                    color={validationErrors.lastName ? "failure" : "blue"}
                    id="apellido"
                    placeholder="Doe"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.lastName}
                    </p>
                  )}
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
                  <Label htmlFor="position">
                    Cargo <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    {...register("position", {
                      required: "El cargo es obligatorio",
                      onChange: (e) => {
                        const error = validateField("position", e.target.value);
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            position: error,
                          }));
                        } else {
                          setValidationErrors((prev) => {
                            const { ...rest } = prev;
                            return rest;
                          });
                        }
                      },
                    })}
                    color={validationErrors.position ? "failure" : "blue"}
                    id="position"
                    placeholder="CEO"
                  />
                  {validationErrors.position && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.position}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="email">
                    Correo electrónico <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "El correo electrónico no es válido",
                      },
                      onBlur: async (e) => {
                        const value = e.target.value;
                        if (!value) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            email: "El correo electrónico es obligatorio",
                          }));
                          return;
                        }
                        if (value && isValidEmail(value)) {
                          await validateEmail(value);
                        } else {
                          setEmailError("El correo electrónico no es válido");
                        }
                      },
                      onChange: async (e) => {
                        const value = e.target.value;
                        setEmailError(null);
                        if (value && isValidEmail(value)) {
                          await validateEmail(value);
                        }
                      },
                    })}
                    type="email"
                    color={
                      validationErrors.email || emailError ? "failure" : "blue"
                    }
                    id="email"
                    placeholder="email@miempresa.com"
                  />
                  {(validationErrors.email || emailError) && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.email || emailError}
                    </p>
                  )}
                  {isCheckingEmail && (
                    <p className="text-blue-500 text-sm mt-1">
                      Verificando email...
                    </p>
                  )}
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="phone">
                    Número de teléfono <span className="text-red-500">*</span>
                  </Label>
                  <InternationalPhoneInput
                    {...register("phone", {
                      required: "El número de teléfono es obligatorio",
                      onChange: (e) => {
                        const value = e.target.value;
                        const error = validateField("phone", value);
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            phone: error,
                          }));
                        } else {
                          setValidationErrors((prev) => {
                            const { ...rest } = prev;
                            return rest;
                          });
                        }
                      },
                      setValueAs: (value) => {
                        if (!value.startsWith("+")) {
                          return `+57${value}`;
                        }
                        return value;
                      },
                    })}
                    name="phone"
                    id="phone"
                    placeholder="Número de teléfono"
                    color={validationErrors.phone ? "failure" : "blue"}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="typeDocument">
                    Documento <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-1">
                    <Select
                      {...register("typeDocument", {
                        required: "El tipo de documento es obligatorio",
                        onChange: (e) => {
                          const error = validateField(
                            "typeDocument",
                            e.target.value
                          );
                          if (error) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              typeDocument: error,
                            }));
                          } else {
                            setValidationErrors((prev) => {
                              const { ...rest } = prev;
                              return rest;
                            });
                          }
                        },
                      })}
                      id="typeDocument"
                      className="w-[100px]"
                      color={validationErrors.typeDocument ? "failure" : "blue"}
                    >
                      <option value="cc">CC</option>
                      <option value="ce">CE</option>
                    </Select>
                    <TextInput
                      {...register("numDocument", {
                        required: "El número de documento es obligatorio",
                        onChange: (e) => {
                          const error = validateField(
                            "numDocument",
                            e.target.value
                          );
                          if (error) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              numDocument: error,
                            }));
                          } else {
                            setValidationErrors((prev) => {
                              const { ...rest } = prev;
                              return rest;
                            });
                          }
                        },
                      })}
                      className="w-auto flex-grow"
                      color={validationErrors.numDocument ? "failure" : "blue"}
                      id="numDocument"
                      placeholder="Número de documento"
                      type="number"
                    />
                  </div>
                  {(validationErrors.typeDocument ||
                    validationErrors.numDocument) && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.typeDocument ||
                        validationErrors.numDocument}
                    </p>
                  )}
                </div>

                <div className="w-full px-4 space-y-4 text-center py-5 gap-2 bg-blue-100 rounded-lg">
                  <p className="lg:text-lg font-normal">
                    ¿Tienes una afiliación o membresía activa en la Cámara de la
                    Diversidad? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex items-center gap-8 justify-center">
                    <div className="flex items-center gap-2 lg:gap-0">
                      <Radio
                        {...register("membership")}
                        id="yesMembership"
                        className="w-5 h-5 lg:mr-2 lg:mt-1"
                        color="blue"
                        value="yes"
                      />
                      <Label htmlFor="yesMembership">Si</Label>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-0">
                      <Radio
                      {...register("membership")}
                      id="noMembership"
                      className="w-5 h-5 lg:mr-2 lg:mt-1"
                      color="blue"
                      value="no"
                      defaultChecked={true}
                      />
                      <Label htmlFor="noMembership">No</Label>
                    </div>
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
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <TextInput
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                          value: 10,
                          message:
                            "La contraseña debe tener al menos 10 caracteres",
                        },
                        validate: {
                          isValid: (value) =>
                            isPasswordValid(value) ||
                            "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                        },
                      })}
                      required
                      color="blue"
                      id="password"
                      placeholder="**********"
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      onPaste={(e) => e.preventDefault()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.password}
                    </p>
                  )}
                  <ul className="text-xs text-slate-500 md:text-sm mt-2 lg:mt-0 space-y-1">
                    <li className="text-xs">
                      <RiCheckboxCircleFill
                        className={`text-sm inline-block ${password?.length >= 10 ? "text-blue-600" : "text-slate-500"}`}
                      />{" "}
                      Al menos 10 carácteres
                    </li>
                    <li className="text-xs">
                      <RiCheckboxCircleFill
                        className={`text-sm inline-block ${password?.match(/[A-Z]/) ? "text-blue-600" : "text-slate-500"}`}
                      />{" "}
                      1 letra mayúscula
                    </li>
                    <li className="text-xs">
                      <RiCheckboxCircleFill
                        className={`text-sm inline-block ${password?.match(/[!@#$%^&*(),.?":{}|<>]/) ? "text-blue-600" : "text-slate-500"}`}
                      />{" "}
                      1 carácter especial como .,#@?*
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/2 px-2 space-y-1">
                  <Label htmlFor="confirm-password">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <TextInput
                      {...register("confirmPassword", {
                        required:
                          "La confirmación de contraseña es obligatoria",
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
                      onPaste={(e) => e.preventDefault()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.confirmPassword}
                    </p>
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
                    "Crear cuenta"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
      <Modal show={showSuccessModal} size="md" onClose={() => {}}>
        <Modal.Header>¡Registro exitoso!</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>Tu cuenta ha sido creada correctamente.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Revisa tu correo electrónico y haz clic en el enlace de
                verificación que te hemos enviado.
              </li>
              <li>
                Debes esperar a que un administrador active tu empresa. Te
                notificaremos cuando puedas acceder a la plataforma.
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={() => router.push("/login")}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
