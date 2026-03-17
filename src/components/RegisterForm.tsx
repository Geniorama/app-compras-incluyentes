"use client";

import {
  Label,
  TextInput,
  Textarea,
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
import Image from "next/image";
import InternationalPhoneInput from "./InternationalPhoneInput ";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { RiCheckboxCircleFill } from "react-icons/ri";
import LogoColor from "@/assets/img/logo-color.webp";
import { useForm } from "react-hook-form";
import dataCIIU from "@/data/ciiu";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { RiEyeLine } from "react-icons/ri";
import { RiEyeOffLine } from "react-icons/ri";
import ReactSelect from "react-select";
import { getSectorFromCIIU } from "@/utils/ciiuOptions";
import { getDepartamentosOptions, getCiudadesOptionsByDepartamento } from "@/utils/departamentosCiudades";
import { getMexicoEstadosOptions, getMexicoMunicipiosByEstado } from "@/data/mexicoStates";
import { LATIN_AMERICA_COUNTRIES } from "@/data/latinAmericaCountries";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_.,?":{}|<>-]/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_.,?":{}|<>-])[A-Za-z\d!@#$%^&*()_.,?":{}|<>-]{10,}$/;

const LATAM_OPTIONS = LATIN_AMERICA_COUNTRIES.map((c) => ({
  value: c.value,
  label: c.title,
}));

const PEOPLE_GROUP_OPTIONS = [
  { value: 'lgbtiq', label: 'LGBTIQ+' },
  { value: 'discapacidad-sensorial', label: 'Personas con discapacidad Sensorial' },
  { value: 'discapacidad-fisico-motora', label: 'Personas con discapacidad Físico Motora' },
  { value: 'discapacidad-psicosocial', label: 'Personas con discapacidad Psicosocial' },
  { value: 'discapacidad-cognitiva', label: 'Personas con discapacidad Cognitiva' },
  { value: 'migrantes', label: 'Migrantes' },
  { value: 'etnia-afrodescendientes', label: 'Etnia y Raza: Afrodescendientes, raizales y palenqueros' },
  { value: 'etnia-indigenas', label: 'Etnia y Raza: Indígenas' },
  { value: 'victimas-reconciliacion-paz', label: 'Víctimas de reconciliación y paz (víctimas, victimarios)' },
  { value: 'pospenadas', label: 'Pospenadas' },
  { value: 'diversidad-generacional-mayores-50', label: 'Diversidad Generacional mayores de 50 años' },
  { value: 'diversidad-generacional-primer-empleo', label: 'Diversidad Generacional primer empleo' },
  { value: 'madres-cabeza-familia', label: 'Madres cabeza de familia' },
  { value: 'diversidad-sexual', label: 'Diversidad Sexual' },
  { value: 'personas-discapacidad', label: 'Personas con discapacidad' },
  { value: 'etnia-raza-afro', label: 'Etnia, raza o afro' },
  { value: 'personas-migrantes', label: 'Personas migrantes' },
  { value: 'generacional', label: 'Generacional' },
  { value: 'equidad-genero', label: 'Equidad de Género' },
  { value: 'pospenados-reinsertados', label: 'Pospenados o reinsertados' },
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'otro', label: 'Otro' },
];

interface FormData {
  nameCompany: string;
  businessName: string;
  description?: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  webSite: string;
  addressCompany: string;
  department: string;
  city: string;
  countries: string[];
  addressCountry: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  typeDocument: string;
  numDocument: string;
  pronoun: string;
  position: string;
  userCountry: string;
  userDepartment: string;
  userCity: string;
  password: string;
  confirmPassword: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
  membership?: string;
  companySize?: "micro" | "pequena" | "mediana" | "grande" | "indefinido";
  peopleGroup?: string[];
  otherPeopleGroup?: string;
  dataTreatmentConsent: boolean;
  infoVisibilityConsent: boolean;
  friendlyBizz: boolean;
  inclusionDEI?: string;
  annualRevenue: number;
  collaboratorsCount?: number;
  publicProfile?: boolean;
}

// Agregar interfaces para validaciones
interface ValidationErrors {
  [key: string]: string;
}

