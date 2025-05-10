"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sanityClient } from "@/lib/sanity.client";
import EmpresaView from "@/views/Empresas/EmpresaView";
import DashboardNavbar from "@/components/dashboard/Navbar";
import { Spinner } from "flowbite-react";
import { SanityProductDocument, SanityServiceDocument } from '@/types/sanity';

interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  image?: SanityImage;
  price?: number;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  image?: SanityImage;
  price?: number;
}

interface Company {
  _id: string;
  nameCompany: string;
  businessName: string;
  logo: SanityImage;
  addressCompany: string;
  webSite: string;
  sector: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
  products?: Product[];
  services?: Service[];
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
        const query = `*[_type == "company" && _id == $id][0]{
          _id,
          nameCompany,
          businessName,
          logo,
          addressCompany,
          webSite,
          sector,
          typeDocumentCompany,
          numDocumentCompany,
          ciiu,
          phone,
          facebook,
          instagram,
          tiktok,
          pinterest,
          linkedin,
          xtwitter,
          "products": *[_type == "product" && references(^._id)],
          "services": *[_type == "service" && references(^._id)]
        }`;
        const data = await sanityClient.fetch(query, { id });
        setCompany(data);
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
    const mapProduct = (p: Partial<SanityProductDocument>) => ({
      ...p,
      _id: p._id || "",
      name: p.name ?? "",
      description: p.description ?? "",
      category:
        typeof p.category === "string"
          ? p.category
          : (p.category && (p.category._id || p.category.slug?.current)) || "",
      status: p.status || "",
      images: p.images || [],
      createdAt: p._createdAt || "",
      updatedAt: p._updatedAt || "",
    });
    const mapService = (s: Partial<SanityServiceDocument>) => ({
      ...s,
      _id: s._id || "",
      name: s.name ?? "",
      description: s.description ?? "",
      category:
        typeof s.category === "string"
          ? s.category
          : (s.category && (s.category._id || s.category.slug?.current)) || "",
      status: s.status || "",
      images: s.images || [],
      createdAt: s._createdAt || "",
      updatedAt: s._updatedAt || "",
    });
    const companyData = {
      ...company,
      logo: getSanityImageUrl(company.logo),
      products: company.products?.map(mapProduct),
      services: company.services?.map(mapService),
    };
    return <EmpresaView company={companyData} />;
  }
  return null;
} 