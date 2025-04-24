"use client";

import { useState } from "react";
import { Label, TextInput, Button, Select, Textarea, FileInput } from "flowbite-react";
import { useForm } from "react-hook-form";

interface ProductServiceData {
    name: string;           // Obligatorio
    description?: string;   // Opcional
    category: string;       // Obligatorio
    price?: string;        // Opcional
    status: string;        // Obligatorio
    images: File[];        // Obligatorio (al menos 1)
    imagesPreviews: string[];
    // Campos específicos para productos
    sku?: string;
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
    const [images, setImages] = useState<File[]>([]);
    const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm<ProductServiceData>({
        defaultValues: {
            name: '',
            description: '',
            category: '',
            price: '',
            status: 'draft',
            sku: '',
            duration: '',
            modality: '',
            availability: ''
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(file => URL.createObjectURL(file));
        
        setImages(prev => [...prev, ...files]);
        setImagesPreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmitForm = (data: ProductServiceData) => {
        if (images.length === 0) {
            alert('Debes subir al menos una imagen');
            return;
        }
        onSubmit({
            ...data,
            images,
            imagesPreviews
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="space-y-6">
                <div>
                    <Label htmlFor="images" className="flex items-center">
                        Imágenes <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="mt-2">
                        <div className="flex flex-wrap gap-4 mb-4">
                            {imagesPreviews.map((preview, index) => (
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
                        {images.length === 0 && <span className="text-red-500 text-sm block mt-1">Se requiere al menos una imagen</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name" className="flex items-center">
                            Nombre <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <TextInput
                            id="name"
                            {...register("name", { required: "El nombre es obligatorio" })}
                            placeholder={`Nombre del ${type === 'product' ? 'producto' : 'servicio'}`}
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>

                    <div>
                        <Label htmlFor="category" className="flex items-center">
                            Categoría <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            id="category"
                            {...register("category", { required: "La categoría es obligatoria" })}
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
                        {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder={`Describe el ${type === 'product' ? 'producto' : 'servicio'}`}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price">Precio</Label>
                        <TextInput
                            id="price"
                            type="number"
                            {...register("price")}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="status" className="flex items-center">
                            Estado <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            id="status"
                            {...register("status", { required: "El estado es obligatorio" })}
                        >
                            <option value="draft">Borrador</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </Select>
                        {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
                    </div>

                    {type === 'product' ? (
                        // Campos específicos para productos
                        <>
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <TextInput
                                    id="sku"
                                    {...register("sku")}
                                    placeholder="ABC123"
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
                                    {...register("duration")}
                                    placeholder="Ej: 2 horas"
                                />
                            </div>
                            <div>
                                <Label htmlFor="modality">Modalidad</Label>
                                <Select
                                    id="modality"
                                    {...register("modality")}
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
                                    {...register("availability")}
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