export default function RegisterForm() {
  const [stepActive, setStepActive] = useState(1);
  const [activeNextButton, setActiveNextButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingCompanyDocument, setIsCheckingCompanyDocument] =
    useState(false);
  const [companyDocumentError, setCompanyDocumentError] = useState<
    string | null
  >(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [chamberOfCommerce, setChamberOfCommerce] = useState<File | null>(null);
  const [taxIdentificationDocument, setTaxIdentificationDocument] = useState<File | null>(null);
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
  const [annualRevenue, setAnnualRevenue] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [companyCityOptions, setCompanyCityOptions] = useState<{ value: string; label: string }[]>([]);
  const [userCityOptions, setUserCityOptions] = useState<{ value: string; label: string }[]>([]);

  const departamentosOptions = getDepartamentosOptions();
  const mexEstadosOptions = getMexicoEstadosOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const chamberOfCommerceInputRef = useRef<HTMLInputElement>(null);
  const taxIdentificationDocumentInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      countries: [],
      addressCountry: "",
      userCountry: "",
      userDepartment: "",
      userCity: "",
    },
  });

  // Fields Step 1
  const nameCompany = watch("nameCompany");
  const businessName = watch("businessName");
  const ciiu = watch("ciiu");
  const webSite = watch("webSite");
  const addressCompany = watch("addressCompany");
  const department = watch("department");
  const city = watch("city");
  const countries = watch("countries");
  const addressCountry = watch("addressCountry");
  const companySize = watch("companySize");
  const peopleGroup = watch("peopleGroup");
  const otherPeopleGroup = watch("otherPeopleGroup");
  const friendlyBizz = watch("friendlyBizz");

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
  const userCountry = watch("userCountry");
  const userDepartment = watch("userDepartment");
  const userCity = watch("userCity");
  // Fields Step 3
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const dataTreatmentConsent = watch("dataTreatmentConsent");
  const infoVisibilityConsent = watch("infoVisibilityConsent");

  const isPasswordValid = (password: string) => PASSWORD_REGEX.test(password);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Función para validar campos específicos
  const validateField = useCallback(
    (
      name: string,
      value: string | string[] | boolean | undefined
    ): string | null => {
      if (value === undefined) return "Este campo es obligatorio";
      switch (name) {
        case "nameCompany":
          if (!value) return "El nombre de la marca es obligatorio";
          if (typeof value === "string") {
            if (value.length < 3)
              return "El nombre de la marca debe tener al menos 3 caracteres";
            if (value.length > 50)
              return "El nombre de la marca no puede tener más de 50 caracteres";
            if (!/^[a-zA-Z0-9\s-]+$/.test(value))
              return "El nombre de la marca solo puede contener letras, números, espacios y guiones";
          }
          return null;

      case "businessName":
        if (!value) return "La razón social es obligatoria";
        if (typeof value === "string") {
          if (value.length < 3)
            return "La razón social debe tener al menos 3 caracteres";
          if (value.length > 100)
            return "La razón social no puede tener más de 100 caracteres";
        }
        return null;

      case "numDocumentCompany":
        if (!value) return "El número de documento es obligatorio";
        if (typeof value === "string") {
          const currentTypeDoc = watch("typeDocumentCompany");
          if (currentTypeDoc === "nit" && !/^\d{9,10}$/.test(value))
            return "El NIT debe tener entre 9 y 10 dígitos";
          if (
            (currentTypeDoc === "cc" || currentTypeDoc === "ce") &&
            !/^\d{8,10}$/.test(value)
          )
            return "El documento debe tener entre 8 y 10 dígitos";
        }
        return null;

      case "webSite":
        if (!value) return "La página web es obligatoria";
        if (typeof value === "string" && !/^https?:\/\/.+/.test(value))
          return "La URL debe comenzar con http:// o https://";
        return null;

      case "addressCompany":
        if (!value) return "La dirección es obligatoria";
        if (typeof value === "string") {
          if (value.length < 5)
            return "La dirección debe tener al menos 5 caracteres";
          if (value.length > 200)
            return "La dirección no puede tener más de 200 caracteres";
        }
        return null;

      case "department":
        if (addressCountry === "CO" || addressCountry === "MX") {
          if (!value) return addressCountry === "MX" ? "El estado es obligatorio" : "El departamento es obligatorio";
        }
        return null;

      case "city":
        if (addressCountry === "CO" || addressCountry === "MX") {
          if (!value) return addressCountry === "MX" ? "El municipio es obligatorio" : "La ciudad es obligatoria";
        }
        return null;

      case "countries":
        if (!Array.isArray(value) || value.length === 0) return "Debe seleccionar al menos un país";
        return null;

      case "addressCountry":
        const countriesList = watch("countries") as string[] | undefined;
        const hasCoOrMx = Array.isArray(countriesList) && (countriesList.includes("CO") || countriesList.includes("MX"));
        if (hasCoOrMx && !value) return "El país de la sede principal es obligatorio";
        return null;

      case "userCountry":
        if (!value) return "El país es obligatorio";
        return null;

      case "userDepartment":
        if (userCountry === "CO" || userCountry === "MX") {
          if (!value) return userCountry === "MX" ? "El estado es obligatorio" : "El departamento es obligatorio";
        }
        return null;

      case "userCity":
        if (userCountry === "CO" || userCountry === "MX") {
          if (!value) return userCountry === "MX" ? "El municipio es obligatorio" : "La ciudad es obligatoria";
        }
        return null;

      case "companySize":
        if (!value) return "El tamaño de la empresa es obligatorio";
        return null;

      case "peopleGroup":
        // Solo es obligatorio si la empresa NO es grande
        if (companySize !== "grande") {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "Debe seleccionar al menos una opción para empresas pequeñas y medianas";
            }
          } else if (!value) {
            return "Debe seleccionar al menos una opción para empresas pequeñas y medianas";
          }
        }
        return null;

      case "otherPeopleGroup":
        const hasOtro = Array.isArray(peopleGroup) 
          ? peopleGroup.includes("otro")
          : peopleGroup === "otro";
        if (hasOtro && !value) {
          return "Debe especificar el grupo poblacional cuando selecciona 'Otro'";
        }
        return null;

      case "firstName":
        if (!value) return "El nombre es obligatorio";
        if (typeof value === "string") {
          if (value.length < 2)
            return "El nombre debe tener al menos 2 caracteres";
          if (value.length > 50)
            return "El nombre no puede tener más de 50 caracteres";
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value))
            return "El nombre solo puede contener letras, espacios y guiones";
        }
        return null;

      case "lastName":
        if (!value) return "El apellido es obligatorio";
        if (typeof value === "string") {
          if (value.length < 2)
            return "El apellido debe tener al menos 2 caracteres";
          if (value.length > 50)
            return "El apellido no puede tener más de 50 caracteres";
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value))
            return "El apellido solo puede contener letras, espacios y guiones";
        }
        return null;

      case "position":
        if (!value) return "El cargo es obligatorio";
        if (typeof value === "string") {
          if (value.length < 2)
            return "El cargo debe tener al menos 2 caracteres";
          if (value.length > 50)
            return "El cargo no puede tener más de 50 caracteres";
        }
        return null;

      case "phone":
        if (!value) return "El número de teléfono es obligatorio";
        if (
          typeof value === "string" &&
          !/^\+?\d{10,15}$/.test(value.replace(/\D/g, ""))
        )
          return "El número de teléfono debe tener entre 10 y 15 dígitos";
        return null;

      case "numDocument":
        if (!value) return "El número de documento es obligatorio";
        if (typeof value === "string" && !/^\d{8,10}$/.test(value))
          return "El documento debe tener entre 8 y 10 dígitos";
        return null;

      case "password":
        if (!value) return "La contraseña es obligatoria";
        if (typeof value === "string") {
          if (value.length < 10)
            return "La contraseña debe tener al menos 10 caracteres";
          if (!/[A-Z]/.test(value))
            return "La contraseña debe contener al menos una mayúscula";
          if (!/[a-z]/.test(value))
            return "La contraseña debe contener al menos una minúscula";
          if (!/\d/.test(value))
            return "La contraseña debe contener al menos un número";
          if (!SPECIAL_CHAR_REGEX.test(value))
            return "La contraseña debe contener al menos un carácter especial";
          if (!PASSWORD_REGEX.test(value))
            return "La contraseña contiene caracteres no permitidos";
        }
        return null;

      case "confirmPassword":
        if (!value) return "La confirmación de contraseña es obligatoria";
        if (typeof value === "string" && value !== password)
          return "Las contraseñas no coinciden";
        return null;
      case "dataTreatmentConsent":
        if (value !== true)
          return "Debes aceptar el tratamiento de datos personales";
        return null;
      case "infoVisibilityConsent":
        // Ya no es obligatorio, así que no retorna error si no está seleccionado
        return null;

        default:
          return null;
      }
    },
    [companySize, peopleGroup, password, watch, addressCountry, userCountry]
  );

  // Función para validar todos los campos del paso actual
  const validateCurrentStep = useCallback((): boolean => {
    const currentErrors: ValidationErrors = {};
    let isValid = true;

    if (stepActive === 1) {
      // Asegurar que companySize tenga un valor válido antes de la validación
      const currentCompanySize = watch("companySize");
      if (!currentCompanySize) {
        setValue("companySize", "indefinido");
      }

      const fieldsToValidate: (keyof FormData)[] = [
        "nameCompany",
        "businessName",
        "typeDocumentCompany",
        "numDocumentCompany",
        "ciiu",
        "webSite",
        "addressCompany",
        "countries",
        "companySize",
      ];
      const countriesList = watch("countries") as string[] | undefined;
      const hasCoOrMx = Array.isArray(countriesList) && (countriesList.includes("CO") || countriesList.includes("MX"));
      if (hasCoOrMx) {
        fieldsToValidate.push("addressCountry", "department", "city");
      }

      // Validar otherPeopleGroup solo si peopleGroup incluye "otro"
      const hasOtro = Array.isArray(peopleGroup) 
        ? peopleGroup.includes("otro")
        : peopleGroup === "otro";
      if (hasOtro) {
        fieldsToValidate.push("otherPeopleGroup");
      }
      // Validar peopleGroup solo si companySize NO es "grande"
      if (companySize !== "grande") {
        fieldsToValidate.push("peopleGroup");
      }

      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        // Ajustar para pasar correctamente el tipo de dato
        const error = validateField(
          field,
          typeof value === "boolean" ? value : (value as string | undefined)
        );
        if (error) {
          currentErrors[field] = error;
          isValid = false;
        }
      });

      if (!logo) {
        currentErrors.logo = "El logo es obligatorio";
        isValid = false;
      }

      if (companyDocumentError) {
        currentErrors.numDocumentCompany = companyDocumentError;
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
        "userCountry",
      ];
      const uc = watch("userCountry");
      if (uc === "CO" || uc === "MX") {
        fieldsToValidate.push("userDepartment", "userCity");
      }

      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        const error = validateField(
          field,
          typeof value === "boolean" ? value : (value as string | undefined)
        );
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
        "dataTreatmentConsent",
        "infoVisibilityConsent",
      ];
      fieldsToValidate.forEach((field: keyof FormData) => {
        const value = watch(field);
        const error = validateField(
          field,
          typeof value === "boolean" ? value : (value as string | undefined)
        );
        if (error) {
          currentErrors[field] = error;
          isValid = false;
        }
      });
    }

    setValidationErrors(currentErrors);
    return isValid;
  }, [
    stepActive,
    watch,
    peopleGroup,
    companySize,
    logo,
    companyDocumentError,
    validateField,
    photo,
    emailError,
    setValue,
  ]);

  // Modificar la función handleNextStep
  const handleNextStep = async () => {
    if (stepActive === 1) {
      const isCompanyDocumentValid = await validateCompanyDocument(
        watch("typeDocumentCompany"),
        watch("numDocumentCompany")
      );
      if (!isCompanyDocumentValid) return;
    } else if (stepActive === 2) {
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
    ciiu,
    webSite,
    addressCompany,
    department,
    city,
    countries,
    addressCountry,
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
    userCountry,
    userDepartment,
    userCity,
    logo,
    photo,
    emailError,
    companyDocumentError,
    membership,
    companySize,
    peopleGroup,
    otherPeopleGroup,
    dataTreatmentConsent,
    infoVisibilityConsent,
    friendlyBizz,
    validateCurrentStep,
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!department || !addressCountry) {
      setCompanyCityOptions([]);
      return;
    }
    if (addressCountry === "MX") {
      setCompanyCityOptions(getMexicoMunicipiosByEstado(department));
    } else {
      setCompanyCityOptions(getCiudadesOptionsByDepartamento(department));
    }
  }, [department, addressCountry]);

  useEffect(() => {
    if (!userDepartment || !userCountry) {
      setUserCityOptions([]);
      return;
    }
    if (userCountry === "MX") {
      setUserCityOptions(getMexicoMunicipiosByEstado(userDepartment));
    } else {
      setUserCityOptions(getCiudadesOptionsByDepartamento(userDepartment));
    }
  }, [userDepartment, userCountry]);

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
    const options = dataCIIU.map((item: CIIUData) => ({
      value: item.clasificacion_ciiu,
      label: item.clasificacion_ciiu,
    }));
    setOptionsCIIU(options);
  }, []);


  // Actualizar sector cuando cambie el CIIU
  useEffect(() => {
    if (ciiu) {
      const sectorResult = getSectorFromCIIU(ciiu);
      setSector(sectorResult || "");
    } else {
      setSector("");
    }
  }, [ciiu]);

  // Inicializar companySize como "indefinido" por defecto
  useEffect(() => {
    setValue("companySize", "indefinido");
  }, [setValue]); // Sin dependencias para que se ejecute solo una vez al montar

  // Calcular companySize automáticamente
  useEffect(() => {
    if (!sector || !annualRevenue) {
      setValue("companySize", "indefinido");
      return;
    }
    // Para el cálculo, usar el valor numérico limpio
    const revenueNum = parseInt(annualRevenue.replace(/[^\d]/g, ""), 10);
    let size: "micro" | "pequena" | "mediana" | "grande" | "indefinido" =
      "indefinido";
    if (sector === "COMERCIO") {
      if (revenueNum <= 1163000000) size = "micro";
      else if (revenueNum > 1163000000 && revenueNum <= 4074000000)
        size = "pequena";
      else if (revenueNum > 4074000000 && revenueNum <= 15563000000)
        size = "mediana";
      else if (revenueNum > 15563000000) size = "grande";
    } else if (sector === "MANUFACTURA") {
      if (revenueNum <= 652000000) size = "micro";
      else if (revenueNum > 652000000 && revenueNum <= 2601000000)
        size = "pequena";
      else if (revenueNum > 2601000000 && revenueNum <= 23563000000)
        size = "mediana";
      else if (revenueNum > 23563000000) size = "grande";
    } else if (sector === "SERVICIOS") {
      if (revenueNum <= 519000000) size = "micro";
      else if (revenueNum > 519000000 && revenueNum <= 1877000000)
        size = "pequena";
      else if (revenueNum > 1877000000 && revenueNum <= 7523000000)
        size = "mediana";
      else if (revenueNum > 7523000000) size = "grande";
    } else {
      size = "indefinido";
    }
    setValue("companySize", size);
  }, [sector, annualRevenue, setValue]);

  // Limpiar campos de grupo poblacional si no es empresa grande
  useEffect(() => {
    if (companySize === "grande") {
      setValue("peopleGroup", []);
      setValue("otherPeopleGroup", "");
    }
  }, [companySize, setValue]);

  // Establecer publicProfile según companySize
  useEffect(() => {
    if (companySize && companySize !== "grande") {
      // Si no es grande, el perfil debe ser público obligatoriamente
      setValue("publicProfile", true);
    } else if (companySize === "grande") {
      // Si es grande, establecer el valor por defecto a false (pueden cambiarlo)
      if (watch("publicProfile") === undefined) {
        setValue("publicProfile", false);
      }
    }
  }, [companySize, setValue, watch]);

  const handleRegister = async (data: FormData) => {
    try {
      setIsLoading(true); // Iniciamos el estado de carga

      // 1. Registrar usuario en Firebase
      const firebaseUser = await registerUser(data.email, data.password);

      if (firebaseUser) {
        // 2. Subir imágenes y archivos a Sanity primero
        let logoSanity = null;
        let photoSanity = null;
        let chamberOfCommerceSanity = null;
        let taxIdentificationDocumentSanity = null;

        if (logo) {
          logoSanity = await uploadImageToSanity(logo);
        }
        if (photo) {
          photoSanity = await uploadImageToSanity(photo);
        }
        if (chamberOfCommerce) {
          try {
            chamberOfCommerceSanity = await uploadFileToSanity(chamberOfCommerce);
            console.log("Cámara de Comercio subida exitosamente:", chamberOfCommerceSanity);
          } catch (error) {
            console.error("Error al subir Cámara de Comercio:", error);
            throw new Error(`Error al subir Cámara de Comercio: ${error instanceof Error ? error.message : "Error desconocido"}`);
          }
        }
        if (taxIdentificationDocument) {
          try {
            taxIdentificationDocumentSanity = await uploadFileToSanity(taxIdentificationDocument);
            console.log("Documento de identificación tributaria subido exitosamente:", taxIdentificationDocumentSanity);
          } catch (error) {
            console.error("Error al subir documento de identificación tributaria:", error);
            throw new Error(`Error al subir documento de identificación tributaria: ${error instanceof Error ? error.message : "Error desconocido"}`);
          }
        }

        // 3. Crear usuario en Sanity con las referencias de las imágenes y archivos
        const countriesList = Array.isArray(data.countries) ? data.countries : [];
        const addrCountry = data.addressCountry || (countriesList.includes("CO") ? "CO" : countriesList.includes("MX") ? "MX" : countriesList[0] || "");
        const companyCountry = addrCountry || countriesList[0] || "";

        const response = await fetch("/api/create-sanity-user", {
          method: "POST",
          body: JSON.stringify({
            ...data,
            countries: countriesList,
            country: companyCountry,
            department: addrCountry ? data.department : "",
            city: addrCountry ? data.city : "",
            firebaseUid: firebaseUser.uid,
            logo: logoSanity,
            photo: photoSanity,
            chamberOfCommerce: chamberOfCommerceSanity,
            taxIdentificationDocument: taxIdentificationDocumentSanity,
            annualRevenue: parseInt(annualRevenue.replace(/[^\d]/g, ""), 10) || 0,
            collaboratorsCount: data.collaboratorsCount ? parseInt(String(data.collaboratorsCount), 10) : 0,
            userCountry: data.userCountry,
            userDepartment: data.userDepartment,
            userCity: data.userCity,
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

  // Función auxiliar para subir archivos PDF a Sanity
  const uploadFileToSanity = async (file: File) => {
    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      const fileType = 'pdf';
      const fileName = file.name || `document-${Date.now()}.pdf`;

      const response = await fetch("/api/upload-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: base64,
          fileType,
          fileName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || "Error al subir el archivo");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error al subir archivo:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir archivo";
      throw new Error(errorMessage);
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

  const handleChamberOfCommerceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setValidationErrors((prev) => ({
          ...prev,
          chamberOfCommerce: "Solo se aceptan archivos PDF",
        }));
        return;
      }
      setChamberOfCommerce(file);
      setValidationErrors((prev) => {
        const rest = { ...prev };
        delete rest.chamberOfCommerce;
        return rest;
      });
    }
  };

  const handleTaxIdentificationDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setValidationErrors((prev) => ({
          ...prev,
          taxIdentificationDocument: "Solo se aceptan archivos PDF",
        }));
        return;
      }
      setTaxIdentificationDocument(file);
      setValidationErrors((prev) => {
        const rest = { ...prev };
        delete rest.taxIdentificationDocument;
        return rest;
      });
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

  const validateCompanyDocument = async (
    docType: string,
    docNumber: string
  ) => {
    if (!docType || !docNumber) return false;

    setIsCheckingCompanyDocument(true);
    setCompanyDocumentError(null);

    try {
      const response = await fetch("/api/check-company-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typeDocumentCompany: docType,
          numDocumentCompany: docNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCompanyDocumentError(
          data.message || "Error al verificar el documento de la empresa"
        );
        return false;
      }

      if (data.exists) {
        setCompanyDocumentError(
          "Ya existe una empresa registrada con este documento"
        );
        return false;
      }

      return true;
    } catch (error: unknown) {
      setCompanyDocumentError(
        error instanceof Error
          ? error.message
          : "Error al verificar el documento de la empresa"
      );
      return false;
    } finally {
      setIsCheckingCompanyDocument(false);
    }
  };

  // Formatear a moneda COP
  function formatCOP(value: string): string {
    if (!value) return "";
    // Eliminar todo lo que no sea número
    const numeric = value.replace(/[^\d]/g, "");
    if (!numeric) return "";
    return parseInt(numeric, 10).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  }

  // Manejar el cambio en el input de ingresos anuales
  function handleAnnualRevenueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setAnnualRevenue(raw);
  }

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
          <Image
            className="w-full max-w-max mx-auto"
            src={LogoColor}
            alt="Logo"
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
                            <Image
                              src={logoPreview}
                              alt="Vista previa del logo"
                              width={100}
                              height={100}
                              className="w-full h-full object-cover rounded-full"
                              unoptimized
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
                      <div className="w-full px-2 space-y-1">
                        <Label htmlFor="description">
                          Descripción de la empresa
                        </Label>
                        <Textarea
                          {...register("description")}
                          id="description"
                          placeholder="Descripción general de la empresa, sus servicios, productos y valores."
                          rows={4}
                          color="blue"
                        />
                      </div>
                      <div className="w-full md:w-1/2 px-2 space-y-1">
                        <Label htmlFor="typeDocumentCompany">
                          Documento <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-1">
                          <Select
                            {...register("typeDocumentCompany", {
                              required: "El tipo de documento es obligatorio",
                              onChange: async (e) => {
                                const value = e.target.value;
                                const error = validateField(
                                  "typeDocumentCompany",
                                  value
                                );
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    typeDocumentCompany: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.typeDocumentCompany;
                                    return newErrors;
                                  });
                                }

                                // Validar documento de empresa si ambos campos están completos
                                if (
                                  value &&
                                  watch("numDocumentCompany") &&
                                  watch("numDocumentCompany").length >= 8
                                ) {
                                  await validateCompanyDocument(
                                    value,
                                    watch("numDocumentCompany")
                                  );
                                } else {
                                  setCompanyDocumentError(null);
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
                              onChange: async (e) => {
                                const value = e.target.value;
                                const error = validateField(
                                  "numDocumentCompany",
                                  value
                                );
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    numDocumentCompany: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.numDocumentCompany;
                                    return newErrors;
                                  });
                                }

                                // Validar documento de empresa si ambos campos están completos
                                if (
                                  watch("typeDocumentCompany") &&
                                  value &&
                                  value.length >= 8
                                ) {
                                  await validateCompanyDocument(
                                    watch("typeDocumentCompany"),
                                    value
                                  );
                                } else {
                                  setCompanyDocumentError(null);
                                }
                              },
                            })}
                            className="w-auto flex-grow"
                            color={
                              validationErrors.numDocumentCompany ||
                              companyDocumentError
                                ? "failure"
                                : "blue"
                            }
                            id="numDocumentCompany"
                            placeholder="Número de documento"
                            type="number"
                          />
                        </div>
                        {(validationErrors.numDocumentCompany ||
                          companyDocumentError) && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.numDocumentCompany ||
                              companyDocumentError}
                          </p>
                        )}
                        {isCheckingCompanyDocument && (
                          <p className="text-blue-500 text-sm mt-1">
                            Verificando documento de empresa...
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
                        <Label htmlFor="countries">
                          Países donde opera la empresa <span className="text-red-500">*</span>
                        </Label>
                        {isClient ? (
                          <ReactSelect
                            id="countries"
                            instanceId="countries-select"
                            isMulti
                            options={LATAM_OPTIONS}
                            value={Array.isArray(countries) ? LATAM_OPTIONS.filter((o) => countries.includes(o.value)) : []}
                            onChange={(selected) => {
                              const values = Array.isArray(selected) ? selected.map((s) => s.value) : [];
                              setValue("countries", values);
                              if (!values.includes("CO") && !values.includes("MX")) {
                                setValue("addressCountry", "");
                                setValue("department", "");
                                setValue("city", "");
                              } else if (addressCountry && !values.includes(addressCountry)) {
                                setValue("addressCountry", values.includes("CO") ? "CO" : "MX");
                                setValue("department", "");
                                setValue("city", "");
                              }
                              const error = validateField("countries", values);
                              setValidationErrors((prev) => {
                                if (error) return { ...prev, countries: error };
                                const { countries: _, ...rest } = prev;
                                return rest;
                              });
                            }}
                            placeholder="Selecciona uno o más países"
                            noOptionsMessage={() => "No hay opciones"}
                            className="text-sm"
                          />
                        ) : (
                          <div className="h-10 border border-gray-300 rounded bg-gray-100" />
                        )}
                        {validationErrors.countries && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.countries}</p>
                        )}
                      </div>
                      {Array.isArray(countries) && (countries.includes("CO") || countries.includes("MX")) && (
                        <>
                          <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                            <Label htmlFor="addressCountry">
                              País de la sede principal <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              {...register("addressCountry", {
                                onChange: (e) => {
                                  const val = e.target.value;
                                  setValue("addressCountry", val);
                                  setValue("department", "");
                                  setValue("city", "");
                                  const error = validateField("addressCountry", val);
                                  setValidationErrors((prev) => {
                                    if (error) return { ...prev, addressCountry: error };
                                    const { addressCountry: _, ...rest } = prev;
                                    return rest;
                                  });
                                },
                              })}
                              id="addressCountry"
                              className="w-full"
                              value={addressCountry || ""}
                            >
                              <option value="">Selecciona el país de la sede</option>
                              {countries.includes("CO") && <option value="CO">Colombia</option>}
                              {countries.includes("MX") && <option value="MX">México</option>}
                            </Select>
                            {validationErrors.addressCountry && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors.addressCountry}</p>
                            )}
                          </div>
                          <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                            <Label htmlFor="department">
                              {addressCountry === "MX" ? "Estado" : "Departamento"} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              {...register("department", {
                                onChange: (e) => {
                                  setValue("department", e.target.value);
                                  setValue("city", "");
                                  const error = validateField("department", e.target.value);
                                  setValidationErrors((prev) => {
                                    if (error) return { ...prev, department: error };
                                    const { department: _, ...rest } = prev;
                                    return rest;
                                  });
                                },
                              })}
                              id="department"
                              className="w-full"
                              value={department || ""}
                              disabled={!addressCountry}
                            >
                              <option value="">Selecciona</option>
                              {(addressCountry === "MX" ? mexEstadosOptions : departamentosOptions).map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </Select>
                            {validationErrors.department && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>
                            )}
                          </div>
                          <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                            <Label htmlFor="city">
                              {addressCountry === "MX" ? "Municipio" : "Ciudad"} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              {...register("city", {
                                onChange: (e) => {
                                  setValue("city", e.target.value);
                                  const error = validateField("city", e.target.value);
                                  setValidationErrors((prev) => {
                                    if (error) return { ...prev, city: error };
                                    const { city: _, ...rest } = prev;
                                    return rest;
                                  });
                                },
                              })}
                              id="city"
                              className="w-full"
                              value={city || ""}
                              disabled={!department}
                            >
                              <option value="">Selecciona</option>
                              {companyCityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </Select>
                            {validationErrors.city && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                            )}
                          </div>
                        </>
                      )}

                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1 md:mt-6">
                        <Label htmlFor="annualRevenue">
                          Ingresos anuales (en millones de pesos COP){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <input
                          type="text"
                          inputMode="numeric"
                          id="annualRevenue"
                          name="annualRevenue"
                          className="w-full border rounded px-3 py-2"
                          placeholder="Ej: $1.200.000"
                          value={formatCOP(annualRevenue)}
                          onChange={handleAnnualRevenueChange}
                          min={0}
                          required
                        />
                        {sector && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sector detectado: <b>{sector}</b>
                          </p>
                        )}
                      </div>

                      <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1 md:mt-6">
                        <Label htmlFor="collaboratorsCount">
                          Cantidad de colaboradores
                        </Label>
                        <input
                          type="number"
                          inputMode="numeric"
                          id="collaboratorsCount"
                          className="w-full border rounded px-3 py-2"
                          placeholder="Ej: 10"
                          min={0}
                          {...register("collaboratorsCount", { valueAsNumber: true })}
                        />
                      </div>

                      {companySize !== "grande" && (
                        <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                          <Label htmlFor="peopleGroup">
                            ¿El 50% de los accionistas de la empresa pertenece a
                            algún grupo poblacional?{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          {isClient ? (
                            <ReactSelect
                              isMulti
                              options={PEOPLE_GROUP_OPTIONS}
                              value={Array.isArray(peopleGroup)
                                ? PEOPLE_GROUP_OPTIONS.filter((option) =>
                                    peopleGroup.includes(option.value)
                                  )
                                : peopleGroup
                                ? PEOPLE_GROUP_OPTIONS.filter(
                                    (option) => option.value === peopleGroup
                                  )
                                : []}
                              onChange={(selected) => {
                                let values = Array.isArray(selected)
                                  ? (selected as Array<{ value: string; label: string }>).map((s) => s.value)
                                  : [];
                                
                                // Si se selecciona "ninguno", solo mantener "ninguno"
                                if (values.includes("ninguno")) {
                                  values = ["ninguno"];
                                } else {
                                  // Si se selecciona cualquier otra opción, eliminar "ninguno" si está presente
                                  values = values.filter(v => v !== "ninguno");
                                }
                                
                                setValue("peopleGroup", values);
                                const error = validateField("peopleGroup", values);
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    peopleGroup: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const { ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }}
                              placeholder="Selecciona una o más opciones"
                              noOptionsMessage={() => "No hay opciones"}
                              instanceId="peopleGroup-select"
                            />
                          ) : (
                            <div className="w-full h-10 border border-gray-300 rounded bg-gray-100"></div>
                          )}
                          {validationErrors.peopleGroup && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.peopleGroup}
                            </p>
                          )}
                        </div>
                      )}

                      {companySize !== "grande" && (Array.isArray(peopleGroup) ? peopleGroup.includes("otro") : peopleGroup === "otro") && (
                        <div className="w-full md:w-1/2 lg:w-1/2 px-2 space-y-1">
                          <Label htmlFor="otherPeopleGroup">
                            Especificar otro grupo poblacional{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <TextInput
                            {...register("otherPeopleGroup", {
                              required: "Debe especificar el grupo poblacional",
                              onChange: (e) => {
                                const error = validateField(
                                  "otherPeopleGroup",
                                  e.target.value
                                );
                                if (error) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    otherPeopleGroup: error,
                                  }));
                                } else {
                                  setValidationErrors((prev) => {
                                    const { ...rest } = prev;
                                    return rest;
                                  });
                                }
                              },
                            })}
                            id="otherPeopleGroup"
                            className="w-full"
                            color={
                              validationErrors.otherPeopleGroup
                                ? "failure"
                                : "blue"
                            }
                            placeholder="Especificar grupo poblacional"
                          />
                          {validationErrors.otherPeopleGroup && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.otherPeopleGroup}
                            </p>
                          )}
                        </div>
                      )}

                                             <div className="w-full px-2 space-y-1 md:mt-6">
                         <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             id="friendlyBizz"
                             {...register("friendlyBizz")}
                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                           />
                           <Label
                             htmlFor="friendlyBizz"
                             className="text-sm font-medium"
                           >
                             ¿La empresa está certificada con el sello Friendly
                             Bizz?
                           </Label>
                         </div>
                         <p className="text-xs text-gray-500 mt-1">
                           Marca esta opción si tu empresa cuenta con la
                           certificación Friendly Bizz
                         </p>
                       </div>

                       <div className="w-full px-2 space-y-1 md:mt-6">
                         <Label htmlFor="inclusionDEI">
                           ¿La empresa está comprometida con la equidad e inclusión DEI? <span className="text-red-500">*</span>
                         </Label>
                         <Select
                           {...register("inclusionDEI", {
                             required: "Este campo es obligatorio",
                           })}
                           id="inclusionDEI"
                           color="blue"
                           theme={{
                             field: {
                               select: {
                                 base: "border-slate-200 focus:border-blue-600 w-full",
                               },
                             },
                           }}
                         >
                           <option value="">Seleccionar opción</option>
                           <option value="yes">Sí</option>
                           <option value="no">No</option>
                         </Select>
                         {validationErrors.inclusionDEI && (
                           <p className="text-red-500 text-sm mt-1">
                             {validationErrors.inclusionDEI}
                           </p>
                         )}
                       </div>

                       <div className="w-full md:w-1/2 px-2 space-y-1 md:mt-6">
                         <Label htmlFor="chamberOfCommerce">
                           Cámara de comercio (PDF)
                         </Label>
                         <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                           <Button
                             onClick={() => chamberOfCommerceInputRef.current?.click()}
                             className="font-bold"
                             color="light"
                             type="button"
                           >
                             {chamberOfCommerce ? "Cambiar archivo" : "Subir PDF"}
                           </Button>
                           {chamberOfCommerce && (
                             <span className="text-sm text-gray-600">
                               {chamberOfCommerce.name}
                             </span>
                           )}
                         </div>
                         <input
                           accept=".pdf"
                           ref={chamberOfCommerceInputRef}
                           className="hidden"
                           type="file"
                           name="chamberOfCommerce"
                           id="chamberOfCommerce"
                           onChange={handleChamberOfCommerceChange}
                         />
                         {validationErrors.chamberOfCommerce && (
                           <p className="text-red-500 text-sm mt-1">
                             {validationErrors.chamberOfCommerce}
                           </p>
                         )}
                         <p className="text-xs text-gray-500 mt-1">
                           Formato: PDF (máximo 10MB)
                         </p>
                       </div>

                       <div className="w-full md:w-1/2 px-2 space-y-1 md:mt-6">
                         <Label htmlFor="taxIdentificationDocument">
                           Documento Identificación Tributaria (PDF)
                         </Label>
                         <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                           <Button
                             onClick={() => taxIdentificationDocumentInputRef.current?.click()}
                             className="font-bold"
                             color="light"
                             type="button"
                           >
                             {taxIdentificationDocument ? "Cambiar archivo" : "Subir PDF"}
                           </Button>
                           {taxIdentificationDocument && (
                             <span className="text-sm text-gray-600">
                               {taxIdentificationDocument.name}
                             </span>
                           )}
                         </div>
                         <input
                           accept=".pdf"
                           ref={taxIdentificationDocumentInputRef}
                           className="hidden"
                           type="file"
                           name="taxIdentificationDocument"
                           id="taxIdentificationDocument"
                           onChange={handleTaxIdentificationDocumentChange}
                         />
                         {validationErrors.taxIdentificationDocument && (
                           <p className="text-red-500 text-sm mt-1">
                             {validationErrors.taxIdentificationDocument}
                           </p>
                         )}
                         <p className="text-xs text-gray-500 mt-1">
                           Formato: PDF (máximo 10MB)
                         </p>
                       </div>

                       <div className="w-full px-2 space-y-4 text-center py-5 gap-2 bg-blue-100 rounded-lg md:mt-6">
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
                      <Image
                        src={photoPreview}
                        alt="Foto de perfil"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
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
                  <Label htmlFor="userCountry">
                    País <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    {...register("userCountry", {
                      onChange: (e) => {
                        const val = e.target.value;
                        setValue("userCountry", val);
                        if (val !== "CO" && val !== "MX") {
                          setValue("userDepartment", "");
                          setValue("userCity", "");
                        }
                        const error = validateField("userCountry", val);
                        setValidationErrors((prev) => {
                          if (error) return { ...prev, userCountry: error };
                          const { userCountry: _, ...rest } = prev;
                          return rest;
                        });
                      },
                    })}
                    id="userCountry"
                    className="w-full"
                    value={userCountry || ""}
                  >
                    <option value="">Selecciona tu país</option>
                    {LATAM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                  {validationErrors.userCountry && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.userCountry}</p>
                  )}
                </div>
                {(userCountry === "CO" || userCountry === "MX") && (
                  <>
                    <div className="w-full md:w-1/2 px-2 space-y-1">
                      <Label htmlFor="userDepartment">
                        {userCountry === "MX" ? "Estado" : "Departamento"} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        {...register("userDepartment", {
                          onChange: (e) => {
                            setValue("userDepartment", e.target.value);
                            setValue("userCity", "");
                            const error = validateField("userDepartment", e.target.value);
                            setValidationErrors((prev) => {
                              if (error) return { ...prev, userDepartment: error };
                              const { userDepartment: _, ...rest } = prev;
                              return rest;
                            });
                          },
                        })}
                        id="userDepartment"
                        className="w-full"
                        value={userDepartment || ""}
                      >
                        <option value="">Selecciona</option>
                        {(userCountry === "MX" ? mexEstadosOptions : departamentosOptions).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                      {validationErrors.userDepartment && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.userDepartment}</p>
                      )}
                    </div>
                    <div className="w-full md:w-1/2 px-2 space-y-1">
                      <Label htmlFor="userCity">
                        {userCountry === "MX" ? "Municipio" : "Ciudad"} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        {...register("userCity", {
                          onChange: (e) => {
                            setValue("userCity", e.target.value);
                            const error = validateField("userCity", e.target.value);
                            setValidationErrors((prev) => {
                              if (error) return { ...prev, userCity: error };
                              const { userCity: _, ...rest } = prev;
                              return rest;
                            });
                          },
                        })}
                        id="userCity"
                        className="w-full"
                        value={userCity || ""}
                        disabled={!userDepartment}
                      >
                        <option value="">Selecciona</option>
                        {userCityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                      {validationErrors.userCity && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.userCity}</p>
                      )}
                    </div>
                  </>
                )}

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
                            "La contraseña debe contener al menos una mayúscula, una minúscula, un número, un carácter especial permitido (.,-_@#!?\"{}|<>) y no incluir caracteres inválidos",
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
                        className={`text-sm inline-block ${password && SPECIAL_CHAR_REGEX.test(password) ? "text-blue-600" : "text-slate-500"}`}
                      />{" "}
                      1 carácter especial como .,_#@?*
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
                          if (typeof value === "string" && value !== password) {
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
              {/* Consentimientos */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="dataTreatmentConsent"
                    {...register("dataTreatmentConsent", { required: true })}
                    className="mt-1 mr-2"
                  />
                  <div>
                    <Label
                      htmlFor="dataTreatmentConsent"
                      className="font-medium"
                    >
                      Aceptación de{" "}
                      <a
                        href="https://camaradeladiversidad.com/home/politica-de-privacidad/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        tratamiento de datos personales
                      </a>{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-600">
                      Debes aceptar el tratamiento de tus datos personales para
                      registrarte.
                    </p>
                    {validationErrors.dataTreatmentConsent && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.dataTreatmentConsent}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="infoVisibilityConsent"
                    {...register("infoVisibilityConsent")}
                    className="mt-1 mr-2"
                    defaultChecked={true}
                  />
                  <div>
                    <Label
                      htmlFor="infoVisibilityConsent"
                      className="font-medium"
                    >
                      Autorización de visibilidad de información (Opcional)
                    </Label>
                    <p className="text-xs text-gray-600">
                      Autorizo que mi información sea visible en la plataforma
                      para otros usuarios y empresas.
                    </p>
                    {validationErrors.infoVisibilityConsent && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.infoVisibilityConsent}
                      </p>
                    )}
                  </div>
                </div>
                {/* Campo de perfil público - solo visible y habilitado para empresas grandes */}
                {companySize === "grande" && (
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="publicProfile"
                      {...register("publicProfile")}
                      className="mt-1 mr-2"
                      defaultChecked={false}
                    />
                    <div>
                      <Label
                        htmlFor="publicProfile"
                        className="font-medium"
                      >
                        Perfil público
                      </Label>
                      <p className="text-xs text-gray-600">
                        Activa esta opción para que tu perfil sea visible públicamente en la plataforma.
                      </p>
                    </div>
                  </div>
                )}
                {/* Mensaje informativo para empresas no grandes */}
                {companySize && companySize !== "grande" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Tu perfil será público automáticamente ya que tu empresa no es de tamaño grande.
                    </p>
                  </div>
                )}
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
                  disabled={
                    !activeNextButton || isLoading || !dataTreatmentConsent
                  }
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
