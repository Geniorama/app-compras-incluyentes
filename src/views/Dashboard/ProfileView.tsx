"use client";

import Link from "next/link";
import { HiOutlineUserCircle, HiOutlineFolder, HiOutlineBell, HiOutlineLockClosed, HiOutlineArrowRight } from "react-icons/hi";
import { Label, TextInput, Button, Select, Spinner } from "flowbite-react";
import { Tabs } from "flowbite-react";
import InternationalPhoneInput from "@/components/InternationalPhoneInput ";
import { useEffect, useState } from "react";

interface SanityImage {
    _type: string;
    asset: {
        _ref: string;
        _type: string;
    };
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pronoun: string;
    position: string;
    typeDocument: string;
    numDocument: string;
    photo: SanityImage;
    nameCompany: string;
    businessName: string;
    typeDocumentCompany: string;
    numDocumentCompany: string;
    webSite: string;
    addressCompany: string;
    logo: SanityImage;
}

interface ProfileViewProps {
    initialProfile?: UserProfile | null;
    error?: string;
}

export default function ProfileView({ initialProfile, error: initialError }: ProfileViewProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    const handleChange = (field: keyof UserProfile, value: string) => {
        if (profile) {
            setProfile({ ...profile, [field]: value });
        }
    };

    // Función auxiliar para obtener la URL de la imagen
    const getImageUrl = (image: SanityImage | null) => {
        if (!image || !image.asset || !image.asset._ref) return null;
        return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
    };

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

    const photoUrl = getImageUrl(profile.photo);
    const logoUrl = getImageUrl(profile.logo);

    return (
        <div className="flex container mx-auto mt-10">
            <aside className="w-1/3 xl:w-1/4">
                <ul className="flex flex-col gap-4 border border-gray-200 p-5 rounded-lg text-sm">
                    <li>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 p-3 py-4 bg-violet-200 rounded-lg">
                            <HiOutlineUserCircle className="w-5 h-5" />
                            <span>Mi Perfil</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 p-3 py-4">
                            <HiOutlineFolder className="w-5 h-5" />
                            <span>Gestión de Servicios y Productos</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 p-3 py-4">
                            <HiOutlineBell className="w-5 h-5" />
                            <span>Notificaciones</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 p-3 py-4">
                            <HiOutlineLockClosed className="w-5 h-5" />
                            <span>Seguridad</span>
                        </Link>
                    </li>
                    <hr />
                    <li>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 p-3 py-4">
                            <HiOutlineArrowRight className="w-5 h-5" />
                            <span>Cerrar Sesión</span>
                        </Link>
                    </li>
                </ul>
            </aside>
            <main className="w-3/3 xl:w-3/4 pl-10">
                <h1 className="text-2xl font-bold">Mi perfil</h1>
                <div className="border-b border-gray-200 mt-5">
                    <Tabs className="!border-none">
                        <Tabs.Item title="Información Personal" className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600">
                            <div className="mt-5">
                                <div className="mb-8">
                                    <Label htmlFor="foto-perfil">Foto de perfil</Label>
                                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-2">
                                        <div className="w-[80px] h-[80px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-gray-500">Foto</span>
                                            )}
                                        </div>
                                        <div>
                                            <Button color="light" className="font-bold">
                                                Subir foto
                                            </Button>
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
                                            onChange={(e) => handleChange('firstName', e.target.value)}
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
                                            onChange={(e) => handleChange('lastName', e.target.value)}
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
                                            onChange={(e) => handleChange('pronoun', e.target.value)}
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
                                            onChange={(e) => handleChange('position', e.target.value)}
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
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            placeholder="email@miempresa.com"
                                            value={profile?.email || ""}
                                            onChange={(e) => handleChange('email', e.target.value)}
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
                                        <Label htmlFor="phone">Número de teléfono</Label>
                                        <InternationalPhoneInput
                                            id="phone"
                                            name="phone"
                                            placeholder="Número de teléfono"
                                            value={profile?.phone || ""}
                                            onChange={async ({ target: { value } }) => {
                                                handleChange('phone', value);
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
                                                onChange={(e) => handleChange('typeDocument', e.target.value)}
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
                                                onChange={(e) => handleChange('numDocument', e.target.value)}
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

                                <div className="mt-8">
                                    <Button>Guardar cambios</Button>
                                </div>
                            </div>
                        </Tabs.Item>
                        <Tabs.Item title="Información Empresarial" className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600">
                            <div className="mt-5">
                                <div className="mb-8">
                                    <Label htmlFor="logo">Logo de la marca</Label>
                                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 mt-2">
                                        <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center rounded-full min-w-[100px] overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo de la empresa" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-gray-500">Logo</span>
                                            )}
                                        </div>
                                        <div>
                                            <Button color="light" className="font-bold">
                                                Subir logo
                                            </Button>
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
                                        <Label htmlFor="nameCompany">Nombre de la marca</Label>
                                        <TextInput
                                            id="nameCompany"
                                            placeholder="Nombre de la marca"
                                            value={profile?.nameCompany || ""}
                                            onChange={(e) => handleChange('nameCompany', e.target.value)}
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
                                        <Label htmlFor="businessName">Razón social</Label>
                                        <TextInput
                                            id="businessName"
                                            placeholder="Razón social"
                                            value={profile?.businessName || ""}
                                            onChange={(e) => handleChange('businessName', e.target.value)}
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
                                        <Label htmlFor="typeDocumentCompany">Documento</Label>
                                        <div className="flex items-center space-x-1">
                                            <Select
                                                id="typeDocumentCompany"
                                                className="w-[100px]"
                                                value={profile?.typeDocumentCompany || ""}
                                                onChange={(e) => handleChange('typeDocumentCompany', e.target.value)}
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
                                                className="w-auto flex-grow"
                                                id="numDocumentCompany"
                                                placeholder="Número de documento"
                                                value={profile?.numDocumentCompany || ""}
                                                onChange={(e) => handleChange('numDocumentCompany', e.target.value)}
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

                                    <div className="w-full md:w-1/2 px-2 space-y-1">
                                        <Label htmlFor="webSite">Página Web</Label>
                                        <TextInput
                                            id="webSite"
                                            type="url"
                                            placeholder="https://www.misitio.com"
                                            value={profile?.webSite || ""}
                                            onChange={(e) => handleChange('webSite', e.target.value)}
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
                                        <Label htmlFor="addressCompany">Dirección</Label>
                                        <TextInput
                                            id="addressCompany"
                                            placeholder="Calle 123 # 45-67"
                                            value={profile?.addressCompany || ""}
                                            onChange={(e) => handleChange('addressCompany', e.target.value)}
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

                                <div className="mt-8">
                                    <Button>Guardar cambios</Button>
                                </div>
                            </div>
                        </Tabs.Item>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

