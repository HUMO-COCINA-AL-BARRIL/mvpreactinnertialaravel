import PublicLayout from '@/Layouts/PublicLayout';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SeoHead from '@/Components/SeoHead';

export default function ReservationCreate({
    occasionOptions = [],
    reservationSettings,
    defaultReservationDate,
    availableTimeSlots = [],
}) {
    const form = useForm({
        name: '',
        phone: '',
        reservation_date: defaultReservationDate || '',
        reservation_time: '',
        people_count: 2,
        occasion: 'otro',
        notes: '',
    });
    const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const fetchAvailability = async (date) => {
        if (!date) {
            setTimeSlots([]);
            return;
        }

        setLoadingSlots(true);

        try {
            const response = await fetch(`${route('reservation.availability')}?${new URLSearchParams({ date })}`);
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
            fetchAvailability(form.data.reservation_date);
        }
    }, [form.data.reservation_date, defaultReservationDate]);

    useEffect(() => {
        if (!form.data.reservation_time) return;

        const selectedSlot = timeSlots.find((slot) => slot.value === form.data.reservation_time);
        if (!selectedSlot || selectedSlot.remaining_capacity < Number(form.data.people_count || 0)) {
            form.setData('reservation_time', '');
        }
    }, [form.data.people_count, form.data.reservation_time, timeSlots]);

    const submit = (event) => {
        event.preventDefault();

        form.post(route('reservation.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <SeoHead
                title="Reservas"
                description="Reserva tu mesa en HUMO Cocina al Barril en Manizales. Consulta horarios disponibles, capacidad y confirma tu visita online."
                canonical={route('reservation.create')}
                image="/images/humo_hero.png"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'FoodEstablishmentReservation',
                    name: 'Reservas HUMO Cocina al Barril',
                    reservationFor: {
                        '@type': 'Restaurant',
                        name: 'HUMO Cocina al Barril',
                    },
                    url: route('reservation.create'),
                }}
            />

            <PublicLayout>
                <section className="bg-[radial-gradient(circle_at_top,#2a2113_0%,#111111_30%,#050505_100%)] py-14">
                    <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                                Reserva tu mesa
                            </span>
                            <h1 className="mt-5 text-4xl font-black tracking-tight">Planea tu visita a HUMO</h1>
                            <p className="mt-4 text-base leading-7 text-white/75">
                                Ahora las reservas usan cupo por bloque horario para evitar solapes y mostrarte solo opciones viables.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Cupo total</p>
                                    <p className="mt-2 text-2xl font-black text-amber-300">{reservationSettings.capacity_total} personas</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Duracion por reserva</p>
                                    <p className="mt-2 text-2xl font-black text-amber-300">{reservationSettings.reservation_duration_minutes} min</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Intervalo de agenda</p>
                                    <p className="mt-2 text-2xl font-black text-amber-300">{reservationSettings.slot_interval_minutes} min</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Horario</p>
                                    <p className="mt-2 text-2xl font-black text-amber-300">{reservationSettings.open_time} - {reservationSettings.close_time}</p>
                                </div>
                            </div>

                            <div className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-amber-400/10 p-5">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Como funciona</p>
                                <p className="mt-3 text-sm leading-6 text-white/75">
                                    Elegimos bloques con capacidad disponible y volvemos a validar al enviar, asi evitamos cruces entre reservas.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="rounded-[2rem] border border-black/5 bg-white p-8 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Datos de la reserva</h2>
                                    <p className="mt-2 text-sm text-slate-500">Completa el formulario y elige un horario con cupo disponible.</p>
                                </div>
                                <Link href={route('landing')} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Volver
                                </Link>
                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Nombre completo</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                    />
                                    {form.errors.name && <p className="mt-2 text-sm text-rose-600">{form.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Telefono</label>
                                    <div className="phone-field">
                                        <PhoneInput
                                            country="co"
                                            value={form.data.phone}
                                            onChange={(value) => form.setData('phone', value ? `+${value}` : '')}
                                            inputClass="!h-[52px]"
                                            buttonClass="!border-0"
                                            containerClass="!mt-0"
                                            dropdownClass="!text-slate-900"
                                            enableSearch
                                            searchPlaceholder="Buscar pais"
                                            inputProps={{ name: 'phone', required: true }}
                                        />
                                    </div>
                                    {form.errors.phone && <p className="mt-2 text-sm text-rose-600">{form.errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Personas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={reservationSettings.capacity_total}
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.people_count}
                                        onChange={(event) => form.setData('people_count', event.target.value)}
                                    />
                                    {form.errors.people_count && <p className="mt-2 text-sm text-rose-600">{form.errors.people_count}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Fecha</label>
                                    <input
                                        type="date"
                                        min={defaultReservationDate}
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.reservation_date}
                                        onChange={(event) => form.setData('reservation_date', event.target.value)}
                                    />
                                    {form.errors.reservation_date && <p className="mt-2 text-sm text-rose-600">{form.errors.reservation_date}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">Hora disponible</label>
                                    <select
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.reservation_time}
                                        onChange={(event) => form.setData('reservation_time', event.target.value)}
                                        disabled={!form.data.reservation_date || loadingSlots}
                                    >
                                        <option value="">
                                            {loadingSlots ? 'Cargando horarios...' : 'Selecciona un horario'}
                                        </option>
                                        {timeSlots.map((slot) => {
                                            const disabled = slot.remaining_capacity < Number(form.data.people_count || 0);

                                            return (
                                                <option key={slot.value} value={slot.value} disabled={disabled}>
                                                    {slot.label} {disabled ? '- sin cupo suficiente' : `- ${slot.remaining_capacity} cupos`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Solo mostramos cupos que pueden alojar a tu grupo dentro del aforo disponible.
                                    </p>
                                    {form.errors.reservation_time && <p className="mt-2 text-sm text-rose-600">{form.errors.reservation_time}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Ocasion</label>
                                    <select
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.occasion}
                                        onChange={(event) => form.setData('occasion', event.target.value)}
                                    >
                                        {occasionOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.occasion && <p className="mt-2 text-sm text-rose-600">{form.errors.occasion}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Notas</label>
                                    <textarea
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
                                        value={form.data.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                    />
                                    {form.errors.notes && <p className="mt-2 text-sm text-rose-600">{form.errors.notes}</p>}
                                </div>
                            </div>

                            {timeSlots.length === 0 && form.data.reservation_date && !loadingSlots && (
                                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    No hay bloques configurados o ya no queda disponibilidad para esa fecha.
                                </div>
                            )}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex justify-center rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {form.processing ? 'Guardando reserva...' : 'Confirmar reserva'}
                                </button>
                                <Link href={route('menu.index')} className="inline-flex justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Ver menu primero
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
