import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PublicLayout from '../../../Layouts/PublicLayout';

const formatMoney = (value) => `$${new Intl.NumberFormat('es-CO').format(value || 0)}`;

export default function CheckoutCreate({ availableProducts = [], deliveryFees = [] }) {
    const { errors, business } = usePage().props;
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        delivery_method: 'pickup',
        delivery_address: '',
        delivery_fee_id: '',
        notes: '',
        payment_method: 'online',
        payment_provider: 'wompi',
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        try {
            const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');
            setItems(cart);
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        if (form.delivery_method !== 'delivery' && form.delivery_fee_id) {
            setForm((prev) => ({ ...prev, delivery_fee_id: '' }));
        }
    }, [form.delivery_method, form.delivery_fee_id]);

    const productsMap = useMemo(() => {
        const map = new Map();
        availableProducts.forEach((product) => map.set(product.id, product));
        return map;
    }, [availableProducts]);

    const normalizedItems = useMemo(() => {
        return items
            .map((item) => {
                const product = productsMap.get(item.id);
                if (!product) return null;

                const price = Number(product.price || 0);
                const qty = Number(item.qty || 0);
                return {
                    product_id: product.id,
                    name: product.name,
                    price,
                    qty,
                    subtotal: price * qty,
                };
            })
            .filter(Boolean);
    }, [items, productsMap]);

    const subtotal = useMemo(
        () => normalizedItems.reduce((sum, item) => sum + item.subtotal, 0),
        [normalizedItems]
    );

    const selectedDeliveryFee = useMemo(() => {
        if (form.delivery_method !== 'delivery') return 0;
        const fee = deliveryFees.find((item) => item.id === Number(form.delivery_fee_id));
        return Number(fee?.price || 0);
    }, [deliveryFees, form.delivery_method, form.delivery_fee_id]);

    const total = subtotal + selectedDeliveryFee;
    const isBusinessOpen = business?.isOpen ?? true;
    const closedMessage = business?.closedMessage ?? 'El local esta cerrado en este momento. Vuelve pronto.';
    const isOnlinePayment = form.payment_method === 'online';

    const updateQty = (id, delta) => {
        setItems((prev) => {
            const next = prev
                .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
                .filter((item) => item.qty > 0);
            localStorage.setItem('cart_items', JSON.stringify(next));
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: next }));
            return next;
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (normalizedItems.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        if (!isBusinessOpen) {
            return;
        }

        setProcessing(true);
        router.post(
            route('checkout.store'),
            {
                ...form,
                items: normalizedItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.qty,
                })),
            },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    localStorage.removeItem('cart_items');
                    window.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }));
                },
            }
        );
    };

    return (
        <>
            <Head title="Checkout | HUMO Cocina al Barril">
                <meta name="description" content="Finaliza tu pedido en HUMO Cocina al Barril con entrega, recogida o consumo en sitio." />
                <meta name="robots" content="noindex,nofollow" />
                <link rel="canonical" href={route('checkout.create')} />
                <meta property="og:title" content="Checkout | HUMO Cocina al Barril" />
                <meta property="og:description" content="Finaliza tu pedido en HUMO Cocina al Barril con entrega, recogida o consumo en sitio." />
                <meta property="og:url" content={route('checkout.create')} />
                <meta property="og:image" content={`${window.location.origin}/images/humo_hero.png`} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <PublicLayout>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-4xl font-extrabold">Checkout</h1>
                        <Link href={route('landing')} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                            Volver al inicio
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <form onSubmit={submit} className="lg:col-span-2 rounded-2xl bg-white text-black border border-neutral-200 p-6 space-y-4">
                            <h2 className="text-xl font-bold">Datos de entrega</h2>

                            {!isBusinessOpen && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {closedMessage}
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nombre completo</label>
                                    <input className="mt-1 w-full rounded-xl border-neutral-300" value={form.customer_name} onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))} />
                                    {errors.customer_name && <p className="text-red-600 text-sm mt-1">{errors.customer_name}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Teléfono</label>
                                    <PhoneInput
                                        country="co"
                                        value={form.customer_phone}
                                        onChange={(value) => setForm((prev) => ({ ...prev, customer_phone: `+${value}` }))}
                                        inputClass="!w-full !h-[42px] !rounded-xl !border-neutral-300 !text-sm"
                                        buttonClass="!border-neutral-300 !rounded-l-xl"
                                        containerClass="mt-1"
                                        dropdownClass="!text-black"
                                        enableSearch
                                        searchPlaceholder="Buscar país"
                                        inputProps={{ name: 'customer_phone', required: true }}
                                    />
                                    {errors.customer_phone && <p className="text-red-600 text-sm mt-1">{errors.customer_phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Método de entrega</label>
                                <select className="mt-1 w-full rounded-xl border-neutral-300" value={form.delivery_method} onChange={(e) => setForm((prev) => ({ ...prev, delivery_method: e.target.value }))}>
                                    <option value="pickup">Recoger en el local</option>
                                    <option value="dine_in">Consumir en sitio</option>
                                    <option value="delivery">Domicilio</option>
                                </select>
                            </div>

                            {form.delivery_method === 'delivery' && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium">Dirección de entrega</label>
                                        <input className="mt-1 w-full rounded-xl border-neutral-300" value={form.delivery_address} onChange={(e) => setForm((prev) => ({ ...prev, delivery_address: e.target.value }))} />
                                        {errors.delivery_address && <p className="text-red-600 text-sm mt-1">{errors.delivery_address}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Tarifa de domicilio</label>
                                        <select className="mt-1 w-full rounded-xl border-neutral-300" value={form.delivery_fee_id} onChange={(e) => setForm((prev) => ({ ...prev, delivery_fee_id: e.target.value }))}>
                                            <option value="">Selecciona una zona</option>
                                            {deliveryFees.map((fee) => (
                                                <option key={fee.id} value={fee.id}>{fee.name} - {formatMoney(fee.price)}</option>
                                            ))}
                                        </select>
                                        {errors.delivery_fee_id && <p className="text-red-600 text-sm mt-1">{errors.delivery_fee_id}</p>}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-sm font-medium">Notas (opcional)</label>
                                <textarea rows={3} className="mt-1 w-full rounded-xl border-neutral-300" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                            </div>

                            <h2 className="text-xl font-bold pt-2">Pago</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Método de pago</label>
                                    <select
                                        className="mt-1 w-full rounded-xl border-neutral-300"
                                        value={form.payment_method}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                payment_method: e.target.value,
                                                payment_provider: e.target.value === 'online' ? (prev.payment_provider || 'wompi') : '',
                                            }))
                                        }
                                    >
                                        <option value="online">Pago online</option>
                                        <option value="cash">Pago no online</option>
                                        <option value="transfer">Transferencia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{isOnlinePayment ? 'Pasarela' : 'Forma de pago'}</label>
                                    <select
                                        className="mt-1 w-full rounded-xl border-neutral-300"
                                        value={isOnlinePayment ? form.payment_provider : form.payment_method}
                                        onChange={(e) =>
                                            setForm((prev) => (
                                                isOnlinePayment
                                                    ? { ...prev, payment_provider: e.target.value }
                                                    : { ...prev, payment_method: e.target.value, payment_provider: '' }
                                            ))
                                        }
                                    >
                                        {isOnlinePayment ? (
                                            <>
                                                <option value="wompi">Wompi</option>
                                                <option value="mercadopago">Mercado Pago</option>
                                                <option value="payu">PayU</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="cash">
                                                    {form.delivery_method === 'delivery' ? 'Efectivo contra entrega' : 'Efectivo en sitio'}
                                                </option>
                                                <option value="transfer">Transferencia</option>
                                            </>
                                        )}
                                    </select>
                                    {errors.payment_provider && <p className="text-red-600 text-sm mt-1">{errors.payment_provider}</p>}
                                </div>
                            </div>

                            {errors.message && <p className="text-red-600 text-sm">{errors.message}</p>}

                            <button disabled={processing || !isBusinessOpen} type="submit" className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70">
                                {!isBusinessOpen ? 'Local cerrado' : processing ? 'Procesando...' : 'Confirmar pedido'}
                            </button>
                        </form>

                        <aside className="rounded-2xl bg-white text-black border border-neutral-200 p-6 h-fit">
                            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

                            <div className="space-y-4 max-h-[420px] overflow-auto pr-1">
                                {normalizedItems.length === 0 ? (
                                    <p className="text-neutral-500">No hay productos en el carrito.</p>
                                ) : (
                                    normalizedItems.map((item) => (
                                        <div key={item.product_id} className="border border-neutral-200 rounded-xl p-3">
                                            <div className="font-semibold">{item.name}</div>
                                            <div className="text-sm text-neutral-500 mb-2">{formatMoney(item.price)} c/u</div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => updateQty(item.product_id, -1)} className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold">-</button>
                                                    <span className="font-semibold">{item.qty}</span>
                                                    <button type="button" onClick={() => updateQty(item.product_id, 1)} className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold">+</button>
                                                </div>
                                                <div className="font-bold">{formatMoney(item.subtotal)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-neutral-200 mt-4 pt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-600">Subtotal</span>
                                    <span className="font-semibold">{formatMoney(subtotal)}</span>
                                </div>
                                {form.delivery_method === 'delivery' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-600">Domicilio</span>
                                        <span className="font-semibold">{formatMoney(selectedDeliveryFee)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-600">Total</span>
                                    <span className="text-2xl font-bold">{formatMoney(total)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
