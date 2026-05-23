import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const occasionLabels = {
    cumpleanos: 'Cumpleanos',
    aniversario: 'Aniversario',
    reunion_familiar: 'Reunion familiar',
    otro: 'Otro',
};

const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistio',
};

const statusStyles = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
    no_show: 'bg-slate-100 text-slate-700',
};

export default function ReservationsIndex({
    auth,
    reservations = [],
    reservationSettings,
    defaultReservationDate,
    availableTimeSlots = [],
}) {
    const [editingId, setEditingId] = useState(null);
    const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const form = useForm({
        name: '',
        phone: '',
        reservation_date: defaultReservationDate || '',
        reservation_time: '',
        people_count: 2,
        occasion: 'otro',
        notes: '',
        status: 'pending',
    });

    const settingsForm = useForm({
        capacity_total: reservationSettings.capacity_total,
        reservation_duration_minutes: reservationSettings.reservation_duration_minutes,
        slot_interval_minutes: reservationSettings.slot_interval_minutes,
        open_time: reservationSettings.open_time,
        close_time: reservationSettings.close_time,
    });

    const fetchAvailability = async (date, ignoreReservationId = null) => {
        if (!date) {
            setTimeSlots([]);
            return;
        }

        setLoadingSlots(true);

        try {
            const params = new URLSearchParams({ date });
            if (ignoreReservationId) {
                params.set('ignore_reservation_id', ignoreReservationId);
            }

            const response = await fetch(`${route('admin.reservations.availability')}?${params.toString()}`);
            const data = await response.json();
            setTimeSlots(data.slots || []);
        } catch {
            setTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (form.data.reservation_date && form.data.reservation_date !== defaultReservationDate) {
            fetchAvailability(form.data.reservation_date, editingId);
        }
    }, [defaultReservationDate, editingId, form.data.reservation_date]);

    useEffect(() => {
        if (!form.data.reservation_time) return;

        const selectedSlot = timeSlots.find((slot) => slot.value === form.data.reservation_time);
        if (!selectedSlot || selectedSlot.remaining_capacity < Number(form.data.people_count || 0)) {
            form.setData('reservation_time', '');
        }
    }, [form.data.people_count, form.data.reservation_time, timeSlots]);

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.defaults({
            name: '',
            phone: '',
            reservation_date: defaultReservationDate || '',
            reservation_time: '',
            people_count: 2,
            occasion: 'otro',
            notes: '',
            status: 'pending',
        });
        setEditingId(null);
        setTimeSlots(availableTimeSlots);
    };

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            form.put(route('admin.reservations.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Reserva actualizada correctamente.');
                    resetForm();
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] || 'No se pudo actualizar la reserva.');
                },
            });
            return;
        }

        form.post(route('admin.reservations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reserva creada correctamente.');
                resetForm();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo crear la reserva.');
            },
        });
    };

    const submitSettings = (event) => {
        event.preventDefault();

        settingsForm.patch(route('admin.reservations.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Configuracion de reservas actualizada correctamente.');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo actualizar la configuracion.');
            },
        });
    };

    const startEdit = (reservation) => {
        setEditingId(reservation.id);
        form.setData({
            name: reservation.name,
            phone: reservation.phone,
            reservation_date: reservation.reservation_date,
            reservation_time: reservation.reservation_time?.slice(0, 5) || '',
            people_count: reservation.people_count,
            occasion: reservation.occasion,
            notes: reservation.notes || '',
            status: reservation.status,
        });
        fetchAvailability(reservation.reservation_date, reservation.id);
    };

    const remove = (id) => {
        if (!window.confirm('Eliminar esta reserva?')) return;

        form.delete(route('admin.reservations.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reserva eliminada correctamente.');
                if (editingId === id) {
                    resetForm();
                }
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo eliminar la reserva.');
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-slate-900">Reservas</h2>}>
            <Head title="Reservas" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">Configuracion de reservas</h3>
                            <p className="mt-1 text-sm text-slate-500">Ajusta aforo, duracion de reserva y bloques de agenda sin tocar codigo.</p>
                        </div>

                        <form onSubmit={submitSettings} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Capacidad total</label>
                                <input type="number" min="1" className="mt-1 w-full rounded-xl border-slate-300" value={settingsForm.data.capacity_total} onChange={(event) => settingsForm.setData('capacity_total', event.target.value)} />
                                {settingsForm.errors.capacity_total && <p className="mt-1 text-sm text-red-600">{settingsForm.errors.capacity_total}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Duracion</label>
                                <input type="number" min="30" className="mt-1 w-full rounded-xl border-slate-300" value={settingsForm.data.reservation_duration_minutes} onChange={(event) => settingsForm.setData('reservation_duration_minutes', event.target.value)} />
                                {settingsForm.errors.reservation_duration_minutes && <p className="mt-1 text-sm text-red-600">{settingsForm.errors.reservation_duration_minutes}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Intervalo</label>
                                <select className="mt-1 w-full rounded-xl border-slate-300" value={settingsForm.data.slot_interval_minutes} onChange={(event) => settingsForm.setData('slot_interval_minutes', event.target.value)}>
                                    {[15, 20, 30, 45, 60].map((value) => (
                                        <option key={value} value={value}>{value} min</option>
                                    ))}
                                </select>
                                {settingsForm.errors.slot_interval_minutes && <p className="mt-1 text-sm text-red-600">{settingsForm.errors.slot_interval_minutes}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Abre</label>
                                <input type="time" className="mt-1 w-full rounded-xl border-slate-300" value={settingsForm.data.open_time} onChange={(event) => settingsForm.setData('open_time', event.target.value)} />
                                {settingsForm.errors.open_time && <p className="mt-1 text-sm text-red-600">{settingsForm.errors.open_time}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Cierra</label>
                                <input type="time" className="mt-1 w-full rounded-xl border-slate-300" value={settingsForm.data.close_time} onChange={(event) => settingsForm.setData('close_time', event.target.value)} />
                                {settingsForm.errors.close_time && <p className="mt-1 text-sm text-red-600">{settingsForm.errors.close_time}</p>}
                            </div>
                            <div className="md:col-span-2 xl:col-span-5 flex gap-3">
                                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={settingsForm.processing}>
                                    Guardar configuracion
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-900">{editingId ? 'Editar reserva' : 'Nueva reserva'}</h3>
                            <p className="mt-1 text-sm text-slate-500">Las reservas pendientes y confirmadas bloquean capacidad para evitar solapes.</p>
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nombre</label>
                                <input className="mt-1 w-full rounded-xl border-slate-300" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Telefono</label>
                                <div className="phone-field phone-field-admin">
                                    <PhoneInput
                                        country="co"
                                        value={form.data.phone}
                                        onChange={(value) => form.setData('phone', value ? `+${value}` : '')}
                                        inputClass="!h-[42px]"
                                        buttonClass="!border-0"
                                        containerClass="!mt-0"
                                        dropdownClass="!text-slate-900"
                                        enableSearch
                                        searchPlaceholder="Buscar pais"
                                        inputProps={{ name: 'phone', required: true }}
                                    />
                                </div>
                                {form.errors.phone && <p className="mt-1 text-sm text-red-600">{form.errors.phone}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Fecha</label>
                                <input type="date" className="mt-1 w-full rounded-xl border-slate-300" value={form.data.reservation_date} onChange={(event) => form.setData('reservation_date', event.target.value)} />
                                {form.errors.reservation_date && <p className="mt-1 text-sm text-red-600">{form.errors.reservation_date}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Hora disponible</label>
                                <select className="mt-1 w-full rounded-xl border-slate-300" value={form.data.reservation_time} onChange={(event) => form.setData('reservation_time', event.target.value)} disabled={!form.data.reservation_date || loadingSlots}>
                                    <option value="">{loadingSlots ? 'Cargando horarios...' : 'Selecciona un horario'}</option>
                                    {timeSlots.map((slot) => {
                                        const disabled = slot.remaining_capacity < Number(form.data.people_count || 0);

                                        return (
                                            <option key={slot.value} value={slot.value} disabled={disabled}>
                                                {slot.label} {disabled ? '- sin cupo suficiente' : `- ${slot.remaining_capacity} cupos`}
                                            </option>
                                        );
                                    })}
                                </select>
                                {form.errors.reservation_time && <p className="mt-1 text-sm text-red-600">{form.errors.reservation_time}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Personas</label>
                                <input type="number" min="1" max={settingsForm.data.capacity_total} className="mt-1 w-full rounded-xl border-slate-300" value={form.data.people_count} onChange={(event) => form.setData('people_count', event.target.value)} />
                                {form.errors.people_count && <p className="mt-1 text-sm text-red-600">{form.errors.people_count}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Estado</label>
                                <select className="mt-1 w-full rounded-xl border-slate-300" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">Pendiente y confirmada consumen cupo. Cancelada y no asistio lo liberan.</p>
                                {form.errors.status && <p className="mt-1 text-sm text-red-600">{form.errors.status}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Ocasion</label>
                                <select className="mt-1 w-full rounded-xl border-slate-300" value={form.data.occasion} onChange={(event) => form.setData('occasion', event.target.value)}>
                                    {Object.entries(occasionLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.occasion && <p className="mt-1 text-sm text-red-600">{form.errors.occasion}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Notas</label>
                                <textarea rows={3} className="mt-1 w-full rounded-xl border-slate-300" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                                {form.errors.notes && <p className="mt-1 text-sm text-red-600">{form.errors.notes}</p>}
                            </div>

                            {timeSlots.length === 0 && form.data.reservation_date && !loadingSlots && (
                                <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    No hay bloques disponibles para esa fecha con la configuracion actual.
                                </div>
                            )}

                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={form.processing}>
                                    {editingId ? 'Actualizar reserva' : 'Crear reserva'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-900">Listado de reservas</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Cliente</th>
                                        <th className="px-6 py-3 text-left">Fecha</th>
                                        <th className="px-6 py-3 text-left">Personas</th>
                                        <th className="px-6 py-3 text-left">Ocasion</th>
                                        <th className="px-6 py-3 text-left">Estado</th>
                                        <th className="px-6 py-3 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((reservation) => (
                                        <tr key={reservation.id} className="border-t border-slate-100">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{reservation.name}</p>
                                                <p className="text-xs text-slate-500">{reservation.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {reservation.reservation_date} {reservation.reservation_time?.slice(0, 5)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{reservation.people_count}</td>
                                            <td className="px-6 py-4 text-slate-700">{occasionLabels[reservation.occasion] || reservation.occasion}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[reservation.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {statusLabels[reservation.status] || reservation.status}
                                                </span>
                                            </td>
                                            <td className="flex gap-2 px-6 py-4">
                                                <button type="button" onClick={() => startEdit(reservation)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">
                                                    Editar
                                                </button>
                                                <button type="button" onClick={() => remove(reservation.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reservations.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                                Aun no hay reservas registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
