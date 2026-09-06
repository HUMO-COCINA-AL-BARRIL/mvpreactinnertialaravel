import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageUploadField from '@/Components/ImageUploadField';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const initialValues = {
    name: '',
    description: '',
    sort_order: '',
    is_featured: false,
    is_active: true,
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

export default function AdminCategoriesIndex({ auth, categories = [] }) {
    const [editingId, setEditingId] = useState(null);
    const [preview, setPreview] = useState(null);
    const form = useForm(initialValues);
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
                form.post(route('admin.categories.update', editingId), {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Categoria actualizada correctamente.');
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error(Object.values(errors)[0] || 'No se pudo actualizar la categoria.');
                    },
                });
                return;
            }

            form.put(route('admin.categories.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Categoria actualizada correctamente.');
                    resetForm();
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] || 'No se pudo actualizar la categoria.');
                },
            });
            return;
        }

        form.transform((data) => data);
        form.post(route('admin.categories.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Categoria creada correctamente.');
                resetForm();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo crear la categoria.');
            },
        });
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setPreview(category.image_url || null);
        form.setData({
            name: category.name,
            description: category.description || '',
            sort_order: category.sort_order ?? '',
            is_featured: category.is_featured,
            is_active: category.is_active,
            image: null,
        });
    };

    const removeCategory = (category) => {
        if (!window.confirm(`Eliminar la categoria "${category.name}"?`)) return;

        form.delete(route('admin.categories.destroy', category.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Categoria eliminada correctamente.');
                if (editingId === category.id) {
                    resetForm();
                }
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo eliminar la categoria.');
            },
        });
    };

    const clearImage = () => {
        form.setData('image', null);

        if (editingId) {
            const editingCategory = categories.find((category) => category.id === editingId);
            setPreview(editingCategory?.image_url || null);
            return;
        }

        setPreview(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-900 leading-tight">Categorias</h2>}
        >
            <Head title="Categorias" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">{editingId ? 'Editar categoria' : 'Nueva categoria'}</h3>
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nombre</label>
                                <input className="mt-1 w-full rounded-xl border-slate-300" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Orden</label>
                                <input type="number" min="0" className="mt-1 w-full rounded-xl border-slate-300" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                                <p className="mt-1 text-xs text-slate-500">Si lo dejas vacio, se asigna automaticamente.</p>
                                {form.errors.sort_order && <p className="mt-1 text-sm text-red-600">{form.errors.sort_order}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                                <textarea className="mt-1 w-full rounded-xl border-slate-300" rows={3} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <ImageUploadField
                                    label="Imagen de fondo de la categoría"
                                    preview={preview}
                                    fileName={selectedImageName}
                                    error={form.errors.image}
                                    helpText="Se muestra como fondo de la tarjeta en el inicio. Usa una foto horizontal JPG, PNG o WEBP de hasta 4 MB."
                                    currentText="Usando imagen actual de la categoria."
                                    onFileChange={(file) => {
                                        form.setData('image', file);
                                        setPreview(file ? URL.createObjectURL(file) : preview);
                                    }}
                                    onClear={clearImage}
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-wrap gap-6">
                                <SwitchButton checked={form.data.is_active} onChange={(value) => form.setData('is_active', value)} label="Activa" />
                                <SwitchButton checked={form.data.is_featured} onChange={(value) => form.setData('is_featured', value)} label="Destacada" />
                            </div>

                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70" disabled={form.processing}>
                                    {editingId ? 'Actualizar categoria' : 'Crear categoria'}
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
                            <h3 className="font-semibold text-slate-900">Listado de categorias</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">Categoria</th>
                                        <th className="px-6 py-3 text-left font-medium">Orden</th>
                                        <th className="px-6 py-3 text-left font-medium">Productos</th>
                                        <th className="px-6 py-3 text-left font-medium">Estado</th>
                                        <th className="px-6 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-t border-slate-100">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    {category.image_url && <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded-lg object-cover" />}
                                                    <span className="font-medium text-slate-900">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-700">{category.sort_order}</td>
                                            <td className="px-6 py-3 text-slate-700">{category.products_count}</td>
                                            <td className="px-6 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {category.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => startEdit(category)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                                        Editar
                                                    </button>
                                                    <button type="button" onClick={() => removeCategory(category)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
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
