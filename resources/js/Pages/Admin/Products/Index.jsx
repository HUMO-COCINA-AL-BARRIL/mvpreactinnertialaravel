import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageUploadField from '@/Components/ImageUploadField';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const initialValues = {
    category_id: '',
    name: '',
    short_description: '',
    description: '',
    price: '',
    stock: '',
    is_available: true,
    is_featured: false,
    image: null,
};

function SwitchButton({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="inline-flex items-center gap-3"
        >
            <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
            </span>
            <span className="text-sm text-slate-700">{label}</span>
        </button>
    );
}

export default function AdminProductsIndex({ auth, products = [], categories = [] }) {
    const [editingId, setEditingId] = useState(null);
    const [preview, setPreview] = useState(null);

    const form = useForm(initialValues);
    const currency = useMemo(() => new Intl.NumberFormat('es-CO'), []);
    const selectedImageName = form.data.image?.name || null;

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.transform((data) => data);
        setEditingId(null);
        setPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingId) {
            if (form.data.image) {
                form.transform((data) => ({ ...data, _method: 'put' }));
                form.post(route('admin.products.update', editingId), {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Producto actualizado correctamente.');
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error(Object.values(errors)[0] || 'No se pudo actualizar el producto.');
                    },
                });
                return;
            }

            form.put(route('admin.products.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Producto actualizado correctamente.');
                    resetForm();
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] || 'No se pudo actualizar el producto.');
                },
            });
            return;
        }

        form.transform((data) => data);
        form.post(route('admin.products.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Producto creado correctamente.');
                resetForm();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo crear el producto.');
            },
        });
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setPreview(product.image_url || product.image || null);
        form.setData({
            category_id: product.category_id,
            name: product.name,
            short_description: product.short_description || '',
            description: product.description || '',
            price: product.price,
            stock: product.stock ?? '',
            is_available: product.is_available,
            is_featured: product.is_featured,
            image: null,
        });
    };

    const removeProduct = (id) => {
        if (!window.confirm('Eliminar este producto?')) return;

        form.delete(route('admin.products.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Producto eliminado correctamente.');
                if (editingId === id) {
                    resetForm();
                }
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo eliminar el producto.');
            },
        });
    };

    const clearImage = () => {
        form.setData('image', null);

        if (editingId) {
            const editingProduct = products.find((product) => product.id === editingId);
            setPreview(editingProduct?.image_url || editingProduct?.image || null);
            return;
        }

        setPreview(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-900 leading-tight">Productos</h2>}
        >
            <Head title="Productos" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Categoria</label>
                                <select
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                    value={form.data.category_id}
                                    onChange={(e) => form.setData('category_id', e.target.value)}
                                >
                                    <option value="">Selecciona una categoria</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.category_id && <p className="mt-1 text-sm text-red-600">{form.errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Nombre</label>
                                <input className="mt-1 w-full rounded-xl border-slate-300" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Precio</label>
                                <input type="number" min="0" className="mt-1 w-full rounded-xl border-slate-300" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                                {form.errors.price && <p className="mt-1 text-sm text-red-600">{form.errors.price}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Stock</label>
                                <input type="number" min="0" className="mt-1 w-full rounded-xl border-slate-300" value={form.data.stock} onChange={(e) => form.setData('stock', e.target.value)} />
                                <p className="mt-1 text-xs text-slate-500">0 significa venta sobre pedido y aun se puede comprar.</p>
                                {form.errors.stock && <p className="mt-1 text-sm text-red-600">{form.errors.stock}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Descripcion corta</label>
                                <input className="mt-1 w-full rounded-xl border-slate-300" value={form.data.short_description} onChange={(e) => form.setData('short_description', e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Descripcion completa</label>
                                <textarea className="mt-1 w-full rounded-xl border-slate-300" rows={3} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <ImageUploadField
                                    label="Imagen"
                                    preview={preview}
                                    fileName={selectedImageName}
                                    error={form.errors.image}
                                    helpText="Formatos sugeridos: JPG, PNG o WEBP. Una imagen clara mejora la presentacion del menu."
                                    currentText="Usando imagen actual del producto."
                                    onFileChange={(file) => {
                                        form.setData('image', file);
                                        setPreview(file ? URL.createObjectURL(file) : preview);
                                    }}
                                    onClear={clearImage}
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-wrap gap-6">
                                <SwitchButton checked={form.data.is_available} onChange={(value) => form.setData('is_available', value)} label="Disponible" />
                                <SwitchButton checked={form.data.is_featured} onChange={(value) => form.setData('is_featured', value)} label="Destacado" />
                            </div>

                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70" disabled={form.processing}>
                                    {editingId ? 'Actualizar producto' : 'Crear producto'}
                                </button>
                                {editingId && (
                                    <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">Listado de productos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">Producto</th>
                                        <th className="px-6 py-3 text-left font-medium">Categoria</th>
                                        <th className="px-6 py-3 text-left font-medium">Precio</th>
                                        <th className="px-6 py-3 text-left font-medium">Estado</th>
                                        <th className="px-6 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-t border-slate-100">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.image_url && <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />}
                                                    <span className="font-medium text-slate-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600">{product.category?.name || 'Sin categoria'}</td>
                                            <td className="px-6 py-3 text-slate-900">${currency.format(product.price)}</td>
                                            <td className="px-6 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {product.is_available ? 'Disponible' : 'No disponible'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => startEdit(product)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                                        Editar
                                                    </button>
                                                    <button type="button" onClick={() => removeProduct(product.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
