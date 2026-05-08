import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

function formatCurrency(v) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
}

export default function CartDrawer({ show = false, onClose = () => {} }) {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart_items') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const notifyCartUpdated = (nextItems) => {
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: nextItems }));
        };

        const addHandler = (e) => {
            const p = e.detail;
            setItems((prev) => {
                const exists = prev.find((it) => it.id === p.id);
                let next;
                if (exists) {
                    next = prev.map((it) => (it.id === p.id ? { ...it, qty: it.qty + 1 } : it));
                } else {
                    next = [...prev, { ...p, qty: 1 }];
                }
                localStorage.setItem('cart_items', JSON.stringify(next));
                notifyCartUpdated(next);
                return next;
            });
        };

        const decrementHandler = (e) => {
            const id = e.detail?.id;
            if (!id) return;

            setItems((prev) => {
                const next = prev
                    .map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it))
                    .filter((it) => it.qty > 0);
                localStorage.setItem('cart_items', JSON.stringify(next));
                notifyCartUpdated(next);
                return next;
            });
        };

        notifyCartUpdated(items);
        window.addEventListener('add-to-cart', addHandler);
        window.addEventListener('decrement-cart-item', decrementHandler);
        return () => {
            window.removeEventListener('add-to-cart', addHandler);
            window.removeEventListener('decrement-cart-item', decrementHandler);
        };
    }, []);

    const updateQty = (id, delta) => {
        setItems((prev) => {
            const next = prev
                .map((it) => (it.id === id ? { ...it, qty: it.qty + delta } : it))
                .filter((it) => it.qty > 0);
            localStorage.setItem('cart_items', JSON.stringify(next));
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: next }));
            return next;
        });
    };

    const subtotal = items.reduce((s, it) => s + (it.price || 0) * it.qty, 0);

    return (
        <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform ${show ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Carrito</h3>
                <button onClick={onClose} className="text-gray-500">Cerrar</button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 160px)' }}>
                {items.length === 0 ? (
                    <div className="text-gray-500">No hay productos en el carrito.</div>
                ) : (
                    items.map((it) => (
                        <div key={it.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">{it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : 'img'}</div>
                            <div className="flex-1">
                                <div className="font-medium">{it.name}</div>
                                <div className="text-sm text-gray-500">{formatCurrency(it.price)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(it.id, -1)} className="px-2 py-1 bg-gray-100 rounded">-</button>
                                <div>{it.qty}</div>
                                <button onClick={() => updateQty(it.id, 1)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">Subtotal</div>
                    <div className="font-semibold">{formatCurrency(subtotal)}</div>
                </div>
                <Link href={route('checkout.create')} className="block text-center bg-amber-400 text-black px-4 py-3 rounded font-semibold">Ir a pagar</Link>
            </div>
        </div>
    );
}
