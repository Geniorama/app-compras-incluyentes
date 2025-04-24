import { sanityClient } from "@/lib/sanity.client";
import ProductsView from "@/views/Dashboard/ProductsView";
import { cookies } from 'next/headers';

async function getProductsAndServices(userId: string) {
  try {
    // Obtener productos
    const products = await sanityClient.fetch(
      `*[_type == "product" && user._ref == $userId]{
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
      { userId }
    );

    // Obtener servicios
    const services = await sanityClient.fetch(
      `*[_type == "service" && user._ref == $userId]{
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
      { userId }
    );

    return {
      products,
      services
    };
  } catch (error) {
    console.error("Error fetching products and services:", error);
    return {
      products: [],
      services: []
    };
  }
}

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return <ProductsView initialData={{ products: [], services: [] }} />;
  }

  const data = await getProductsAndServices(userId);
  return <ProductsView initialData={data} />;
} 