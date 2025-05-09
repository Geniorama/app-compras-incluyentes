"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { sanityClient } from "@/lib/sanity.client";
import EmpresaView from "@/views/Empresas/EmpresaView";
import DashboardNavbar from "@/components/dashboard/Navbar";
import { Spinner } from "flowbite-react";

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
  const router = useRouter();
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
        setError("No se pudo cargar la información de la empresa");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

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

  return <EmpresaView company={company} />;
} 