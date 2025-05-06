"use client";

import {
  Button,
  Tabs,
  TextInput,
  Select,
  Table,
  Modal,
  Spinner,
} from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";
import {
  HiPlus,
  HiOutlineSearch,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import ProductServiceForm from "@/components/ProductServiceForm";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { SanityImage } from "@/types/index";
import { SanityProductDocument, SanityServiceDocument } from "@/types/sanity";

interface ProductServiceData {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  images: (File | SanityImage)[];
  imagesPreviews: string[];
  // Campos específicos para productos
  sku?: string;
  // Campos específicos para servicios
  duration?: string;
  modality?: string;
  availability?: string;
}

interface ProductsViewProps {
  initialData: {
    products: SanityProductDocument[];
    services: SanityServiceDocument[];
  };
}

type SanityImageWithKey = SanityImage & { _key?: string };

const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    active: "Activo",
    inactive: "Inactivo",
    draft: "Borrador",
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status: string): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-red-100 text-red-800";
    case "draft":
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ProductsView({ initialData }: ProductsViewProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [servicesViewMode, setServicesViewMode] = useState<"grid" | "list">(
    "grid"
  );
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<"product" | "service">("product");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<SanityProductDocument[]>(
    initialData.products
  );
  const [services, setServices] = useState<SanityServiceDocument[]>(
    initialData.services
  );

  // Estados para los filtros
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStatus, setProductStatus] = useState("");

  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceStatus, setServiceStatus] = useState("");

  // Estado para manejar la ventana de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    SanityProductDocument | SanityServiceDocument | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para manejar la edición
  const [itemToEdit, setItemToEdit] = useState<SanityProductDocument | SanityServiceDocument | null>(null);

  const handleAdd = (type: "product" | "service") => {
    setFormType(type);
    setItemToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (item: SanityProductDocument | SanityServiceDocument) => {
    if(!item) return;
    
    // Filtrar solo imágenes válidas
    const validImages = item.images.filter(img => img && img.asset && img.asset._ref);
    const imagesPreviews = validImages.map(img =>
      `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${img.asset._ref
        .replace("image-", "")
        .replace("-jpg", ".jpg")
        .replace("-png", ".png")
        .replace("-webp", ".webp")}`
    );
    
    // Determinar si es producto o servicio
    const isProduct = "sku" in item;
    setFormType(isProduct ? "product" : "service");
    
    // Crear un objeto compatible con ProductServiceData
    const formData: Partial<ProductServiceData> = {
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      status: item.status,
      images: validImages as (File | SanityImage)[],
      imagesPreviews: imagesPreviews
    };
    
    // Agregar campos específicos según el tipo
    if (isProduct && 'sku' in item) {
      formData.sku = item.sku;
    } else if (!isProduct) {
      const serviceItem = item as SanityServiceDocument;
      formData.duration = serviceItem.duration;
      formData.modality = serviceItem.modality;
      formData.availability = serviceItem.availability;
    }
    
    setItemToEdit(item);
    setShowModal(true);
  };

  const handleDeleteClick = (item: SanityProductDocument | SanityServiceDocument) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const isProduct = "sku" in itemToDelete;
      const endpoint = isProduct ? "/api/products" : "/api/services";

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemToDelete._id
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      // Actualizar el estado local
      if (isProduct) {
        setProducts(products.filter(p => p._id !== itemToDelete._id));
      } else {
        setServices(services.filter(s => s._id !== itemToDelete._id));
      }

      toast.success("Elemento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el elemento");
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  // Función para limpiar los datos antes de enviar al backend
  function cleanRequestData(data: ProductServiceData, type: "product" | "service") {
    const commonFields = {
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      status: data.status,
      images: data.images,
    };
    if (type === "product") {
      return {
        ...commonFields,
        sku: data.sku,
      };
    } else {
      return {
        ...commonFields,
        duration: data.duration,
        modality: data.modality,
        availability: data.availability,
      };
    }
  }

  const handleSubmit = async (data: ProductServiceData) => {
    setIsSubmitting(true);
    try {
      const isProduct = formType === "product";
      const endpoint = isProduct ? "/api/products" : "/api/services";

      // Si hay imágenes, procesarlas primero
      let processedImages = data.images;
      if (data.images.length > 0) {
        const imageAssets = await Promise.all(
          data.images.map(async (image) => {
            if (image instanceof File) {
              // Subir la imagen usando el endpoint de la API local
              const formData = new FormData();
              formData.append("image", image);
              const uploadRes = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
              });
              if (!uploadRes.ok) throw new Error("Error al subir la imagen");
              const uploadData = await uploadRes.json();
              // Guardar la estructura completa de imagen y agregar _key único
              return {
                _type: "image",
                asset: uploadData.asset,
                _key: crypto.randomUUID(),
              };
            }
            // Si ya es una imagen de Sanity, asegúrate de que tenga _key
            const imgTyped = image as SanityImageWithKey;
            return {
              ...imgTyped,
              _key: imgTyped._key || crypto.randomUUID(),
            };
          })
        );
        processedImages = imageAssets;
      }

      // Limpiar los datos antes de enviar
      const requestData = cleanRequestData({
        ...data,
        images: processedImages,
        price: data.price ? Number(data.price) : undefined,
      }, formType);

      if (itemToEdit) {
        // Actualizar
        const response = await fetch("/api/update-product-service", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemToEdit._id,
            data: requestData,
            userId: user?.uid
          }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar");
        }

        const result = await response.json();
        
        // Actualizar estado local
        if (isProduct) {
          setProducts(
            products.map((p) =>
              p._id === itemToEdit._id
                ? result.data as SanityProductDocument
                : p
            )
          );
        } else {
          setServices(
            services.map((s) =>
              s._id === itemToEdit._id
                ? result.data as SanityServiceDocument
                : s
            )
          );
        }

        toast.success("Elemento actualizado correctamente");
      } else {
        // Crear
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: requestData,
            userId: user?.uid
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear");
        }

        const result = await response.json();
        
        // Actualizar estado local
        if (isProduct) {
          setProducts([...products, result.data as SanityProductDocument]);
        } else {
          setServices([...services, result.data as SanityServiceDocument]);
        }

        toast.success("Elemento creado correctamente");
      }

      setShowModal(false);
      setItemToEdit(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el elemento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGridView = (type: "product" | "service") => {
    const items = type === "product" ? products : services;
    const search = type === "product" ? productSearch : serviceSearch;
    const category = type === "product" ? productCategory : serviceCategory;
    const status = type === "product" ? productStatus : serviceStatus;

    const filteredItems = items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        !category || item.category === category;
      const matchesStatus = !status || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              {item.images && item.images.length > 0 && item.images[0].asset && item.images[0].asset._ref ? (
                <img
                  src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${item.images[0].asset._ref
                    .replace("image-", "")
                    .replace("-jpg", ".jpg")
                    .replace("-png", ".png")
                    .replace("-webp", ".webp")}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {item.description || "Sin descripción"}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-semibold">
                  {item.price
                    ? `$${item.price.toLocaleString()}`
                    : "Precio no especificado"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  size="xs"
                  color="info"
                  onClick={() => handleEdit(item)}
                >
                  Editar
                </Button>
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => handleDeleteClick(item)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = (type: "product" | "service") => {
    const items = type === "product" ? products : services;
    const search = type === "product" ? productSearch : serviceSearch;
    const category = type === "product" ? productCategory : serviceCategory;
    const status = type === "product" ? productStatus : serviceStatus;

    const filteredItems = items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        !category || item.category === category;
      const matchesStatus = !status || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
      <Table>
        <Table.Head>
          <Table.HeadCell>Imagen</Table.HeadCell>
          <Table.HeadCell>Nombre</Table.HeadCell>
          <Table.HeadCell>Descripción</Table.HeadCell>
          <Table.HeadCell>Precio</Table.HeadCell>
          <Table.HeadCell>Estado</Table.HeadCell>
          <Table.HeadCell>Acciones</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {filteredItems.map((item) => (
            <Table.Row key={item._id}>
              <Table.Cell>
                {item.images && item.images.length > 0 && item.images[0].asset && item.images[0].asset._ref ? (
                  <img
                    src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${item.images[0].asset._ref
                      .replace("image-", "")
                      .replace("-jpg", ".jpg")
                      .replace("-png", ".png")
                      .replace("-webp", ".webp")}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}
              </Table.Cell>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.description || "Sin descripción"}</Table.Cell>
              <Table.Cell>
                {item.price
                  ? `$${item.price.toLocaleString()}`
                  : "Precio no especificado"}
              </Table.Cell>
              <Table.Cell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </Table.Cell>
              <Table.Cell>
                <div className="flex space-x-2">
                  <Button
                    size="xs"
                    color="info"
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => handleDeleteClick(item)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  };

  const renderViewToggle = (
    currentView: "grid" | "list",
    onChange: (view: "grid" | "list") => void
  ) => (
    <div className="flex space-x-2">
      <Button
        size="xs"
        color={currentView === "grid" ? "info" : "gray"}
        onClick={() => onChange("grid")}
      >
        <HiViewGrid className="h-4 w-4" />
      </Button>
      <Button
        size="xs"
        color={currentView === "list" ? "info" : "gray"}
        onClick={() => onChange("list")}
      >
        <HiViewList className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="flex-1 ml-8">
        <Tabs>
          <Tabs.Item active title="Productos">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <TextInput
                  icon={HiOutlineSearch}
                  placeholder="Buscar productos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <Select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="ropa">Ropa</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="calzado">Calzado</option>
                </Select>
                <Select
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="draft">Borrador</option>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                {renderViewToggle(viewMode, setViewMode)}
                <Button onClick={() => handleAdd("product")}>
                  <HiPlus className="mr-2 h-5 w-5" />
                  Nuevo Producto
                </Button>
              </div>
            </div>
            {viewMode === "grid" ? renderGridView("product") : renderListView("product")}
          </Tabs.Item>
          <Tabs.Item title="Servicios">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <TextInput
                  icon={HiOutlineSearch}
                  placeholder="Buscar servicios..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
                <Select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="consultoria">Consultoría</option>
                  <option value="capacitacion">Capacitación</option>
                  <option value="asesoramiento">Asesoramiento</option>
                </Select>
                <Select
                  value={serviceStatus}
                  onChange={(e) => setServiceStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="draft">Borrador</option>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                {renderViewToggle(servicesViewMode, setServicesViewMode)}
                <Button onClick={() => handleAdd("service")}>
                  <HiPlus className="mr-2 h-5 w-5" />
                  Nuevo Servicio
                </Button>
              </div>
            </div>
            {servicesViewMode === "grid"
              ? renderGridView("service")
              : renderListView("service")}
          </Tabs.Item>
        </Tabs>

        <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
          <Modal.Header>
            {itemToEdit
              ? `Editar ${formType === "product" ? "Producto" : "Servicio"}`
              : `Nuevo ${formType === "product" ? "Producto" : "Servicio"}`}
          </Modal.Header>
          <Modal.Body>
            <ProductServiceForm
              type={formType}
              initialData={itemToEdit ? {
                _id: itemToEdit._id,
                name: itemToEdit.name,
                description: itemToEdit.description,
                category: itemToEdit.category,
                price: itemToEdit.price,
                status: itemToEdit.status,
                images: itemToEdit.images.filter(img => img.asset !== null) as (File | SanityImage)[],
                imagesPreviews: itemToEdit.images
                  .filter(img => img.asset !== null)
                  .map(img => 
                    `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${img.asset?._ref
                      .replace("image-", "")
                      .replace("-jpg", ".jpg")
                      .replace("-png", ".png")
                      .replace("-webp", ".webp")}`
                  ),
                ...(formType === "product"
                  ? { sku: (itemToEdit as SanityProductDocument).sku }
                  : {
                      duration: (itemToEdit as SanityServiceDocument).duration,
                      modality: (itemToEdit as SanityServiceDocument).modality,
                      availability: (itemToEdit as SanityServiceDocument).availability,
                    }),
              } : undefined}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              onCancel={() => setShowModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal show={showConfirmModal} onClose={handleCancelDelete} size="md">
          <Modal.Header>Confirmar eliminación</Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que deseas eliminar este elemento? Esta acción no
              se puede deshacer.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button color="failure" onClick={handleConfirmDelete}>
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}
