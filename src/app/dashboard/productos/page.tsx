"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProductsView from "@/views/Dashboard/ProductsView";
import { sanityClient } from "@/lib/sanity.client";
import { SanityProductDocument, SanityServiceDocument, SanityCategoryDocument } from "@/types/sanity";
import { Spinner } from "flowbite-react";

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<{
    products: SanityProductDocument[];
    services: SanityServiceDocument[];
    categories: {
      products: SanityCategoryDocument[];
      services: SanityCategoryDocument[];
    };
  }>({
    products: [],
    services: [],
    categories: {
      products: [],
      services: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si la empresa es grande
  const isLargeCompany = user?.company?.companySize === "grande";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

    useEffect(() => {
    const fetchData = async () => {
      if (!user?.company?._id) return;

      // Si es empresa grande, no cargar datos
      if (isLargeCompany) {
        setIsLoading(false);
        return;
      }

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
            images[]{
              _type,
              asset->{
                _id,
                url
              }
            },
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
            images[]{
              _type,
              asset->{
                _id,
                url
              }
            },
            company,
            createdBy,
            updatedBy
          } | order(createdAt desc)
        `, { companyId: user.company._id });

        // Obtener categorías
        const [productCategories, serviceCategories] = await Promise.all([
          sanityClient.fetch<SanityCategoryDocument[]>(`
            *[_type == "category" && "product" in types] {
              _id,
              name,
              description,
              image{
                asset->{
                  _id,
                  url
                }
              },
              types,
              slug
            }
          `),
          sanityClient.fetch<SanityCategoryDocument[]>(`
            *[_type == "category" && "service" in types] {
              _id,
              name,
              description,
              image{
                asset->{
                  _id,
                  url
                }
              },
              types,
              slug
            }
          `)
        ]);

        setInitialData({
          products,
          services,
          categories: {
            products: productCategories,
            services: serviceCategories
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.company?._id) {
      fetchData();
    }
  }, [user?.company?._id, isLargeCompany]);

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

  // Si es empresa grande, mostrar mensaje informativo
  if (isLargeCompany) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Módulo no disponible
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                El módulo de productos y servicios no está habilitado para empresas grandes
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                ¿Por qué no puedo acceder a este módulo?
              </h2>
              <p className="text-blue-800 text-left">
                Las empresas clasificadas como <strong>&quot;grandes&quot;</strong> tienen acceso limitado al módulo de productos y servicios. 
                Esta restricción se basa en el tamaño de su empresa determinado por los ingresos anuales y el sector económico.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p>Tamaño de empresa actual: <span className="font-semibold text-gray-700">Grande</span></p>
              <p className="mt-2">
                Para más información sobre esta restricción, contacte al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProductsView initialData={initialData} />;
}