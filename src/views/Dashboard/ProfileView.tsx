"use client";

import { HiCheckCircle, HiExclamationCircle, HiUser } from "react-icons/hi";
import {
  Label,
  TextInput,
  Textarea,
  Button,
  Select,
  Spinner,
  Modal,
} from "flowbite-react";
import { Tabs } from "flowbite-react";
import InternationalPhoneInput from "@/components/InternationalPhoneInput ";
import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { updateEmail, sendEmailVerification, getAuth } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { UserProfile, SanityImage, CompanyData } from "@/types";
import { getCIIUOptions, getSectorFromCIIU } from "@/utils/ciiuOptions";
import ReactSelect from "react-select";

const COUNTRIES_OPTIONS = [
  { title: 'Argentina', value: 'AR' },
  { title: 'Bolivia', value: 'BO' },
  { title: 'Brasil', value: 'BR' },
  { title: 'Chile', value: 'CL' },
  { title: 'Colombia', value: 'CO' },
  { title: 'Costa Rica', value: 'CR' },
  { title: 'Cuba', value: 'CU' },
  { title: 'República Dominicana', value: 'DO' },
  { title: 'Ecuador', value: 'EC' },
  { title: 'El Salvador', value: 'SV' },
  { title: 'Guatemala', value: 'GT' },
  { title: 'Haití', value: 'HT' },
  { title: 'Honduras', value: 'HN' },
  { title: 'México', value: 'MX' },
  { title: 'Nicaragua', value: 'NI' },
  { title: 'Panamá', value: 'PA' },
  { title: 'Paraguay', value: 'PY' },
  { title: 'Perú', value: 'PE' },
  { title: 'Puerto Rico', value: 'PR' },
  { title: 'Uruguay', value: 'UY' },
  { title: 'Venezuela', value: 'VE' },
];

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

interface ProfileViewProps {
  initialProfile?: UserProfile | null;
  error?: string;
}

