"use client";

import {
  Button,
  Tabs,
  TextInput,
  Label,
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
import { useEffect } from "react";
import { sanityClient } from "@/lib/sanity.client";

interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
}
interface ProductServiceData {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  images: File[];
  imagesPreviews: string[];
  // Campos específicos para productos
  sku?: string;
  // Campos específicos para servicios
  duration?: string;
  modality?: string;
  availability?: string;
}

interface SanityProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  sku?: string;
  images: SanityImage[];
  createdAt: string;
  updatedAt: string;
}

interface SanityService {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  status: string;
  duration?: string;
  modality?: string;
  availability?: string;
  images: SanityImage[];
  createdAt: string;
  updatedAt: string;
}

interface ProductsViewProps {
  initialData: {
    products: SanityProduct[];
    services: SanityService[];
  };
}

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
  const [products, setProducts] = useState<SanityProduct[]>(
    initialData.products
  );
  const [services, setServices] = useState<SanityService[]>(
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
    SanityProduct | SanityService | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para manejar la edición
  const [itemToEdit, setItemToEdit] = useState<SanityProduct | SanityService | null>(null);

  const handleAdd = (type: "product" | "service") => {
    setFormType(type);
    setShowModal(true);
  };

  const handleEdit = (item: SanityProduct | SanityService) => {
    if(!item) return;
    
    // Preparar los datos para el formulario
    const imagesPreviews = item.images.map(img => 
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
      images: item.images as any, // Pasar las imágenes de Sanity directamente
      imagesPreviews: imagesPreviews
    };
    
    // Agregar campos específicos según el tipo
    if (isProduct && 'sku' in item) {
      formData.sku = item.sku;
    } else if (!isProduct) {
      const serviceItem = item as SanityService;
      formData.duration = serviceItem.duration;
      formData.modality = serviceItem.modality;
      formData.availability = serviceItem.availability;
    }
    
    setItemToEdit(item);
    setShowModal(true);
  };

  const handleDeleteClick = (item: SanityProduct | SanityService) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      // Eliminar el elemento de Sanity
      await sanityClient.delete(itemToDelete._id);

      // Actualizar la lista local
      if ("sku" in itemToDelete) {
        // Es un producto
        setProducts((prev) =>
          prev.filter((product) => product._id !== itemToDelete._id)
        );
      } else {
        // Es un servicio
        setServices((prev) =>
          prev.filter((service) => service._id !== itemToDelete._id)
        );
      }

      toast.success(
        `${"sku" in itemToDelete ? "Producto" : "Servicio"} eliminado correctamente`
      );
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

  useEffect(() => {
    if (initialData.products.length > 0 || initialData.services.length > 0) {
      setProducts(initialData.products);
      setServices(initialData.services);
      console.log(
        "Productos y servicios iniciales cargados:",
        initialData.products,
        initialData.services
      );
    }
  }, [initialData]);

  const handleSubmit = async (data: ProductServiceData) => {
    if (!user) {
      toast.error("Debes iniciar sesión para crear un producto o servicio");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Subir imágenes a Sanity
      const uploadedImages = await Promise.all(
        data.images.map(async (file) => {
          // Si el archivo ya es un objeto de Sanity (tiene _type y asset), lo devolvemos tal cual
          if (typeof file === 'object' && file !== null && '_type' in file) {
            return file;
          }
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const base64Data = e.target?.result as string;
                const fileType = file.type.split("/")[1];

                console.log("Intentando subir imagen:", {
                  fileName: file.name,
                  fileType: fileType,
                  base64Length: base64Data.length,
                });

                const response = await fetch("/api/upload-image", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    file: base64Data,
                    fileType: fileType,
                  }),
                });

                const responseData = await response.json();

                if (!response.ok) {
                  throw new Error(
                    responseData.message ||
                      `Error al subir la imagen ${file.name}`
                  );
                }

                console.log("Imagen subida exitosamente:", file.name);
                resolve(responseData);
              } catch (error) {
                console.error("Error en la subida de imagen:", error);
                reject(new Error(`Error al subir la imagen ${file.name}`));
              }
            };
            reader.onerror = () => {
              console.error("Error al leer el archivo:", file.name);
              reject(new Error(`Error al leer el archivo ${file.name}`));
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Determinar si estamos creando o actualizando
      const isEditing = itemToEdit !== null;
      const endpoint = isEditing ? "/api/update-product-service" : "/api/create-product-service";
      
      // 2. Crear o actualizar el producto o servicio en Sanity
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formType,
          ...data,
          images: uploadedImages,
          userId: user.uid,
          ...(isEditing && { id: itemToEdit._id }) // Incluir ID si estamos editando
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el documento`);
      }

      const result = await response.json();

      // 3. Actualizar el estado local
      if (isEditing) {
        // Actualizar el elemento existente
        if (formType === "product") {
          setProducts(prev => 
            prev.map(item => item._id === itemToEdit._id ? result.data : item)
          );
        } else {
          setServices(prev => 
            prev.map(item => item._id === itemToEdit._id ? result.data : item)
          );
        }
        toast.success(`${formType === "product" ? "Producto" : "Servicio"} actualizado correctamente`);
      } else {
        // Agregar el nuevo elemento
        if (formType === "product") {
          setProducts(prev => [...prev, result.data]);
        } else {
          setServices(prev => [...prev, result.data]);
        }
        toast.success(`${formType === "product" ? "Producto" : "Servicio"} creado correctamente`);
      }
      
      // Limpiar el estado de edición y cerrar el modal
      setItemToEdit(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar los datos";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesCategory = productCategory
      ? product.category === productCategory
      : true;
    const matchesStatus = productStatus
      ? product.status === productStatus
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategory
      ? service.category === serviceCategory
      : true;
    const matchesStatus = serviceStatus
      ? service.status === serviceStatus
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderGridView = (type: "product" | "service") => {
    const items = type === "product" ? filteredProducts : filteredServices;

    return (
      <>
        {/* Modal de confirmación */}
        <Modal
          show={showConfirmModal}
          size="md"
          onClose={handleCancelDelete}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500">
                ¿Estás seguro de que deseas eliminar este{" "}
                {itemToDelete && "sku" in itemToDelete
                  ? "producto"
                  : "servicio"}
                ?
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  color="failure"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    "Sí, eliminar"
                  )}
                </Button>
                <Button color="gray" onClick={handleCancelDelete}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {item.images[0] ? (
                  <img
                    src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${item.images[0].asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp")}`}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </div>
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Categoría: {item.category}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Estado: {getStatusLabel(item.status)}
              </p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => handleEdit(item)} size="xs" color="gray">
                  Editar
                </Button>
                <Button
                  size="xs"
                  onClick={() => handleDeleteClick(item)}
                  color="failure"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderListView = (type: "product" | "service") => {
    const items = type === "product" ? filteredProducts : filteredServices;

    return (
      <>
        <Modal
          show={showConfirmModal}
          size="md"
          onClose={handleCancelDelete}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500">
                ¿Estás seguro de que deseas eliminar este{" "}
                {itemToDelete && "sku" in itemToDelete
                  ? "producto"
                  : "servicio"}
                ?
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  color="failure"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    "Sí, eliminar"
                  )}
                </Button>
                <Button color="gray" onClick={handleCancelDelete}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell className="w-[50px]">Imagen</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Categoría</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {items.map((item) => (
                <Table.Row key={item._id}>
                  <Table.Cell>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.images[0] ? (
                        <img
                          src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${item.images[0].asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp")}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Sin img</span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="font-medium">{item.name}</Table.Cell>
                  <Table.Cell>{item.category}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(item)} size="xs" color="gray">
                        Editar
                      </Button>
                      <Button onClick={() => handleDeleteClick(item)} size="xs" color="failure">
                        Eliminar
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </>
    );
  };

  const renderViewToggle = (
    currentView: "grid" | "list",
    onChange: (view: "grid" | "list") => void
  ) => (
    <div className="w-full md:w-auto md:self-end">
      <div className="flex gap-2 justify-end">
        <Button
          color={currentView === "grid" ? "blue" : "gray"}
          onClick={() => onChange("grid")}
          size="sm"
        >
          <HiViewGrid className="h-5 w-5" />
        </Button>
        <Button
          color={currentView === "list" ? "blue" : "gray"}
          onClick={() => onChange("list")}
          size="sm"
        >
          <HiViewList className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="w-3/3 xl:w-3/4 pl-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Gestión de Servicios y Productos
          </h1>
        </div>

        <div className="border-b border-gray-200">
          <Tabs className="!border-none">
            <Tabs.Item
              title="Productos"
              className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600"
            >
              <div className="mt-5">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="search">Buscar</Label>
                      <TextInput
                        id="search"
                        type="text"
                        icon={HiOutlineSearch}
                        placeholder="Buscar productos..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        id="category"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                      >
                        <option value="">Todas las categorías</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="hogar">Hogar</option>
                        <option value="oficina">Oficina</option>
                      </Select>
                    </div>
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        id="status"
                        value={productStatus}
                        onChange={(e) => setProductStatus(e.target.value)}
                      >
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="draft">Borrador</option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 md:min-w-[200px]">
                    {renderViewToggle(viewMode, setViewMode)}
                    <Button
                      color="blue"
                      onClick={() => handleAdd("product")}
                      className="flex-shrink-0"
                    >
                      <HiPlus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {viewMode === "grid"
                  ? renderGridView("product")
                  : renderListView("product")}
              </div>
            </Tabs.Item>

            <Tabs.Item
              title="Servicios"
              className="!p-4 data-[active=true]:!text-blue-600 data-[active=true]:!border-b-2 data-[active=true]:!border-blue-600"
            >
              <div className="mt-5">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="search-services">Buscar</Label>
                      <TextInput
                        id="search-services"
                        type="text"
                        icon={HiOutlineSearch}
                        placeholder="Buscar servicios..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="service-category">Categoría</Label>
                      <Select
                        id="service-category"
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                      >
                        <option value="">Todas las categorías</option>
                        <option value="consultoria">Consultoría</option>
                        <option value="desarrollo">Desarrollo</option>
                        <option value="diseno">Diseño</option>
                      </Select>
                    </div>
                    <div className="w-full md:w-1/3">
                      <Label htmlFor="service-status">Estado</Label>
                      <Select
                        id="service-status"
                        value={serviceStatus}
                        onChange={(e) => setServiceStatus(e.target.value)}
                      >
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="draft">Borrador</option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 md:min-w-[200px]">
                    {renderViewToggle(servicesViewMode, setServicesViewMode)}
                    <Button
                      color="blue"
                      onClick={() => handleAdd("service")}
                      className="flex-shrink-0"
                    >
                      <HiPlus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {servicesViewMode === "grid"
                  ? renderGridView("service")
                  : renderListView("service")}
              </div>
            </Tabs.Item>
          </Tabs>
        </div>

        <Modal show={showModal} size="4xl" onClose={() => {
          setShowModal(false);
          setItemToEdit(null); // Limpiar el estado de edición al cerrar
        }}>
          <Modal.Header>
            {itemToEdit 
              ? `Editar ${formType === "product" ? "Producto" : "Servicio"}`
              : `Agregar ${formType === "product" ? "Producto" : "Servicio"}`}
          </Modal.Header>
          <Modal.Body>
            <ProductServiceForm
              type={formType}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
              isLoading={isSubmitting}
              initialData={itemToEdit ? {
                name: itemToEdit.name,
                description: itemToEdit.description,
                category: itemToEdit.category,
                price: itemToEdit.price,
                status: itemToEdit.status,
                images: itemToEdit.images,
                imagesPreviews: itemToEdit.images.map(img => 
                  `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${img.asset._ref
                    .replace("image-", "")
                    .replace("-jpg", ".jpg")
                    .replace("-png", ".png")
                    .replace("-webp", ".webp")}`
                ),
                ...("sku" in itemToEdit ? { sku: itemToEdit.sku } : {}),
                ...(!("sku" in itemToEdit) ? {
                  duration: (itemToEdit as SanityService).duration,
                  modality: (itemToEdit as SanityService).modality,
                  availability: (itemToEdit as SanityService).availability
                } : {})
              } : undefined}
            />
          </Modal.Body>
        </Modal>
      </main>
    </div>
  );
}
