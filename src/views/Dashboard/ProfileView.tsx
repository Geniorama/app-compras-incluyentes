"use client";

import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import {
  Label,
  TextInput,
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
import type { UserProfile, SanityImage } from "@/types";
import { getDepartamentosOptions, getCiudadesOptionsByDepartamento } from "@/utils/departamentosCiudades";

interface ProfileViewProps {
  initialProfile?: UserProfile | null;
  error?: string;
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para departamentos y ciudades
  const [departamentosOptions] = useState(() => getDepartamentosOptions());
  const [ciudadesOptions, setCiudadesOptions] = useState<{ value: string; label: string; }[]>([]);

  useEffect(() => {
    if (initialProfile) {
      // Si tenemos datos iniciales, combinar los datos del usuario y la empresa
      const combinedProfile = {
        ...initialProfile,
        // Si existe company, usar sus valores, si no, usar valores vacíos
        nameCompany: initialProfile.company?.nameCompany || "",
        businessName: initialProfile.company?.businessName || "",
        typeDocumentCompany: initialProfile.company?.typeDocumentCompany || "",
        numDocumentCompany: initialProfile.company?.numDocumentCompany || "",
        ciiu: initialProfile.company?.ciiu || "",
        webSite: initialProfile.company?.webSite || "",
        addressCompany: initialProfile.company?.addressCompany || "",
        department: initialProfile.company?.department || "",
        city: initialProfile.company?.city || "",
        logo: initialProfile.company?.logo,
        facebook: initialProfile.company?.facebook || "",
        instagram: initialProfile.company?.instagram || "",
        tiktok: initialProfile.company?.tiktok || "",
        pinterest: initialProfile.company?.pinterest || "",
        linkedin: initialProfile.company?.linkedin || "",
        xtwitter: initialProfile.company?.xtwitter || "",
      };
      const typedCombinedProfile: UserProfile = {
        ...combinedProfile,
        logo: combinedProfile.logo as SanityImage | undefined,
      };
      setProfile(typedCombinedProfile);
      setOriginalProfile(typedCombinedProfile);
    }
  }, [initialProfile]);

  // Actualizar opciones de ciudades cuando cambie el departamento
  useEffect(() => {
    if (profile?.department) {
      const ciudades = getCiudadesOptionsByDepartamento(profile.department);
      setCiudadesOptions(ciudades);
    } else {
      setCiudadesOptions([]);
    }
  }, [profile?.department]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      // Si cambia el departamento, limpiar la ciudad
      if (field === 'department') {
        setProfile({ ...profile, [field]: value, city: '' });
      } else {
        setProfile({ ...profile, [field]: value });
      }
    }
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
      "nameCompany",
      "businessName",
      "typeDocumentCompany",
      "numDocumentCompany",
      "webSite",
      "addressCompany",
      "department",
      "city",
      "photo",
      "logo",
    ];

    // Si hay una nueva foto o logo seleccionados, hay cambios
    if (photoFile || logoFile) return true;

    return fieldsToCompare.some(
      (field) => profile[field] !== originalProfile[field]
    );
  }, [profile, originalProfile, photoFile, logoFile]);

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

      // Separar datos del usuario y la empresa
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
      };

      const companyData = {
        nameCompany: profile.nameCompany,
        businessName: profile.businessName,
        typeDocumentCompany: profile.typeDocumentCompany,
        numDocumentCompany: profile.numDocumentCompany,
        ciiu: profile.ciiu,
        webSite: profile.webSite,
        addressCompany: profile.addressCompany,
        department: profile.department,
        city: profile.city,
        facebook: profile.facebook,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        pinterest: profile.pinterest,
        linkedin: profile.linkedin,
        xtwitter: profile.xtwitter,
        logo: logoSanity,
      };

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
        const updatedProfile = {
          ...result.data.user,
          ...result.data.company,
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);

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
                    <div className="w-[80px] h-[80px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-500">
                          Foto
                        </span>
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
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      id="department"
                      value={profile?.department || ""}
                      onChange={(e) => handleChange("department", e.target.value)}
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
                      <option value="">Seleccionar departamento</option>
                      {departamentosOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-full md:w-1/2 px-2 space-y-1">
                    <Label htmlFor="city">Ciudad</Label>
                    <Select
                      id="city"
                      value={profile?.city || ""}
                      onChange={(e) => handleChange("city", e.target.value)}
                      color="blue"
                      disabled={isUserOnly || !profile?.department}
                      theme={{
                        field: {
                          select: {
                            base: `border-slate-200 focus:border-blue-600 w-full ${isUserOnly || !profile?.department ? "bg-gray-100 text-gray-500" : ""}`,
                          },
                        },
                      }}
                    >
                      <option value="">Seleccionar ciudad</option>
                      {ciudadesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
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
