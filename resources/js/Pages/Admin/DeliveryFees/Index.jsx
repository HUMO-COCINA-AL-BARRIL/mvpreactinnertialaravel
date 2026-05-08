import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const initialValues = {
    name: '',
    price: '',
    description: '',
    is_active: true,
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

export default function DeliveryFeesIndex({ auth, deliveryFees = [] }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);
    const form = useForm(initialValues);

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        setEditingId(null);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            form.transform((data) => ({ ...data, _method: 'put' })).post(route('admin.delivery-fees.update', editingId), { onSuccess: resetForm });
            return;
        }
        form.post(route('admin.delivery-fees.store'), { onSuccess: resetForm });
    };

    const startEdit = (fee) => {
        setEditingId(fee.id);
        form.setData({
            name: fee.name,
            price: fee.price,
            description: fee.description || '',
            is_active: fee.is_active,
        });
    };

    const remove = (id) => {
        if (!window.confirm('¿Eliminar esta tarifa de domicilio?')) return;
        form.delete(route('admin.delivery-fees.destroy', id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-900">Tarifas de domicilio</h2>}>
            <Head title="Tarifas de domicilio" />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{flash.success}</div>}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">{editingId ? 'Editar tarifa' : 'Nueva tarifa'}</h3>
                        </div>
                        <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nombre de zona</label>
                                <input className="mt-1 w-full rounded-xl border-slate-300" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Valor</label>
                                <input type="number" min="0" className="mt-1 w-full rounded-xl border-slate-300" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Descripción</label>
                                <textarea rows={2} className="mt-1 w-full rounded-xl border-slate-300" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <SwitchButton checked={form.data.is_active} onChange={(value) => form.setData('is_active', value)} label="Activa" />
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Actualizar' : 'Crear'}</button>
                                {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Cancelar</button>}
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-900">Tarifas</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Zona</th>
                                        <th className="px-6 py-3 text-left">Valor</th>
                                        <th className="px-6 py-3 text-left">Estado</th>
                                        <th className="px-6 py-3 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveryFees.map((fee) => (
                                        <tr key={fee.id} className="border-t border-slate-100">
                                            <td className="px-6 py-3">{fee.name}</td>
                                            <td className="px-6 py-3">${new Intl.NumberFormat('es-CO').format(fee.price)}</td>
                                            <td className="px-6 py-3">{fee.is_active ? 'Activa' : 'Inactiva'}</td>
                                            <td className="px-6 py-3 flex gap-2">
                                                <button type="button" onClick={() => startEdit(fee)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">Editar</button>
                                                <button type="button" onClick={() => remove(fee.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Eliminar</button>
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