// Función para formatear a moneda COP
function formatCOP(value: string): string {
  if (!value) return "";
  const numeric = value.replace(/[^\d]/g, "");
  if (!numeric) return "";
  return parseInt(numeric, 10).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function ProfileView({
  initialProfile,
  error: initialError,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user } = useAuth();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [chamberOfCommerceFile, setChamberOfCommerceFile] = useState<File | null>(null);
  const [taxIdentificationDocumentFile, setTaxIdentificationDocumentFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const chamberOfCommerceInputRef = useRef<HTMLInputElement>(null);
  const taxIdentificationDocumentInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Estados para CIIU
  const [ciiuOptions] = useState(() => getCIIUOptions());
  
  // Estados para annualRevenue y sector
  const [annualRevenueDisplay, setAnnualRevenueDisplay] = useState<string>("");
  const [sector, setSector] = useState<string>("");

  useEffect(() => {
    if (initialProfile) {
      // Si tenemos datos iniciales, combinar los datos del usuario y la empresa
      const combinedProfile = {
        ...initialProfile,
        // Si existe company, usar sus valores, si no, usar valores vacíos
        nameCompany: initialProfile.company?.nameCompany || "",
        businessName: initialProfile.company?.businessName || "",
        description: initialProfile.company?.description || "",
        typeDocumentCompany: initialProfile.company?.typeDocumentCompany || "",
        numDocumentCompany: initialProfile.company?.numDocumentCompany || "",
        ciiu: initialProfile.company?.ciiu || "",
        webSite: initialProfile.company?.webSite || "",
        addressCompany: initialProfile.company?.addressCompany || "",
        department: initialProfile.company?.department || "",
        city: initialProfile.company?.city || "",
        country: initialProfile.company?.country || "",
        companySize: initialProfile.company?.companySize || "",
        peopleGroup: Array.isArray(initialProfile.company?.peopleGroup)
          ? [...initialProfile.company.peopleGroup] // Crear una nueva referencia del array
          : initialProfile.company?.peopleGroup
          ? [initialProfile.company.peopleGroup]
          : [],
        otherPeopleGroup: initialProfile.company?.otherPeopleGroup || "",
        friendlyBizz: initialProfile.company?.friendlyBizz || false,
        inclusionDEI: initialProfile.company?.inclusionDEI ? "yes" : "no",
        membership: initialProfile.company?.membership || false,
        annualRevenue: initialProfile.company?.annualRevenue ?? 0,
        logo: initialProfile.company?.logo,
        facebook: initialProfile.company?.facebook || "",
        instagram: initialProfile.company?.instagram || "",
        tiktok: initialProfile.company?.tiktok || "",
        pinterest: initialProfile.company?.pinterest || "",
        linkedin: initialProfile.company?.linkedin || "",
        xtwitter: initialProfile.company?.xtwitter || "",
        chamberOfCommerce: initialProfile.company?.chamberOfCommerce,
        taxIdentificationDocument: initialProfile.company?.taxIdentificationDocument,
        chamberOfCommerceValidated: initialProfile.company?.chamberOfCommerceValidated || 'pendiente',
        taxIdentificationDocumentValidated: initialProfile.company?.taxIdentificationDocumentValidated || 'pendiente',
        chamberOfCommerceComments: initialProfile.company?.chamberOfCommerceComments || '',
        taxIdentificationDocumentComments: initialProfile.company?.taxIdentificationDocumentComments || '',
        publicProfile: initialProfile.publicProfile !== undefined ? initialProfile.publicProfile : (initialProfile.company?.companySize !== "grande" ? true : false),
      };
      const typedCombinedProfile: UserProfile = {
        ...combinedProfile,
        logo: combinedProfile.logo as SanityImage | undefined,
      };
      setProfile(typedCombinedProfile);
      setOriginalProfile(typedCombinedProfile);
      
      // Inicializar annualRevenueDisplay y sector
      if (typedCombinedProfile.annualRevenue !== undefined && typedCombinedProfile.annualRevenue !== null) {
        setAnnualRevenueDisplay(typedCombinedProfile.annualRevenue.toString());
      }
      if (typedCombinedProfile.ciiu) {
        const sectorResult = getSectorFromCIIU(typedCombinedProfile.ciiu);
        setSector(sectorResult || "");
      }
    }
  }, [initialProfile]);

  // Refrescar el perfil periódicamente para obtener actualizaciones de validación
  useEffect(() => {
    if (!user?.uid) return;

    const refreshProfile = async () => {
      try {
        const response = await fetch(`/api/profile/get?userId=${user.uid}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const updatedUser = result.data.user;
            const updatedCompany = result.data.company;
            
            const {
              company: _company,
              ...userFields
            } = updatedUser;
            
            const combinedProfile = {
              ...userFields,
              nameCompany: updatedCompany?.nameCompany || "",
              businessName: updatedCompany?.businessName || "",
              description: updatedCompany?.description || "",
              typeDocumentCompany: updatedCompany?.typeDocumentCompany || "",
              numDocumentCompany: updatedCompany?.numDocumentCompany || "",
              ciiu: updatedCompany?.ciiu || "",
              webSite: updatedCompany?.webSite || "",
              addressCompany: updatedCompany?.addressCompany || "",
              department: updatedCompany?.department || "",
              city: updatedCompany?.city || "",
              country: updatedCompany?.country || "",
              companySize: updatedCompany?.companySize || "",
              peopleGroup: Array.isArray(updatedCompany?.peopleGroup)
                ? [...updatedCompany.peopleGroup] // Crear una nueva referencia del array
                : updatedCompany?.peopleGroup
                ? [updatedCompany.peopleGroup]
                : [],
              otherPeopleGroup: updatedCompany?.otherPeopleGroup || "",
              friendlyBizz: updatedCompany?.friendlyBizz || false,
              inclusionDEI: updatedCompany?.inclusionDEI ? "yes" : "no",
              membership: updatedCompany?.membership || false,
              annualRevenue: updatedCompany?.annualRevenue ?? 0,
              logo: updatedCompany?.logo,
              facebook: updatedCompany?.facebook || "",
              instagram: updatedCompany?.instagram || "",
              tiktok: updatedCompany?.tiktok || "",
              pinterest: updatedCompany?.pinterest || "",
              linkedin: updatedCompany?.linkedin || "",
              xtwitter: updatedCompany?.xtwitter || "",
              chamberOfCommerce: updatedCompany?.chamberOfCommerce,
              taxIdentificationDocument: updatedCompany?.taxIdentificationDocument,
              chamberOfCommerceValidated: updatedCompany?.chamberOfCommerceValidated || 'pendiente',
              taxIdentificationDocumentValidated: updatedCompany?.taxIdentificationDocumentValidated || 'pendiente',
              chamberOfCommerceComments: updatedCompany?.chamberOfCommerceComments || '',
              taxIdentificationDocumentComments: updatedCompany?.taxIdentificationDocumentComments || '',
            };
            const typedCombinedProfile: UserProfile = {
              ...combinedProfile,
              logo: combinedProfile.logo as SanityImage | undefined,
            };
            
            // Actualizar el perfil con los datos más recientes
            setProfile((prevProfile) => {
              if (!prevProfile) return typedCombinedProfile;
              
              // Solo actualizar si hay cambios en los campos de validación o comentarios
              const hasValidationChanges = 
                prevProfile.chamberOfCommerceValidated !== typedCombinedProfile.chamberOfCommerceValidated ||
                prevProfile.taxIdentificationDocumentValidated !== typedCombinedProfile.taxIdentificationDocumentValidated ||
                prevProfile.chamberOfCommerceComments !== typedCombinedProfile.chamberOfCommerceComments ||
                prevProfile.taxIdentificationDocumentComments !== typedCombinedProfile.taxIdentificationDocumentComments;
              
              if (hasValidationChanges) {
                console.log("Actualizando estados de validación:", {
                  chamberOfCommerceValidated: typedCombinedProfile.chamberOfCommerceValidated,
                  taxIdentificationDocumentValidated: typedCombinedProfile.taxIdentificationDocumentValidated,
                });
                // Combinar el perfil anterior con los nuevos campos de validación
                return {
                  ...prevProfile,
                  chamberOfCommerceValidated: typedCombinedProfile.chamberOfCommerceValidated,
                  taxIdentificationDocumentValidated: typedCombinedProfile.taxIdentificationDocumentValidated,
                  chamberOfCommerceComments: typedCombinedProfile.chamberOfCommerceComments,
                  taxIdentificationDocumentComments: typedCombinedProfile.taxIdentificationDocumentComments,
                  chamberOfCommerce: typedCombinedProfile.chamberOfCommerce,
                  taxIdentificationDocument: typedCombinedProfile.taxIdentificationDocument,
                };
              }
              return prevProfile;
            });
          }
        }
      } catch (error) {
        console.error("Error al refrescar el perfil:", error);
      }
    };

    // Refrescar inmediatamente y luego cada 30 segundos
    refreshProfile();
    const interval = setInterval(refreshProfile, 30000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Establecer publicProfile según companySize
  useEffect(() => {
    if (profile?.companySize && profile.companySize !== "grande") {
      // Si no es grande, el perfil debe ser público obligatoriamente
      if (profile.publicProfile !== true) {
        setProfile((prev) => prev ? { ...prev, publicProfile: true } : prev);
      }
    }
  }, [profile?.companySize, profile?.publicProfile]);

  // Actualizar sector cuando cambie el CIIU
  useEffect(() => {
    if (profile?.ciiu) {
      const sectorResult = getSectorFromCIIU(profile.ciiu);
      setSector(sectorResult || "");
    } else {
      setSector("");
    }
  }, [profile?.ciiu]);

  // Calcular companySize automáticamente
  useEffect(() => {
    if (!sector || !annualRevenueDisplay || !profile) return;
    
    const revenueNum = parseInt(annualRevenueDisplay.replace(/[^\d]/g, ""), 10);
    let size: "micro" | "pequena" | "mediana" | "grande" | "indefinido" = "indefinido";
    
    if (sector === "COMERCIO") {
      if (revenueNum <= 1163000000) size = "micro";
      else if (revenueNum > 1163000000 && revenueNum <= 4074000000) size = "pequena";
      else if (revenueNum > 4074000000 && revenueNum <= 15563000000) size = "mediana";
      else if (revenueNum > 15563000000) size = "grande";
    } else if (sector === "MANUFACTURA") {
      if (revenueNum <= 652000000) size = "micro";
      else if (revenueNum > 652000000 && revenueNum <= 2601000000) size = "pequena";
      else if (revenueNum > 2601000000 && revenueNum <= 23563000000) size = "mediana";
      else if (revenueNum > 23563000000) size = "grande";
    } else if (sector === "SERVICIOS") {
      if (revenueNum <= 519000000) size = "micro";
      else if (revenueNum > 519000000 && revenueNum <= 1877000000) size = "pequena";
      else if (revenueNum > 1877000000 && revenueNum <= 7523000000) size = "mediana";
      else if (revenueNum > 7523000000) size = "grande";
    }
    
    // Solo actualizar si el tamaño o revenue han cambiado
    if (profile.companySize !== size || profile.annualRevenue !== revenueNum) {
      setProfile({ ...profile, companySize: size, annualRevenue: revenueNum });
    }
  }, [sector, annualRevenueDisplay]); // Remover profile de las dependencias

  const handleChange = (field: keyof UserProfile, value: string | string[] | boolean) => {
    if (profile) {
      // Si cambia el departamento, limpiar la ciudad
      // Si cambia el grupo poblacional y no incluye "otro", limpiar otherPeopleGroup
      if (field === 'peopleGroup') {
        // Solo procesar si el valor es string o string[]
        if (typeof value !== 'boolean') {
          const hasOtro = Array.isArray(value) 
            ? value.includes('otro')
            : value === 'otro';
          if (!hasOtro) {
            setProfile({ ...profile, [field]: value, otherPeopleGroup: '' });
          } else {
            setProfile({ ...profile, [field]: value });
          }
        }
      } else if (field === 'publicProfile') {
        // Manejar el campo boolean específicamente
        setProfile({ ...profile, [field]: value as boolean });
      } else {
        // Para otros campos string
        if (typeof value !== 'boolean' && !Array.isArray(value)) {
          setProfile({ ...profile, [field]: value });
        }
      }
    }
  };

  // Función para manejar el cambio de ingresos anuales
  const handleAnnualRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setAnnualRevenueDisplay(raw);
  };

  // Función para detectar si hay cambios en el perfil
  const hasChanges = useMemo(() => {
    if (!profile || !originalProfile) return false;

    const fieldsToCompare: (keyof UserProfile)[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "pronoun",
      "position",
      "typeDocument",
      "numDocument",
      "publicProfile",
      "nameCompany",
      "businessName",
      "description",
      "typeDocumentCompany",
      "numDocumentCompany",
      "ciiu",
      "webSite",
      "addressCompany",
      "department",
      "city",
      "country",
      "companySize",
      "peopleGroup",
      "otherPeopleGroup",
      "friendlyBizz",
      "inclusionDEI",
      "membership",
      "annualRevenue",
      "photo",
      "logo",
    ];

    // Si hay una nueva foto, logo o archivos PDF seleccionados, hay cambios
    if (photoFile || logoFile || chamberOfCommerceFile || taxIdentificationDocumentFile) return true;

    // Verificar si annualRevenueDisplay ha cambiado
    const originalAnnualRevenueDisplay = originalProfile.annualRevenue ? originalProfile.annualRevenue.toString() : "";
    if (annualRevenueDisplay !== originalAnnualRevenueDisplay) return true;

    return fieldsToCompare.some(
      (field) => profile[field] !== originalProfile[field]
    );
  }, [profile, originalProfile, photoFile, logoFile, annualRevenueDisplay, chamberOfCommerceFile, taxIdentificationDocumentFile]);

  // Al seleccionar nueva foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      if (profile) {
        setProfile({ ...profile, photo: "new" }); // Valor temporal para disparar el cambio
      }
    }
  };

  // Al seleccionar nuevo documento de Cámara de Comercio
  const handleChamberOfCommerceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Solo se aceptan archivos PDF");
        return;
      }
      setChamberOfCommerceFile(file);
      if (profile) {
        setProfile({ ...profile, chamberOfCommerce: "new" }); // Valor temporal para disparar el cambio
      }
    }
  };

  // Al seleccionar nuevo documento de identificación tributaria
  const handleTaxIdentificationDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Solo se aceptan archivos PDF");
        return;
      }
      setTaxIdentificationDocumentFile(file);
      if (profile) {
        setProfile({ ...profile, taxIdentificationDocument: "new" }); // Valor temporal para disparar el cambio
      }
    }
  };

  // Al seleccionar nuevo logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      if (profile) {
        setProfile({ ...profile, logo: "new" }); // Valor temporal para disparar el cambio
      }
    }
  };

  const handleSave = async () => {
    if (!hasChanges || !profile || !user) return;

    setIsSaving(true);
    try {
      // Verificar que el usuario esté autenticado
      if (!user.uid) {
        throw new Error("Usuario no autenticado");
      }

      // Si el email ha cambiado, actualizarlo en Firebase primero
      if (profile.email !== originalProfile?.email) {
        if (!user.emailVerified) {
          throw new Error(
            "Debes verificar tu correo actual antes de cambiarlo"
          );
        }

        if (!profile.email) {
          throw new Error("El correo electrónico es requerido");
        }

        await updateEmail(user, profile.email);
        await sendEmailVerification(user);
        toast.success(
          "Se ha enviado un correo de verificación a tu nueva dirección"
        );
      }

      // Subir foto si hay nueva
      let photoSanity = profile.photo;
      if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Error al subir la foto de perfil");
        const uploadData = await uploadRes.json();
        photoSanity = { _type: "image", asset: uploadData.asset };
      }
      // Subir logo si hay nuevo
      let logoSanity = profile.logo;
      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Error al subir el logo");
        const uploadData = await uploadRes.json();
        logoSanity = { _type: "image", asset: uploadData.asset };
      }
      // Subir Cámara de Comercio si hay nuevo
      let chamberOfCommerceSanity = profile.chamberOfCommerce;
      if (chamberOfCommerceFile) {
        const formData = new FormData();
        formData.append("file", chamberOfCommerceFile);
        const uploadRes = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ message: "Error desconocido" }));
          throw new Error(`Error al subir el documento de Cámara de Comercio: ${errorData.message || "Error desconocido"}`);
        }
        const uploadData = await uploadRes.json();
        chamberOfCommerceSanity = uploadData.asset;
        console.log("Cámara de Comercio subida exitosamente:", chamberOfCommerceSanity);
      }
      // Subir Documento de Identificación Tributaria si hay nuevo
      let taxIdentificationDocumentSanity = profile.taxIdentificationDocument;
      if (taxIdentificationDocumentFile) {
        const formData = new FormData();
        formData.append("file", taxIdentificationDocumentFile);
        const uploadRes = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ message: "Error desconocido" }));
          throw new Error(`Error al subir el documento de identificación tributaria: ${errorData.message || "Error desconocido"}`);
        }
        const uploadData = await uploadRes.json();
        taxIdentificationDocumentSanity = uploadData.asset;
        console.log("Documento de identificación tributaria subido exitosamente:", taxIdentificationDocumentSanity);
      }

      // Separar datos del usuario y la empresa
      // Si companySize no es "grande", publicProfile debe ser true obligatoriamente
      const publicProfileValue = profile.companySize !== "grande" 
        ? true 
        : (profile.publicProfile !== undefined ? profile.publicProfile : false);
      
      const userData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        pronoun: profile.pronoun,
        position: profile.position,
        typeDocument: profile.typeDocument,
        numDocument: profile.numDocument,
        photo: photoSanity,
        publicProfile: publicProfileValue,
      };

      // Asegurar que annualRevenue tenga el valor más reciente
      const currentAnnualRevenue = annualRevenueDisplay ? parseInt(annualRevenueDisplay.replace(/[^\d]/g, ""), 10) : (profile.annualRevenue || 0);
      

      
      const companyData: Omit<Partial<CompanyData>, 'logo' | 'chamberOfCommerce' | 'taxIdentificationDocument'> & {
        updatedAt: string;
        logo?: string | SanityImage;
        chamberOfCommerce?: string | SanityImage;
        taxIdentificationDocument?: string | SanityImage;
        chamberOfCommerceValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
        taxIdentificationDocumentValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
        chamberOfCommerceComments?: string;
        taxIdentificationDocumentComments?: string;
      } = {
        nameCompany: profile.nameCompany,
        businessName: profile.businessName,
        description: profile.description,
        typeDocumentCompany: profile.typeDocumentCompany,
        numDocumentCompany: profile.numDocumentCompany,
        ciiu: profile.ciiu,
        webSite: profile.webSite,
        addressCompany: profile.addressCompany,
        department: profile.department,
        city: profile.city,
        country: profile.country,
        companySize: profile.companySize,
        peopleGroup: profile.peopleGroup,
        otherPeopleGroup: profile.otherPeopleGroup,
        friendlyBizz: profile.friendlyBizz,
        inclusionDEI: profile.inclusionDEI === "yes" ? true : false,
        membership: profile.membership,
        annualRevenue: currentAnnualRevenue,
        facebook: profile.facebook,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        pinterest: profile.pinterest,
        linkedin: profile.linkedin,
        xtwitter: profile.xtwitter,
        logo: logoSanity,
        updatedAt: new Date().toISOString(),
      };

      // Solo incluir campos de documentos si hay cambios
      if (chamberOfCommerceSanity) {
        companyData.chamberOfCommerce = chamberOfCommerceSanity;
        // Si se subió un nuevo documento, establecer el estado en pendiente y limpiar comentarios
        if (chamberOfCommerceFile) {
          companyData.chamberOfCommerceValidated = 'pendiente';
          companyData.chamberOfCommerceComments = '';
        }
      }

      if (taxIdentificationDocumentSanity) {
        companyData.taxIdentificationDocument = taxIdentificationDocumentSanity;
        // Si se subió un nuevo documento, establecer el estado en pendiente y limpiar comentarios
        if (taxIdentificationDocumentFile) {
          companyData.taxIdentificationDocumentValidated = 'pendiente';
          companyData.taxIdentificationDocumentComments = '';
        }
      }

      // Llamar al endpoint de actualización
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          userData,
          companyData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el perfil");
      }

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado con los datos más recientes
        // Combinar los datos del usuario y la empresa de la misma manera que en la inicialización
        const updatedUser = result.data.user;
        const updatedCompany = result.data.company;
        
        // Extraer solo los campos del usuario, excluyendo el objeto company anidado
        const {
          company: _company,
          ...userFields
        } = updatedUser;
        
        const combinedProfile = {
          ...userFields,
          // Si existe company, usar sus valores, si no, usar valores vacíos
          nameCompany: updatedCompany?.nameCompany || "",
          businessName: updatedCompany?.businessName || "",
          description: updatedCompany?.description || "",
          typeDocumentCompany: updatedCompany?.typeDocumentCompany || "",
          numDocumentCompany: updatedCompany?.numDocumentCompany || "",
          ciiu: updatedCompany?.ciiu || "",
          webSite: updatedCompany?.webSite || "",
          addressCompany: updatedCompany?.addressCompany || "",
          department: updatedCompany?.department || "",
          city: updatedCompany?.city || "",
          country: updatedCompany?.country || "",
          companySize: updatedCompany?.companySize || "",
          peopleGroup: Array.isArray(updatedCompany?.peopleGroup)
            ? [...updatedCompany.peopleGroup] // Crear una nueva referencia del array
            : updatedCompany?.peopleGroup
            ? [updatedCompany.peopleGroup]
            : [],
          otherPeopleGroup: updatedCompany?.otherPeopleGroup || "",
          friendlyBizz: updatedCompany?.friendlyBizz || false,
          inclusionDEI: updatedCompany?.inclusionDEI ? "yes" : "no",
          membership: updatedCompany?.membership || false,
          annualRevenue: updatedCompany?.annualRevenue ?? 0,
          logo: updatedCompany?.logo,
          facebook: updatedCompany?.facebook || "",
          instagram: updatedCompany?.instagram || "",
          tiktok: updatedCompany?.tiktok || "",
          pinterest: updatedCompany?.pinterest || "",
          linkedin: updatedCompany?.linkedin || "",
          xtwitter: updatedCompany?.xtwitter || "",
          chamberOfCommerce: updatedCompany?.chamberOfCommerce,
          taxIdentificationDocument: updatedCompany?.taxIdentificationDocument,
          chamberOfCommerceValidated: updatedCompany?.chamberOfCommerceValidated || 'pendiente',
          taxIdentificationDocumentValidated: updatedCompany?.taxIdentificationDocumentValidated || 'pendiente',
          chamberOfCommerceComments: updatedCompany?.chamberOfCommerceComments || '',
          taxIdentificationDocumentComments: updatedCompany?.taxIdentificationDocumentComments || '',
        };
        const typedCombinedProfile: UserProfile = {
          ...combinedProfile,
          logo: combinedProfile.logo as SanityImage | undefined,
        };
        setProfile(typedCombinedProfile);
        setOriginalProfile(typedCombinedProfile);
        
        // Limpiar archivos temporales después de guardar
        setPhotoFile(null);
        setLogoFile(null);
        setChamberOfCommerceFile(null);
        setTaxIdentificationDocumentFile(null);
        setPhotoPreview(null);
        setLogoPreview(null);
        
        // Actualizar annualRevenueDisplay con el valor guardado
        if (typedCombinedProfile.annualRevenue !== undefined && typedCombinedProfile.annualRevenue !== null) {
          setAnnualRevenueDisplay(typedCombinedProfile.annualRevenue.toString());
        }
        
        // Actualizar sector si cambió el CIIU
        if (typedCombinedProfile.ciiu) {
          const sectorResult = getSectorFromCIIU(typedCombinedProfile.ciiu);
          setSector(sectorResult || "");
        }

        toast.success(
          profile.email !== originalProfile?.email
            ? "Perfil actualizado. Por favor, verifica tu nuevo correo electrónico"
            : "Perfil actualizado correctamente"
        );
      }
    } catch (error: unknown) {
      console.error("Error al actualizar el perfil:", error);

      if (error instanceof FirebaseError) {
        if (error.code === "auth/requires-recent-login") {
          toast.error(
            "Por seguridad, necesitas volver a iniciar sesión para cambiar tu correo"
          );
        } else if (error.code === "auth/email-already-in-use") {
          toast.error("Este correo electrónico ya está en uso");
        } else {
          toast.error(error.message || "Error al actualizar el perfil");
        }
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al actualizar el perfil";
        toast.error(errorMessage);
      }

      // Si hubo un error al actualizar el email, revertir los cambios en el estado
      if (profile.email !== originalProfile?.email) {
        setProfile((prev) =>
          prev ? { ...prev, email: originalProfile?.email || "" } : null
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setPhotoFile(null);
      setLogoFile(null);
      setPhotoPreview(null);
      setLogoPreview(null);
      toast.success("Cambios descartados");
    }
  };

  // Función auxiliar para obtener la URL de la imagen
  const getImageUrl = (image: SanityImage | undefined | null) => {
    if (!image || !image.asset) return null;
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp")}`;
  };

  const renderEmailField = () => {
    const isVerified = user?.emailVerified || false;

    const handleResendVerification = async () => {
      try {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await sendEmailVerification(firebaseUser);
          toast.success("Se ha enviado un nuevo correo de verificación");
        } else {
          toast.error("No se pudo enviar el correo de verificación");
        }
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          toast.error(
            "Error al enviar el correo de verificación: " +
              (error.message || "Error desconocido")
          );
        } else {
          toast.error("Error al enviar el correo de verificación");
          console.error("Error al enviar el correo de verificación:", error);
        }
      }
    };

    return (
      <div className="w-full md:w-1/2 px-2 space-y-1">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="space-y-1">
          <TextInput
            id="email"
            type="email"
            placeholder="email@miempresa.com"
            value={profile?.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={!isVerified}
            color={"blue"}
            theme={{
              field: {
                input: {
                  base: `border-slate-200 focus:border-blue-600 w-full ${!isVerified ? "bg-gray-50 text-gray-500" : ""}`,
                },
              },
            }}
          />
          {isVerified ? (
            <div className="flex items-center text-xs text-green-600">
              <HiCheckCircle className="w-3 h-3 mr-1" />
              <span>Correo electrónico verificado</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center text-xs text-red-600">
                <HiExclamationCircle className="w-3 h-3 mr-1" />
                <span>
                  Correo no verificado. Por favor, verifica tu correo
                  electrónico para poder modificarlo.
                </span>
              </div>
              <Button size="xs" color="blue" onClick={handleResendVerification}>
                Reenviar correo de verificación
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await handleSave();
  };

  const isUserOnly = profile?.role === "user";

  if (initialError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{initialError}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  const photoUrl = photoPreview || (profile.photo ? getImageUrl(profile.photo as unknown as SanityImage) : null);
  const logoUrl = logoPreview || (profile.logo ? getImageUrl(profile.logo as unknown as SanityImage) : null);

  // Modificar los botones de guardar en ambas pestañas
  const saveButton = (
    <>
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSaveClick}
          disabled={!hasChanges || isSaving}
          color={hasChanges ? "blue" : "gray"}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="mr-3" />
              <span>Guardando...</span>
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
        {hasChanges && (
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            type="button"
          >
            Descartar cambios
          </button>
        )}
      </div>

      <Modal
        show={showConfirmModal}
        size="md"
        onClose={() => setShowConfirmModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              ¿Estás seguro de que deseas guardar los cambios?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="blue" onClick={handleConfirmSave}>
                Sí, guardar cambios
              </Button>
              <Button color="gray" onClick={() => setShowConfirmModal(false)}>
                No, cancelar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="w-3/3 xl:w-3/4 px-3 sm:pl-10">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <div className="border-b border-gray-200 mt-5">
          <Tabs className="!border-none">
            <Tabs.Item
              title="Información Personal"
              className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600"
            >
              <div className="mt-5">
                <div className="mb-8">
                  <Label htmlFor="foto-perfil">Foto de perfil</Label>
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-2">
                    <div className="w-[80px] h-[80px] bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HiUser className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Button color="light" className="font-bold" onClick={() => photoInputRef.current?.click()}>
                        Subir foto
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <div>
                      <ul className="text-xs md:text-sm">
                        <li>Se recomienda al menos 800x800px</li>
                        <li>Formato WebP, JPG o PNG</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row flex-wrap gap-y-4 -mx-2">
                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="firstName">Nombre(s)</Label>
                    <TextInput
                      id="firstName"
                      placeholder="John"
                      value={profile?.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
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
                    <Label htmlFor="lastName">Apellido(s)</Label>
                    <TextInput
                      id="lastName"
                      placeholder="Doe"
                      value={profile?.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
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
                    <Label htmlFor="pronoun">Pronombre</Label>
                    <TextInput
                      id="pronoun"
                      placeholder="Él, Ella, Elle"
                      value={profile?.pronoun || ""}
                      onChange={(e) => handleChange("pronoun", e.target.value)}
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
                    <Label htmlFor="position">Cargo</Label>
                    <TextInput
                      id="position"
                      placeholder="CEO"
                      value={profile?.position || ""}
                      onChange={(e) => handleChange("position", e.target.value)}
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

                  {renderEmailField()}

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="phone">Número de teléfono</Label>
                    <InternationalPhoneInput
                      id="phone"
                      name="phone"
                      placeholder="Número de teléfono"
                      value={profile?.phone || ""}
                      onChange={async ({ target }) => {
                        handleChange("phone", target.value);
                        return true;
                      }}
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
                        id="typeDocument"
                        className="w-[100px]"
                        value={profile?.typeDocument || ""}
                        onChange={(e) =>
                          handleChange("typeDocument", e.target.value)
                        }
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
                        className="w-auto flex-grow"
                        id="numDocument"
                        placeholder="Número de documento"
                        value={profile?.numDocument || ""}
                        onChange={(e) =>
                          handleChange("numDocument", e.target.value)
                        }
                        type="number"
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
                  </div>

                  {/* Campo de perfil público - solo visible para empresas grandes */}
                  {profile?.companySize === "grande" && (
                    <div className="w-full px-2 space-y-1 mt-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="publicProfile"
                          checked={profile?.publicProfile || false}
                          onChange={(e) => handleChange("publicProfile", e.target.checked)}
                          className="mt-1 mr-2"
                          disabled={isUserOnly}
                        />
                        <div>
                          <Label htmlFor="publicProfile" className="font-medium">
                            Perfil público
                          </Label>
                          <p className="text-xs text-gray-600">
                            Activa esta opción para que tu perfil sea visible públicamente en la plataforma.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Mensaje informativo para empresas no grandes */}
                  {profile?.companySize && profile.companySize !== "grande" && (
                    <div className="w-full px-2 mt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> Tu perfil es público automáticamente ya que tu empresa no es de tamaño grande.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8">{saveButton}</div>
              </div>
            </Tabs.Item>
            <Tabs.Item
              title="Información Empresarial"
              className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600"
            >
              <div className="mt-5">
                <div className="mb-8">
                  <Label htmlFor="logo">Logo de la marca</Label>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 mt-2">
                    <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center rounded-full min-w-[100px] overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo de la empresa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-500">
                          Logo
                        </span>
                      )}
                    </div>
                    {!isUserOnly && (
                      <>
                        <div>
                          <Button
                            color="light"
                            className="font-bold"
                            disabled={isUserOnly}
                            onClick={() => logoInputRef.current?.click()}
                          >
                            Subir logo
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                        </div>
                        <div>
                          <ul className="text-xs md:text-sm">
                            <li>Se recomienda al menos 800x800px</li>
                            <li>Formato WebP, JPG o PNG</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row flex-wrap gap-y-4 -mx-2">
                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="nameCompany">Nombre de la marca</Label>
                    <TextInput
                      id="nameCompany"
                      placeholder="Nombre de la marca"
                      value={profile?.nameCompany || ""}
                      onChange={(e) =>
                        handleChange("nameCompany", e.target.value)
                      }
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="businessName">Razón social</Label>
                    <TextInput
                      id="businessName"
                      placeholder="Razón social"
                      value={profile?.businessName || ""}
                      onChange={(e) =>
                        handleChange("businessName", e.target.value)
                      }
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full px-2 space-y-1">
                    <Label htmlFor="description">Descripción de la empresa</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción general de la empresa, sus servicios, productos y valores."
                      value={profile?.description || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      rows={4}
                      color="blue"
                      disabled={isUserOnly}
                      className={`border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="typeDocumentCompany">Documento</Label>
                    <div className="flex items-center space-x-1">
                      <Select
                        id="typeDocumentCompany"
                        className="w-[100px]"
                        value={profile?.typeDocumentCompany || ""}
                        onChange={(e) =>
                          handleChange("typeDocumentCompany", e.target.value)
                        }
                        color="blue"
                        disabled={isUserOnly}
                        theme={{
                          field: {
                            select: {
                              base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
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
                        id="numDocumentCompany"
                        placeholder="Número de documento"
                        value={profile?.numDocumentCompany || ""}
                        onChange={(e) =>
                          handleChange("numDocumentCompany", e.target.value)
                        }
                        type="number"
                        color="blue"
                        disabled={isUserOnly}
                        theme={{
                          field: {
                            input: {
                              base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="webSite">Página Web</Label>
                    <TextInput
                      id="webSite"
                      type="url"
                      placeholder="https://www.misitio.com"
                      value={profile?.webSite || ""}
                      onChange={(e) => handleChange("webSite", e.target.value)}
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="annualRevenue">
                      Ingresos anuales (en millones de pesos COP)
                    </Label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="annualRevenue"
                      name="annualRevenue"
                      className={`w-full border rounded px-3 py-2 border-slate-200 focus:border-blue-600 ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`}
                      placeholder="Ej: $1.200.000"
                      value={formatCOP(annualRevenueDisplay)}
                      onChange={handleAnnualRevenueChange}
                      disabled={isUserOnly}
                    />
                    {sector && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sector detectado: <b>{sector}</b>
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="ciiu">Código CIIU</Label>
                    <Select
                      id="ciiu"
                      value={profile?.ciiu || ""}
                      onChange={(e) => handleChange("ciiu", e.target.value)}
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          select: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    >
                      <option value="">Seleccionar código CIIU</option>
                      {ciiuOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="addressCompany">Dirección</Label>
                    <TextInput
                      id="addressCompany"
                      placeholder="Calle 123 # 45-67"
                      value={profile?.addressCompany || ""}
                      onChange={(e) =>
                        handleChange("addressCompany", e.target.value)
                      }
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="department">Región / Departamento</Label>
                    <TextInput
                      id="department"
                      placeholder="Ej: Cundinamarca"
                      value={profile?.department || ""}
                      onChange={(e) =>
                        handleChange("department", e.target.value)
                      }
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="city">Ciudad / Municipio</Label>
                    <TextInput
                      id="city"
                      placeholder="Ej: Bogotá"
                      value={profile?.city || ""}
                      onChange={(e) =>
                        handleChange("city", e.target.value)
                      }
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          input: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="country">País</Label>
                    <Select
                      id="country"
                      value={profile?.country || ""}
                      onChange={(e) => handleChange("country", e.target.value)}
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          select: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    >
                      <option value="">Seleccionar país</option>
                      {COUNTRIES_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.title}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="companySize">Tamaño de la empresa</Label>
                    <TextInput
                      id="companySize"
                      value={profile?.companySize === "micro" ? "Micro" : profile?.companySize === "mediana" ? "Mediana" : "Grande"}
                      disabled={true}
                      color="blue"
                      theme={{
                        field: {
                          input: {
                            base: "border-slate-200 focus:border-blue-600 w-full bg-gray-100 text-gray-500",
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="peopleGroup">¿El 50% de los accionistas de la empresa pertenece a algún grupo poblacional?</Label>
                    {isClient ? (
                      <ReactSelect
                        isMulti
                        options={PEOPLE_GROUP_OPTIONS}
                        value={
                          Array.isArray(profile?.peopleGroup)
                            ? PEOPLE_GROUP_OPTIONS.filter((option) =>
                                (profile.peopleGroup as string[]).includes(option.value)
                              )
                            : profile?.peopleGroup && typeof profile.peopleGroup === 'string'
                            ? PEOPLE_GROUP_OPTIONS.filter(
                                (option) => option.value === profile.peopleGroup
                              )
                            : []
                        }
                        key={`peopleGroup-${JSON.stringify(Array.isArray(profile?.peopleGroup) ? profile.peopleGroup.sort() : profile?.peopleGroup || [])}`}
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
                          
                          handleChange("peopleGroup", values);
                        }}
                        placeholder="Selecciona una o más opciones"
                        noOptionsMessage={() => "No hay opciones"}
                        instanceId="peopleGroup-select-edit"
                        isDisabled={isUserOnly}
                      />
                    ) : (
                      <div className="w-full h-10 border border-gray-300 rounded bg-gray-100"></div>
                    )}
                  </div>

                  {(Array.isArray(profile?.peopleGroup) ? profile.peopleGroup.includes("otro") : profile?.peopleGroup === "otro") && (
                    <div className="w-full md:w-1/2 px-2 space-y-1">
                      <Label htmlFor="otherPeopleGroup">Especificar otro grupo poblacional</Label>
                      <TextInput
                        id="otherPeopleGroup"
                        value={profile?.otherPeopleGroup || ""}
                        onChange={(e) => handleChange("otherPeopleGroup", e.target.value)}
                        color="blue"
                        disabled={isUserOnly}
                        theme={{
                          field: {
                            input: {
                              base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                            },
                          },
                        }}
                        placeholder="Especificar grupo poblacional"
                      />
                    </div>
                  )}

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="inclusionDEI">
                      ¿La empresa está comprometida con la equidad e inclusión DEI?
                    </Label>
                    <Select
                      id="inclusionDEI"
                      value={typeof profile?.inclusionDEI === 'boolean' 
                        ? (profile.inclusionDEI ? "yes" : "no") 
                        : (profile?.inclusionDEI || "no")}
                      onChange={(e) => handleChange("inclusionDEI", e.target.value)}
                      color="blue"
                      disabled={isUserOnly}
                      theme={{
                        field: {
                          select: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    >
                      <option value="no">No</option>
                      <option value="yes">Sí</option>
                    </Select>
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="chamberOfCommerce">
                        Cámara de comercio (PDF)
                      </Label>
                      {!profile?.chamberOfCommerce ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No cargado
                        </span>
                      ) : profile?.chamberOfCommerceValidated === 'valido' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Válido
                        </span>
                      ) : profile?.chamberOfCommerceValidated === 'invalido' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Inválido
                        </span>
                      ) : profile?.chamberOfCommerceValidated === 'en-progreso' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ⏳ En progreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                      <Button
                        onClick={() => chamberOfCommerceInputRef.current?.click()}
                        className="font-bold"
                        color="light"
                        type="button"
                        disabled={isUserOnly}
                      >
                        {chamberOfCommerceFile ? "Cambiar archivo" : profile?.chamberOfCommerce ? "Reemplazar PDF" : "Subir PDF"}
                      </Button>
                      {chamberOfCommerceFile && (
                        <span className="text-sm text-gray-600">
                          {chamberOfCommerceFile.name}
                        </span>
                      )}
                      {!chamberOfCommerceFile && profile?.chamberOfCommerce && (
                        <span className="text-sm text-gray-600">
                          Documento existente
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
                      disabled={isUserOnly}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: PDF (máximo 10MB)
                    </p>
                    {profile?.chamberOfCommerceComments && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Comentarios:</p>
                        <p className="text-sm text-blue-800">{profile.chamberOfCommerceComments}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="taxIdentificationDocument">
                        Documento Identificación Tributaria (PDF)
                      </Label>
                      {!profile?.taxIdentificationDocument ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No cargado
                        </span>
                      ) : profile?.taxIdentificationDocumentValidated === 'valido' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Válido
                        </span>
                      ) : profile?.taxIdentificationDocumentValidated === 'invalido' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Inválido
                        </span>
                      ) : profile?.taxIdentificationDocumentValidated === 'en-progreso' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ⏳ En progreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                      <Button
                        onClick={() => taxIdentificationDocumentInputRef.current?.click()}
                        className="font-bold"
                        color="light"
                        type="button"
                        disabled={isUserOnly}
                      >
                        {taxIdentificationDocumentFile ? "Cambiar archivo" : profile?.taxIdentificationDocument ? "Reemplazar PDF" : "Subir PDF"}
                      </Button>
                      {taxIdentificationDocumentFile && (
                        <span className="text-sm text-gray-600">
                          {taxIdentificationDocumentFile.name}
                        </span>
                      )}
                      {!taxIdentificationDocumentFile && profile?.taxIdentificationDocument && (
                        <span className="text-sm text-gray-600">
                          Documento existente
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
                      disabled={isUserOnly}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: PDF (máximo 10MB)
                    </p>
                    {profile?.taxIdentificationDocumentComments && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Comentarios:</p>
                        <p className="text-sm text-blue-800">{profile.taxIdentificationDocumentComments}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">{saveButton}</div>
              </div>
            </Tabs.Item>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
