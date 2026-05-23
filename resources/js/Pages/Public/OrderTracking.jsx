import SeoHead from '@/Components/SeoHead';
import PublicLayout from '@/Layouts/PublicLayout';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChefHat, Clock3, MapPinned, ReceiptText, Truck } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const statusLabels = {
    pending: 'Recibido',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const deliveryMethodLabels = {
    pickup: 'Recoger en local',
    dine_in: 'Consumir en sitio',
    delivery: 'Domicilio',
};

const paymentMethodLabels = {
    online: 'Online',
    cash: 'Efectivo',
    transfer: 'Transferencia',
};

const paymentStatusLabels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
};

const progressSteps = [
    { key: 'pending', label: 'Recibido', hint: 'Tu pedido ya entro al sistema', icon: ReceiptText },
    { key: 'confirmed', label: 'Confirmado', hint: 'El local valido la orden', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparando', hint: 'Estamos trabajando en tu pedido', icon: ChefHat },
    { key: 'ready', label: 'Listo', hint: 'Puede salir o entregarse pronto', icon: Clock3 },
    { key: 'delivered', label: 'Entregado', hint: 'Proceso completado', icon: Truck },
];

const money = (value) => `$${new Intl.NumberFormat('es-CO').format(value || 0)}`;

function ProgressTracker({ status }) {
    const activeIndex = progressSteps.findIndex((step) => step.key === status);
    const progressValue = activeIndex >= 0
        ? `${Math.round(((activeIndex + 1) / progressSteps.length) * 100)}%`
        : '0%';
    const currentStep = activeIndex >= 0 ? progressSteps[activeIndex] : progressSteps[0];

    if (status === 'cancelled') {
        return (
            <div className="rounded-[1.75rem] border border-rose-300/60 bg-[linear-gradient(135deg,#fff1f2_0%,#ffe4e6_100%)] p-6 text-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">TrackCheck</p>
                <h3 className="mt-3 text-2xl font-black text-rose-900">Pedido cancelado</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-800">
                    Esta orden ya no sigue en proceso. Si necesitas ayuda adicional, puedes responder al mensaje de WhatsApp de confirmacion.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">TrackCheck</p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-white">{currentStep.label}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">{currentStep.hint}</p>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Avance del pedido</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-white">{progressValue}</p>
                </div>
            </div>

            <div className="mt-7 h-4 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
                <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#fbbf24_36%,#a3e635_72%,#34d399_100%)] shadow-[0_0_30px_rgba(52,211,153,0.28)] transition-all duration-500"
                    style={{ width: progressValue }}
                />
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {progressSteps.map((step, index) => {
                    const completed = activeIndex >= index;
                    const current = activeIndex === index;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.key}
                            className={`rounded-[1.5rem] border px-4 py-4 transition ${
                                current
                                    ? 'border-amber-300 bg-[linear-gradient(145deg,rgba(245,158,11,0.22)_0%,rgba(251,191,36,0.12)_100%)] text-white shadow-[0_18px_40px_rgba(245,158,11,0.18)]'
                                    : completed
                                        ? 'border-emerald-400/25 bg-[linear-gradient(145deg,rgba(52,211,153,0.14)_0%,rgba(52,211,153,0.06)_100%)] text-emerald-100'
                                        : 'border-white/10 bg-black/20 text-neutral-500'
                            }`}
                        >
                            <div className="flex items-start gap-3 xl:flex-col xl:items-start">
                                <span
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl xl:h-12 xl:w-12 ${
                                        current
                                            ? 'bg-amber-400 text-black'
                                            : completed
                                                ? 'bg-emerald-400/20 text-emerald-200'
                                                : 'bg-white/5 text-neutral-500'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold leading-5">{step.label}</p>
                                    <p className={`mt-1 text-xs leading-5 text-pretty ${
                                        current ? 'text-amber-100' : completed ? 'text-emerald-100/90' : 'text-neutral-500'
                                    }`}>
                                        {step.hint}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function OrderTracking({ filters, order, searched }) {
    const { flash = {} } = usePage().props;
    const [form, setForm] = useState({
        order_number: filters.order_number || '',
        phone: filters.phone || '',
    });

    const notFound = searched && !order;
    const currentStatusLabel = useMemo(() => statusLabels[order?.status] || order?.status, [order]);
    const heroStatusCopy = useMemo(() => {
        switch (order?.status) {
        case 'pending':
            return 'Recibimos tu pedido y estamos validando los datos para arrancar el proceso.';
        case 'confirmed':
            return 'Tu pedido ya fue confirmado por el local y entrara a preparacion.';
        case 'preparing':
            return 'El equipo de HUMO ya esta preparando tu pedido.';
        case 'ready':
            return 'Tu pedido esta listo para entregar o para que lo recojas.';
        case 'delivered':
            return 'La orden ya fue completada. Gracias por pedir en HUMO.';
        case 'cancelled':
            return 'La orden fue cancelada. Revisa el motivo o responde por WhatsApp si necesitas ayuda.';
        default:
            return 'Consulta el progreso de tu pedido con una vista clara y confiable.';
        }
    }, [order?.status]);

    const submit = (event) => {
        event.preventDefault();
        router.get(route('orders.tracking'), form, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (!flash.clearCart || typeof window === 'undefined') {
            return;
        }

        localStorage.removeItem('cart_items');
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }));
    }, [flash.clearCart]);

    return (
        <>
            <SeoHead
                title="TrackCheck del pedido"
                description="Consulta el estado de tu pedido en HUMO Cocina al Barril con tu numero de orden y telefono."
                canonical={route('orders.tracking')}
                image="/images/humo_hero.png"
                robots="noindex,nofollow"
            />

            <PublicLayout>
                <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#261606_0%,#0d0d0d_34%,#050505_100%)] py-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.08),transparent_24%)]" />

                    <div className="relative mx-auto max-w-6xl px-6">
                        <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl">
                                    <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                                        TrackCheck
                                    </span>
                                    <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
                                        Seguimiento profesional de tu pedido
                                    </h1>
                                    <p className="mt-4 text-sm leading-7 text-neutral-300">
                                        {heroStatusCopy}
                                    </p>
                                </div>

                                {order && (
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Orden</p>
                                            <p className="mt-2 text-lg font-black text-white">{order.order_number}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Estado</p>
                                            <p className="mt-2 text-lg font-black text-white">{currentStatusLabel}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Total</p>
                                            <p className="mt-2 text-lg font-black text-white">{money(order.total)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
                            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)] xl:sticky xl:top-24 xl:self-start">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                                    Consulta segura
                                </p>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-white">Busca tu pedido</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-300">
                                    Usa el numero de orden y el telefono de la compra para abrir una vista confiable del proceso, similar a un tracker de delivery.
                                </p>

                                <form onSubmit={submit} className="mt-8 space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-white">Numero de orden</label>
                                        <input
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none placeholder:text-neutral-500 focus:border-amber-400/60"
                                            placeholder="Ej. HUMO-0004"
                                            value={form.order_number}
                                            onChange={(event) => setForm((current) => ({ ...current, order_number: event.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-white">Telefono</label>
                                        <div className="phone-field phone-field-dark">
                                            <PhoneInput
                                                country="co"
                                                value={form.phone.replace(/^\+/, '')}
                                                onChange={(value) => setForm((current) => ({ ...current, phone: `+${value}` }))}
                                                inputClass="!h-[48px]"
                                                buttonClass="!border-0"
                                                containerClass="!mt-0"
                                                dropdownClass="!text-white"
                                                enableSearch
                                                searchPlaceholder="Buscar pais"
                                                inputProps={{ name: 'phone', required: true }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-[linear-gradient(135deg,#f59e0b_0%,#fbbf24_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_18px_40px_rgba(245,158,11,0.3)] transition hover:-translate-y-0.5 hover:brightness-105"
                                    >
                                        Consultar seguimiento
                                    </button>
                                </form>

                                {notFound && (
                                    <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                                        No encontramos un pedido con esos datos. Revisa el numero de orden y el telefono.
                                    </div>
                                )}
                            </div>

                            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#171717_0%,#121212_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                                {!order ? (
                                    <div className="flex h-full min-h-[520px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 px-6 text-center">
                                        <div>
                                            <p className="text-lg font-semibold text-white">Tu tablero de seguimiento aparecera aqui</p>
                                            <p className="mt-2 text-sm leading-7 text-neutral-400">
                                                Cuando completes la busqueda veras el medidor, el progreso por etapas y el resumen operativo de tu orden.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_100%)] p-6">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Pedido localizado</p>
                                                    <h2 className="mt-3 text-4xl font-black tracking-tight text-white">{order.order_number}</h2>
                                                    <p className="mt-2 text-sm text-neutral-300">{order.customer_name}</p>
                                                    <p className="mt-1 text-xs text-neutral-500">{order.created_at_label}</p>
                                                </div>
                                                <div className="rounded-[1.5rem] border border-amber-300/30 bg-amber-400/15 px-5 py-4 shadow-[0_18px_40px_rgba(245,158,11,0.12)]">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">Estado reportado</p>
                                                    <p className="mt-2 text-lg font-black text-white">{currentStatusLabel}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <ProgressTracker status={order.status} />

                                        <div className="grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
                                            <div className="space-y-4">
                                                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                                                            <MapPinned className="h-5 w-5" />
                                                        </span>
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Entrega</p>
                                                            <p className="mt-3 text-sm font-semibold text-white">
                                                                {deliveryMethodLabels[order.delivery_method] || order.delivery_method}
                                                            </p>
                                                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                                                                {order.delivery_address || 'Sin direccion registrada para este tipo de pedido.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                                                            <ReceiptText className="h-5 w-5" />
                                                        </span>
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Pago</p>
                                                            <p className="mt-3 text-sm font-semibold text-white">
                                                                {paymentMethodLabels[order.payment_method] || order.payment_method}
                                                            </p>
                                                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                                                                Estado del pago: {paymentStatusLabels[order.payment_status] || order.payment_status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {order.notes && (
                                                    <div className="rounded-[1.75rem] border border-amber-400/15 bg-amber-400/10 p-5">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Notas del pedido</p>
                                                        <p className="mt-3 text-sm leading-6 text-neutral-200">{order.notes}</p>
                                                    </div>
                                                )}

                                                {order.cancellation_reason && (
                                                    <div className="rounded-[1.75rem] border border-rose-400/20 bg-rose-400/10 p-5">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">Motivo de cancelacion</p>
                                                        <p className="mt-3 text-sm leading-6 text-rose-100">{order.cancellation_reason}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                                <p className="text-sm font-semibold text-white">Resumen del pedido</p>
                                                <div className="mt-4 space-y-3">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-white">{item.product_name}</p>
                                                                    <p className="mt-1 text-xs text-neutral-500">
                                                                        {item.quantity} x {money(item.unit_price)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm font-semibold text-white">{money(item.subtotal)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-5 border-t border-white/10 pt-4 text-sm">
                                                    <div className="flex items-center justify-between text-neutral-400">
                                                        <span>Subtotal</span>
                                                        <span>{money(order.subtotal)}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-neutral-400">
                                                        <span>Domicilio</span>
                                                        <span>{money(order.delivery_fee)}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between text-base font-black text-white">
                                                        <span>Total</span>
                                                        <span>{money(order.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
