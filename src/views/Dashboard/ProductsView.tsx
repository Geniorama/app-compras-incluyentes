"use client";

import { Button, Tabs, TextInput, Label, Select, Spinner, Table, Modal } from "flowbite-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";
import { HiPlus, HiOutlineSearch, HiViewGrid, HiViewList } from "react-icons/hi";
import ProductServiceForm from "@/components/ProductServiceForm";
import toast from "react-hot-toast";

interface ProductServiceData {
    name: string;
    description: string;
    category: string;
    price: string;
    status: string;
    images: File[];
    imagesPreviews: string[];
    // Campos específicos para productos
    sku?: string;
    stock?: string;
    weight?: string;
    dimensions?: string;
    // Campos específicos para servicios
    duration?: string;
    modality?: string;
    availability?: string;
}

export default function ProductsView() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [servicesViewMode, setServicesViewMode] = useState<'grid' | 'list'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [formType, setFormType] = useState<'product' | 'service'>('product');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const handleAdd = (type: 'product' | 'service') => {
        setFormType(type);
        setShowModal(true);
    };

    const handleSubmit = async (data: ProductServiceData) => {
        setIsSubmitting(true);
        try {
            // Aquí iría la lógica para guardar en Sanity
            console.log('Datos a guardar:', data);
            toast.success(`${formType === 'product' ? 'Producto' : 'Servicio'} creado correctamente`);
            setShowModal(false);
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar los datos');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderGridView = (type: 'product' | 'service') => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">Imagen</span>
                </div>
                <h3 className="font-semibold mb-2">Nombre del {type === 'product' ? 'producto' : 'servicio'}</h3>
                <p className="text-sm text-gray-600 mb-2">Categoría: {type === 'product' ? 'Tecnología' : 'Consultoría'}</p>
                <p className="text-sm text-gray-600 mb-4">Estado: Activo</p>
                <div className="flex justify-end gap-2">
                    <Button size="xs" color="gray">Editar</Button>
                    <Button size="xs" color="failure">Eliminar</Button>
                </div>
            </div>
        </div>
    );

    const renderListView = (type: 'product' | 'service') => (
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
                    <Table.Row>
                        <Table.Cell>
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">Img</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell className="font-medium">
                            Nombre del {type === 'product' ? 'producto' : 'servicio'}
                        </Table.Cell>
                        <Table.Cell>
                            {type === 'product' ? 'Tecnología' : 'Consultoría'}
                        </Table.Cell>
                        <Table.Cell>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Activo
                            </span>
                        </Table.Cell>
                        <Table.Cell>
                            <div className="flex gap-2">
                                <Button size="xs" color="gray">Editar</Button>
                                <Button size="xs" color="failure">Eliminar</Button>
                            </div>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );

    const renderViewToggle = (currentView: 'grid' | 'list', onChange: (view: 'grid' | 'list') => void) => (
        <div className="w-full md:w-auto md:self-end">
            <div className="flex gap-2 justify-end">
                <Button
                    color={currentView === 'grid' ? 'blue' : 'gray'}
                    onClick={() => onChange('grid')}
                    size="sm"
                >
                    <HiViewGrid className="h-5 w-5" />
                </Button>
                <Button
                    color={currentView === 'list' ? 'blue' : 'gray'}
                    onClick={() => onChange('list')}
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
                    <h1 className="text-2xl font-bold">Gestión de Servicios y Productos</h1>
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
                                            />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <Label htmlFor="category">Categoría</Label>
                                            <Select id="category">
                                                <option value="">Todas las categorías</option>
                                                <option value="tecnologia">Tecnología</option>
                                                <option value="hogar">Hogar</option>
                                                <option value="oficina">Oficina</option>
                                            </Select>
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select id="status">
                                                <option value="">Todos los estados</option>
                                                <option value="active">Activo</option>
                                                <option value="inactive">Inactivo</option>
                                                <option value="draft">Borrador</option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 md:min-w-[200px]">
                                        {renderViewToggle(viewMode, setViewMode)}
                                        <Button color="blue" onClick={() => handleAdd('product')} className="flex-shrink-0">
                                            <HiPlus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {isLoadingData ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Spinner size="xl" />
                                    </div>
                                ) : (
                                    viewMode === 'grid' ? renderGridView('product') : renderListView('product')
                                )}
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
                                            />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <Label htmlFor="service-category">Categoría</Label>
                                            <Select id="service-category">
                                                <option value="">Todas las categorías</option>
                                                <option value="consultoria">Consultoría</option>
                                                <option value="desarrollo">Desarrollo</option>
                                                <option value="diseno">Diseño</option>
                                            </Select>
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <Label htmlFor="service-status">Estado</Label>
                                            <Select id="service-status">
                                                <option value="">Todos los estados</option>
                                                <option value="active">Activo</option>
                                                <option value="inactive">Inactivo</option>
                                                <option value="draft">Borrador</option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 md:min-w-[200px]">
                                        {renderViewToggle(servicesViewMode, setServicesViewMode)}
                                        <Button color="blue" onClick={() => handleAdd('service')} className="flex-shrink-0">
                                            <HiPlus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {isLoadingData ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Spinner size="xl" />
                                    </div>
                                ) : (
                                    servicesViewMode === 'grid' ? renderGridView('service') : renderListView('service')
                                )}
                            </div>
                        </Tabs.Item>
                    </Tabs>
                </div>

                <Modal
                    show={showModal}
                    size="4xl"
                    onClose={() => setShowModal(false)}
                >
                    <Modal.Header>
                        {formType === 'product' ? 'Agregar Producto' : 'Agregar Servicio'}
                    </Modal.Header>
                    <Modal.Body>
                        <ProductServiceForm
                            type={formType}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            isLoading={isSubmitting}
                        />
                    </Modal.Body>
                </Modal>
            </main>
        </div>
    );
} 