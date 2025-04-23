"use client";

import { useState } from "react";
import { Label, TextInput, Button, Select, Textarea, FileInput } from "flowbite-react";

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

interface ProductServiceFormProps {
    type: 'product' | 'service';
    onSubmit: (data: ProductServiceData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ProductServiceForm({ type, onSubmit, onCancel, isLoading = false }: ProductServiceFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        status: 'draft',
        images: [] as File[],
        imagesPreviews: [] as string[],
        // Campos específicos para productos
        sku: '',
        stock: '',
        weight: '',
        dimensions: '',
        // Campos específicos para servicios
        duration: '',
        modality: '',
        availability: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(file => URL.createObjectURL(file));
        
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files],
            imagesPreviews: [...prev.imagesPreviews, ...previews]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            imagesPreviews: prev.imagesPreviews.filter((_, i) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <div>
                    <Label htmlFor="images">Imágenes</Label>
                    <div className="mt-2">
                        <div className="flex flex-wrap gap-4 mb-4">
                            {formData.imagesPreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <FileInput
                            id="images"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            helperText="PNG, JPG o WEBP (MAX. 800x800px)"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nombre</Label>
                        <TextInput
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder={`Nombre del ${type === 'product' ? 'producto' : 'servicio'}`}
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                            id="category"
                            required
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                        >
                            <option value="">Seleccionar categoría</option>
                            {type === 'product' ? (
                                <>
                                    <option value="tecnologia">Tecnología</option>
                                    <option value="hogar">Hogar</option>
                                    <option value="oficina">Oficina</option>
                                </>
                            ) : (
                                <>
                                    <option value="consultoria">Consultoría</option>
                                    <option value="desarrollo">Desarrollo</option>
                                    <option value="diseno">Diseño</option>
                                </>
                            )}
                        </Select>
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            required
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder={`Describe el ${type === 'product' ? 'producto' : 'servicio'}`}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price">Precio</Label>
                        <TextInput
                            id="price"
                            required
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="status">Estado</Label>
                        <Select
                            id="status"
                            required
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            <option value="draft">Borrador</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </Select>
                    </div>

                    {type === 'product' ? (
                        // Campos específicos para productos
                        <>
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <TextInput
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleChange('sku', e.target.value)}
                                    placeholder="ABC123"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stock">Stock</Label>
                                <TextInput
                                    id="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleChange('stock', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <TextInput
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    value={formData.weight}
                                    onChange={(e) => handleChange('weight', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dimensions">Dimensiones (cm)</Label>
                                <TextInput
                                    id="dimensions"
                                    value={formData.dimensions}
                                    onChange={(e) => handleChange('dimensions', e.target.value)}
                                    placeholder="largo x ancho x alto"
                                />
                            </div>
                        </>
                    ) : (
                        // Campos específicos para servicios
                        <>
                            <div>
                                <Label htmlFor="duration">Duración</Label>
                                <TextInput
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) => handleChange('duration', e.target.value)}
                                    placeholder="Ej: 2 horas"
                                />
                            </div>
                            <div>
                                <Label htmlFor="modality">Modalidad</Label>
                                <Select
                                    id="modality"
                                    value={formData.modality}
                                    onChange={(e) => handleChange('modality', e.target.value)}
                                >
                                    <option value="">Seleccionar modalidad</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="virtual">Virtual</option>
                                    <option value="hibrido">Híbrido</option>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="availability">Disponibilidad</Label>
                                <TextInput
                                    id="availability"
                                    value={formData.availability}
                                    onChange={(e) => handleChange('availability', e.target.value)}
                                    placeholder="Ej: Lunes a Viernes, 9am - 6pm"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button color="gray" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" isProcessing={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
} 