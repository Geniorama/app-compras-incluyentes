"use client";

import { useState, useEffect, useRef } from "react";
import { Label, TextInput, Button, Select, Textarea, FileInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import type { SanityCategoryDocument } from "@/types/sanity";

interface ProductServiceData {
    _id?: string;           // ID para edición
    name: string;           // Obligatorio
    description?: string;   // Opcional
    category: string[];     // Cambiado de SanityCategoryDocument[] a string[]
    price?: number;        // Opcional
    status: string;        // Obligatorio
    images: (File | SanityImage)[];        // Obligatorio (al menos 1) - puede ser File[] o SanityImage[]
    imagesPreviews: string[];
    // Campos específicos para productos
    sku?: string;
    // Campos específicos para servicios
    duration?: string;
    modality?: string;
    availability?: string;
}

interface SanityImage {
    _type: string;
    asset: {
        _ref: string;
        _type: string;
    };
}

interface ProductServiceFormProps {
    type: 'product' | 'service';
    onSubmit: (data: ProductServiceData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: Partial<ProductServiceData>; // Datos iniciales para editar
    categories: SanityCategoryDocument[];
}

export default function ProductServiceForm({ type, onSubmit, onCancel, isLoading = false, initialData, categories }: ProductServiceFormProps) {
    const [images, setImages] = useState<(File | SanityImage)[]>([]);
    const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
    const [prevData, setPrevData] = useState<Partial<ProductServiceData>>({
        name: '',
        description: '',
        category: [],
        price: undefined,
        status: 'draft',
        sku: '',
        duration: '',
        modality: '',
        availability: ''
    });
    const [categoryInput, setCategoryInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductServiceData>({
        defaultValues: prevData
    });

    const handleCancel = () => {
        // Limpiar el estado del formulario
        setImages([]);
        setImagesPreviews([]);
        setPrevData({
            name: '',
            description: '',
            category: [],
            price: undefined,
            status: 'draft',
            sku: '',
            duration: '',
            modality: '',
            availability: ''
        });
        reset({
            name: '',
            description: '',
            category: [],
            price: undefined,
            status: 'draft',
            sku: '',
            duration: '',
            modality: '',
            availability: ''
        });
        onCancel();
    };

    useEffect(() => {
        if (initialData) {
            // Actualizar el estado de las imágenes
            setImages(initialData.images || []);
            setImagesPreviews(initialData.imagesPreviews || []);
            
            // Actualizar el estado previo
            setPrevData(initialData);
            
            // Resetear el formulario con los nuevos valores
            reset({
                name: initialData.name || '',
                description: initialData.description || '',
                category: initialData.category || [],
                price: initialData.price,
                status: initialData.status || 'draft',
                sku: initialData.sku || '',
                duration: initialData.duration || '',
                modality: initialData.modality || '',
                availability: initialData.availability || ''
            });
        } else {
            // Si no hay datos iniciales, resetear a valores vacíos
            setImages([]);
            setImagesPreviews([]);
            setPrevData({
                name: '',
                description: '',
                category: [],
                price: undefined,
                status: 'draft',
                sku: '',
                duration: '',
                modality: '',
                availability: ''
            });
            reset({
                name: '',
                description: '',
                category: [],
                price: undefined,
                status: 'draft',
                sku: '',
                duration: '',
                modality: '',
                availability: ''
            });
        }
    }, [initialData, reset]);

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

    const selectedCategoryIds = prevData.category || [];
    const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat._id));
    const filteredSuggestions = categories.filter(
        cat =>
            !selectedCategoryIds.includes(cat._id) &&
            cat.name.toLowerCase().includes(categoryInput.toLowerCase())
    );

    const handleAddCategory = (catId: string) => {
        const newCategories = [...selectedCategoryIds, catId];
        setPrevData(prev => ({ ...prev, category: newCategories }));
        setCategoryInput("");
        setShowSuggestions(false);
        // Actualiza solo el campo category en react-hook-form
        setValue("category", newCategories);
    };

    const handleRemoveCategory = (catId: string) => {
        const newCategories = selectedCategoryIds.filter(id => id !== catId);
        setPrevData(prev => ({ ...prev, category: newCategories }));
        // Actualiza solo el campo category en react-hook-form
        setValue("category", newCategories);
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
                    <div className="md:col-span-2">
                        <Label htmlFor="name" className="flex items-center">
                            Nombre <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <TextInput
                            id="name"
                            {...register("name", { required: "El nombre es obligatorio" })}
                            placeholder={`Nombre del ${type === 'product' ? 'producto' : 'servicio'}`}
                            defaultValue={prevData.name}
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>

                    <div className="md:col-span-2">
                        <Label className="flex items-center">
                            Categorías <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                            {selectedCategories.map(cat => (
                                <span key={cat._id} className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-200">
                                    {cat.name}
                                    <button
                                        type="button"
                                        className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                                        onClick={() => handleRemoveCategory(cat._id)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <TextInput
                                ref={inputRef}
                                placeholder="Buscar y agregar categoría..."
                                value={categoryInput}
                                onChange={e => {
                                    setCategoryInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                    {filteredSuggestions.map(cat => (
                                        <li
                                            key={cat._id}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700"
                                            onMouseDown={() => handleAddCategory(cat._id)}
                                        >
                                            {cat.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* Campo oculto para react-hook-form */}
                        <input type="hidden" {...register("category", { required: "La categoría es obligatoria" })} value={selectedCategoryIds.join(",")}/>
                        {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder={`Describe el ${type === 'product' ? 'producto' : 'servicio'}`}
                            rows={4}
                            defaultValue={prevData.description}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price">Precio</Label>
                        <TextInput
                            id="price"
                            type="number"
                            {...register("price")}
                            placeholder="0.00"
                            defaultValue={prevData.price}
                        />
                    </div>

                    <div>
                        <Label htmlFor="status" className="flex items-center">
                            Estado <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            id="status"
                            {...register("status", { required: "El estado es obligatorio" })}
                            defaultValue={prevData.status}
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
                                    defaultValue={prevData.sku}
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
                                    defaultValue={prevData.duration}
                                />
                            </div>
                            <div>
                                <Label htmlFor="modality">Modalidad</Label>
                                <Select
                                    id="modality"
                                    {...register("modality")}
                                    defaultValue={prevData.modality}
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
                                    defaultValue={prevData.availability}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button color="gray" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button type="submit" isProcessing={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
