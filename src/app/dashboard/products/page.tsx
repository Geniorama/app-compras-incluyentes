'use client';

import ProductsView from "@/views/Dashboard/ProductsView";
import { sanityClient } from "@/lib/sanity.client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";

async function getProductsAndServices(firebaseUid: string) {
  try {
    // Obtener productos
    const products = await sanityClient.fetch(
      `*[_type == "product" && user._ref in *[_type == "user" && firebaseUid == $firebaseUid]._id]{
        _id,
        name,
        description,
        category,
        price,
        status,
        sku,
        images,
        createdAt,
        updatedAt
      }`,
      { firebaseUid }
    );

    // Obtener servicios
    const services = await sanityClient.fetch(
      `*[_type == "service" && user._ref in *[_type == "user" && firebaseUid == $firebaseUid]._id]{
        _id,
        name,
        description,
        category,
        price,
        status,
        duration,
        modality,
        availability,
        images,
        createdAt,
        updatedAt
      }`,
      { firebaseUid }
    );

    return {
      products,
      services,
    };
  } catch (error) {
    console.error("Error fetching products and services:", error);
    return {
      products: [],
      services: [],
    };
  }
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ products: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProductsAndServices() {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const fetchedData = await getProductsAndServices(user.uid);
        setData(fetchedData);
      } catch (error) {
        console.error("Error al cargar productos y servicios:", error);
        setError("Error al cargar productos y servicios");
      } finally {
        setLoading(false);
      }
    }

    loadProductsAndServices();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">Usuario no autenticado</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return <ProductsView initialData={data} />;
}