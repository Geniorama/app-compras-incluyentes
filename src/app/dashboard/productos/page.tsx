"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProductsView from "@/views/Dashboard/ProductsView";
import { sanityClient } from "@/lib/sanity.client";
import { SanityProductDocument, SanityServiceDocument } from "@/types/sanity";
import { Spinner } from "flowbite-react";

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<{
    products: SanityProductDocument[];
    services: SanityServiceDocument[];
  }>({
    products: [],
    services: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.company?._id) return;

      try {
        // Obtener productos
        const products = await sanityClient.fetch<SanityProductDocument[]>(`
          *[_type == "product" && company._ref == $companyId] {
            _id,
            _type,
            _rev,
            _createdAt,
            _updatedAt,
            name,
            description,
            category,
            price,
            status,
            sku,
            images,
            company,
            createdBy,
            updatedBy
          } | order(createdAt desc)
        `, { companyId: user.company._id });

        // Obtener servicios
        const services = await sanityClient.fetch<SanityServiceDocument[]>(`
          *[_type == "service" && company._ref == $companyId] {
            _id,
            _type,
            _rev,
            _createdAt,
            _updatedAt,
            name,
            description,
            category,
            price,
            status,
            duration,
            modality,
            availability,
            images,
            company,
            createdBy,
            updatedBy
          } | order(createdAt desc)
        `, { companyId: user.company._id });

        setInitialData({ products, services });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.company?._id) {
      fetchData();
    }
  }, [user?.company?._id]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ProductsView initialData={initialData} />;
}