import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BellRing, CheckCircle2, Clock3, CreditCard, ShoppingCart, Truck } from 'lucide-react';

const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const statusStyles = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-sky-100 text-sky-800',
    preparing: 'bg-violet-100 text-violet-800',
    ready: 'bg-emerald-100 text-emerald-800',
    delivered: 'bg-slate-200 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-800',
};

const paymentLabels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
};

const paymentMethodLabels = {
    online: 'Online',
    cash: 'Efectivo',
    transfer: 'Transferencia',
};

const deliveryMethodLabels = {
    pickup: 'Recoger',
    dine_in: 'Consumir en sitio',
    delivery: 'Domicilio',
};

const progressSteps = [
    { key: 'pending', label: 'Recibido' },
    { key: 'confirmed', label: 'Confirmado' },
    { key: 'preparing', label: 'Preparando' },
    { key: 'ready', label: 'Listo' },
    { key: 'delivered', label: 'Entregado' },
];

const pollingIntervalMs = Number(import.meta.env.VITE_ADMIN_ORDERS_POLLING_MS || 10000);
const realtimeEnabled = String(import.meta.env.VITE_ADMIN_ORDERS_REALTIME_ENABLED || 'false') === 'true';

function StatCard({ title, value, hint, icon: Icon, accent }) {
    return (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function OrderProgress({ status }) {
    const activeIndex = progressSteps.findIndex((step) => step.key === status);

    if (status === 'cancelled') {
        return (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">TrackCheck</p>
                <p className="mt-2 text-sm font-semibold text-rose-900">Pedido cancelado</p>
            </div>
        );
    }

    return (
        <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">TrackCheck</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
                {progressSteps.map((step, index) => {
                    const completed = activeIndex >= index;
                    const current = activeIndex === index;

                    return (
                        <div
                            key={step.key}
                            className={`rounded-2xl border px-3 py-3 text-center text-xs font-semibold ${
                                current
                                    ? 'border-amber-300 bg-amber-100 text-amber-900'
                                    : completed
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                        : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                        >
                            {step.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const money = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function AdminOrdersIndex({ auth, stats: initialStats, orders: initialOrders, latestOrderId: initialLatestOrderId }) {
    const [stats, setStats] = useState(initialStats);
    const [orders, setOrders] = useState(initialOrders);
    const [search, setSearch] = useState('');
    const [latestOrderId, setLatestOrderId] = useState(initialLatestOrderId);
    const [loadingId, setLoadingId] = useState(null);
    const [soundArmed, setSoundArmed] = useState(false);
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const audioContextRef = useRef(null);
    const latestOrderIdRef = useRef(initialLatestOrderId);
    const soundArmedRef = useRef(false);

    const filteredOrders = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) {
            return orders;
        }

        const compactSearch = normalizedSearch.replace(/\D/g, '');

        return orders.filter((order) => {
            const orderNumber = String(order.order_number || '').toLowerCase();
            const customerPhone = String(order.customer_phone || '').toLowerCase();
            const compactPhone = customerPhone.replace(/\D/g, '');

            return orderNumber.includes(normalizedSearch)
                || customerPhone.includes(normalizedSearch)
                || (compactSearch && compactPhone.includes(compactSearch));
        });
    }, [orders, search]);

    const totalRevenue = useMemo(
        () => filteredOrders
            .filter((order) => order.status !== 'cancelled' && order.payment_status !== 'cancelled')
            .reduce((sum, order) => sum + Number(order.total || 0), 0),
        [filteredOrders]
    );

    useEffect(() => {
        latestOrderIdRef.current = latestOrderId;
    }, [latestOrderId]);

    useEffect(() => {
        soundArmedRef.current = soundArmed;
    }, [soundArmed]);

    useEffect(() => {
        let cancelled = false;

        const poll = async () => {
            try {
                const response = await axios.get(route('admin.orders.snapshot'));
                if (cancelled) {
                    return;
                }

                const currentLatestOrderId = latestOrderIdRef.current;
                const nextLatestOrderId = Number(response.data.latestOrderId || 0);
                if (currentLatestOrderId && nextLatestOrderId > currentLatestOrderId) {
                    const freshOrders = (response.data.orders || []).filter((order) => order.id > currentLatestOrderId);

                    if (freshOrders.length > 0) {
                        toast.success(`${freshOrders.length} pedido${freshOrders.length === 1 ? '' : 's'} nuevo${freshOrders.length === 1 ? '' : 's'} en tiempo real.`);
                        playNotification();
                    }
                }

                setStats(response.data.stats);
                setOrders(response.data.orders || []);
                setLatestOrderId(nextLatestOrderId);
            } catch {
                // Evitamos ruido excesivo si una lectura puntual falla.
            }
        };

        poll();
        const interval = window.setInterval(poll, pollingIntervalMs);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!realtimeEnabled || !window.Echo) {
            setRealtimeConnected(false);
            return undefined;
        }

        const channel = window.Echo.channel('admin.orders');

        channel.listen('.order.rt.updated', (event) => {
            const action = event?.action || 'updated';
            const incomingOrderId = Number(event?.order_id || 0);

            axios.get(route('admin.orders.snapshot'))
                .then((response) => {
                    setStats(response.data.stats);
                    setOrders(response.data.orders || []);
                    setLatestOrderId(Number(response.data.latestOrderId || 0));

                    if (action === 'created' && incomingOrderId > latestOrderIdRef.current) {
                        toast.success(`Nuevo pedido ${event?.order_number || ''} recibido en tiempo real.`.trim());
                        playNotification();
                    }
                })
                .catch(() => {
                    // Si la sincronizacion puntual falla, el polling sigue como respaldo.
                });
        });

        setRealtimeConnected(true);

        return () => {
            try {
                channel.stopListening('.order.rt.updated');
                window.Echo.leave('admin.orders');
            } catch {
                // Evitamos ruido al desmontar.
            }
            setRealtimeConnected(false);
        };
    }, []);

    useEffect(() => {
        const armOnInteraction = async () => {
            try {
                if (!audioContextRef.current) {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    if (!AudioContextClass) {
                        return;
                    }

                    audioContextRef.current = new AudioContextClass();
                }

                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }

                setSoundArmed(true);
            } catch {
                // Si el navegador bloquea el audio, dejamos el boton manual.
            }
        };

        window.addEventListener('pointerdown', armOnInteraction, { once: true });
        window.addEventListener('keydown', armOnInteraction, { once: true });

        return () => {
            window.removeEventListener('pointerdown', armOnInteraction);
            window.removeEventListener('keydown', armOnInteraction);
        };
    }, []);

    const playNotification = async () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                return;
            }

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextClass();
            }

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (!soundArmedRef.current) {
                return;
            }

            const context = audioContextRef.current;
            const now = context.currentTime;

            [0, 0.18].forEach((offset, index) => {
                const oscillator = context.createOscillator();
                const gain = context.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(index === 0 ? 880 : 1174, now + offset);
                gain.gain.setValueAtTime(0.0001, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);

                oscillator.connect(gain);
                gain.connect(context.destination);
                oscillator.start(now + offset);
                oscillator.stop(now + offset + 0.2);
            });
        } catch {
            // Si el sonido falla, el panel sigue operando con toast visual.
        }
    };

    const enableSound = async () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                toast.error('Este navegador no soporta audio de notificacion.');
                return;
            }

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextClass();
            }

            await audioContextRef.current.resume();
            setSoundArmed(true);
            toast.success('Notificaciones de sonido activadas.');
        } catch {
            toast.error('No se pudo activar el sonido en este navegador.');
        }
    };

    const updateOrderState = async (orderId, patch) => {
        const currentOrder = orders.find((order) => order.id === orderId);
        if (!currentOrder) {
            return;
        }

        let cancellationReason = patch.cancellation_reason ?? null;
        const nextStatus = patch.status ?? currentOrder.status;

        if (nextStatus === 'cancelled' && currentOrder.status !== 'cancelled' && !cancellationReason) {
            cancellationReason = window.prompt('Escribe el motivo de cancelacion del pedido:')?.trim() || '';

            if (!cancellationReason) {
                toast.error('La cancelacion requiere un motivo.');
                return;
            }
        }

        setLoadingId(orderId);

        try {
            const response = await axios.patch(route('admin.orders.update', orderId), {
                status: nextStatus,
                payment_status: nextStatus === 'cancelled'
                    ? 'cancelled'
                    : (patch.payment_status ?? currentOrder.payment_status),
                cancellation_reason: nextStatus === 'cancelled'
                    ? cancellationReason
                    : (patch.cancellation_reason ?? null),
            });

            setOrders((currentOrders) => currentOrders.map((order) => (
                order.id === orderId ? response.data.order : order
            )));
            toast.success(response.data.message || 'Pedido actualizado correctamente.');
        } catch (error) {
            toast.error(error.response?.data?.errors?.cancellation_reason?.[0] || error.response?.data?.message || 'No se pudo actualizar el pedido.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(135deg,#fff8eb_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                                Operacion en vivo
                            </span>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Pedidos RT</h1>
                            <p className="mt-3 text-base leading-7 text-slate-600">
                                Sigue los pedidos en tiempo real, cambia estados rapidamente y recibe una alerta sonora cuando entren nuevas ordenes.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={enableSound}
                                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                                    soundArmed
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <BellRing className="h-4 w-4" />
                                {soundArmed ? 'Sonido activo' : 'Activar sonido'}
                            </button>
                            <div className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold ${
                                realtimeConnected
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-900 text-white'
                            }`}>
                                {realtimeConnected ? 'Tiempo real activo por broadcast' : `Actualizacion cada ${Math.round(pollingIntervalMs / 1000)} segundos`}
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Pedidos RT" />

            <div className="pb-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <StatCard title="Pedidos" value={filteredOrders.length} hint={search.trim() ? 'Pedidos que coinciden con la busqueda.' : 'Ordenes visibles en el panel RT.'} icon={ShoppingCart} accent="bg-slate-100 text-slate-700" />
                        <StatCard title="Pendientes" value={stats.pendingOrders} hint="Pedidos nuevos por confirmar." icon={Clock3} accent="bg-amber-100 text-amber-800" />
                        <StatCard title="Activos" value={stats.activeOrders} hint="Confirmados, preparando o listos." icon={Truck} accent="bg-sky-100 text-sky-800" />
                        <StatCard title="Pagados" value={stats.paidOrders} hint="Pedidos con pago ya validado." icon={CreditCard} accent="bg-emerald-100 text-emerald-800" />
                        <StatCard title="Ingresos visibles" value={money(totalRevenue)} hint="Suma de los pedidos listados actualmente." icon={CheckCircle2} accent="bg-violet-100 text-violet-800" />
                    </section>

                    <section className="space-y-5">
                        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-xl">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Filtro rapido</p>
                                    <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Busca por codigo o celular</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Escribe algo como <span className="font-semibold text-slate-900">HUMO-0005</span> o <span className="font-semibold text-slate-900">3057149417</span>.
                                    </p>
                                </div>

                                <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Buscar pedido o numero de celular"
                                        className="w-full rounded-2xl border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {orders.length === 0 && (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                                <p className="text-lg font-bold text-slate-900">Todavia no hay pedidos registrados</p>
                                <p className="mt-2 text-sm text-slate-500">En cuanto entren nuevos pedidos apareceran aqui automaticamente.</p>
                            </div>
                        )}

                        {orders.length > 0 && filteredOrders.length === 0 && (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                                <p className="text-lg font-bold text-slate-900">No encontramos pedidos con ese filtro</p>
                                <p className="mt-2 text-sm text-slate-500">Prueba con otro codigo o con otra parte del numero de celular.</p>
                            </div>
                        )}

                        {filteredOrders.map((order) => (
                            <article
                                key={order.id}
                                className={`overflow-hidden rounded-[1.75rem] border bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${
                                    order.is_new ? 'border-amber-300 ring-2 ring-amber-200/70' : 'border-white/70'
                                }`}
                            >
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-black tracking-tight text-slate-950">{order.order_number}</h2>
                                                {order.is_new && (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                                                        Nuevo
                                                    </span>
                                                )}
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {statusLabels[order.status] || order.status}
                                                </span>
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {paymentLabels[order.payment_status] || order.payment_status}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-900">{order.customer_name}</p>
                                            <p className="mt-1 text-sm text-slate-600">{order.customer_phone}</p>
                                            <p className="mt-1 text-xs text-slate-500">{order.created_at_label}</p>
                                            <OrderProgress status={order.status} />
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Estado del pedido</label>
                                                <select
                                                    className="mt-2 w-full rounded-xl border-slate-300 text-sm"
                                                    value={order.status}
                                                    disabled={loadingId === order.id}
                                                    onChange={(event) => updateOrderState(order.id, { status: event.target.value })}
                                                >
                                                    {Object.entries(statusLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Estado del pago</label>
                                                <select
                                                    className="mt-2 w-full rounded-xl border-slate-300 text-sm"
                                                    value={order.payment_status}
                                                    disabled={loadingId === order.id || order.status === 'cancelled'}
                                                    onChange={(event) => updateOrderState(order.id, { payment_status: event.target.value })}
                                                >
                                                    {Object.entries(paymentLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.1fr_0.9fr]">
                                    <div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="rounded-2xl bg-slate-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Entrega</p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {deliveryMethodLabels[order.delivery_method] || order.delivery_method}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {order.delivery_address || 'Sin direccion registrada para este tipo de pedido.'}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-slate-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pago</p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {paymentMethodLabels[order.payment_method] || order.payment_method}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {order.latest_payment
                                                        ? `${order.latest_payment.provider} · ${paymentLabels[order.latest_payment.status] || order.latest_payment.status}`
                                                        : 'Sin intento de pago registrado.'}
                                                </p>
                                            </div>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Notas del cliente</p>
                                                <p className="mt-2 text-sm leading-6 text-amber-900">{order.notes}</p>
                                            </div>
                                        )}

                                        {order.cancellation_reason && (
                                            <div className="mt-4 rounded-2xl bg-rose-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Motivo de cancelacion</p>
                                                <p className="mt-2 text-sm leading-6 text-rose-900">{order.cancellation_reason}</p>
                                            </div>
                                        )}

                                        {order.whatsapp_link && (
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <a
                                                    href={order.whatsapp_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    Abrir confirmacion por WhatsApp
                                                </a>
                                                <a
                                                    href={order.tracking_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                                                >
                                                    Abrir TrackCheck publico
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-[1.5rem] border border-slate-200 bg-white">
                                        <div className="border-b border-slate-100 px-5 py-4">
                                            <h3 className="text-sm font-semibold text-slate-900">Detalle del pedido</h3>
                                        </div>
                                        <div className="space-y-3 px-5 py-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{item.product_name}</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {item.quantity} x {money(item.unit_price)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900">{money(item.subtotal)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-100 px-5 py-4 text-sm">
                                            <div className="flex items-center justify-between text-slate-600">
                                                <span>Subtotal</span>
                                                <span>{money(order.subtotal)}</span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-slate-600">
                                                <span>Domicilio</span>
                                                <span>{money(order.delivery_fee)}</span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-base font-black text-slate-950">
                                                <span>Total</span>
                                                <span>{money(order.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
