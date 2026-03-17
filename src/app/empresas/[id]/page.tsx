"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sanityClient } from "@/lib/sanity.client";
import EmpresaView from "@/views/Empresas/EmpresaView";
import DashboardNavbar from "@/components/dashboard/Navbar";
import { Spinner } from "flowbite-react";
import type { SanityProductDocument, SanityServiceDocument } from "@/types/sanity";

interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

interface PublicUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  email?: string;
  phone?: string;
  photo?: SanityImage;
  publicProfile?: boolean;
}

interface Company {
  _id: string;
  nameCompany: string;
  businessName: string;
  description?: string;
  logo: SanityImage;
  addressCompany: string;
  webSite: string;
  sector: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  phone: string;
  companySize?: string;
  peopleGroup?: string | string[];
  inclusionDEI?: boolean;
  diverseSupplier?: boolean;
  chamberOfCommerceValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
  taxIdentificationDocumentValidated?: 'pendiente' | 'en-progreso' | 'valido' | 'invalido';
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
  products?: SanityProductDocument[];
  services?: SanityServiceDocument[];
  publicUsers?: PublicUser[];
}

export default function EmpresaPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const company = await sanityClient.fetch<Company>(`
          *[_type == "company" && _id == $id][0]{
            _id,
            nameCompany,
            businessName,
            description,
            logo,
            addressCompany,
            webSite,
            sector,
            typeDocumentCompany,
            numDocumentCompany,
            ciiu,
            phone,
            companySize,
            peopleGroup,
            inclusionDEI,
            diverseSupplier,
            chamberOfCommerceValidated,
            taxIdentificationDocumentValidated,
            facebook,
            instagram,
            tiktok,
            pinterest,
            linkedin,
            xtwitter,
            "products": *[_type == "product" && company._ref == $id && status == "active"]{
              _id,
              name,
              description,
              price,
              status,
              images,
              "category": category[]->{
                _id,
                name
              }
            },
            "services": *[_type == "service" && company._ref == $id && status == "active"]{
              _id,
              name,
              description,
              price,
              status,
              images,
              "category": category[]->{
                _id,
                name
              }
            },
            "publicUsers": *[_type == "user" && company._ref == $id && (
              (role == "member" && company->companySize != "grande") ||
              publicProfile == true
            )]{
              _id,
              firstName,
              lastName,
              position,
              email,
              phone,
              photo,
              publicProfile
            }
          }
        `, { id });
        setCompany(company);
      } catch (err) {
        console.error("Error al cargar la empresa:", err);
        setError("No se pudo cargar la información de la empresa");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  // Helper para convertir SanityImage a URL
  const getSanityImageUrl = (img?: SanityImage) =>
    img && img.asset?._ref
      ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${img.asset._ref
          .replace('image-', '')
          .replace('-jpg', '.jpg')
          .replace('-png', '.png')
          .replace('-webp', '.webp')}`
      : "";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="xl" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error || "Empresa no encontrada"}
        </div>
      </div>
    );
  }

  if (company) {
    const companyData = {
      ...company,
      logo: getSanityImageUrl(company.logo),
      products: company.products,
      services: company.services,
      publicUsers: company.publicUsers?.map(user => ({
        ...user,
        photo: user.photo ? getSanityImageUrl(user.photo) : undefined
      }))
    };
    return <EmpresaView company={companyData} />;
  }
  return null;
} 