import React, { useEffect, useState } from 'react';

function getProductQty(productId) {
    try {
        const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
        const item = items.find((it) => it.id === productId);
        return item?.qty || 0;
    } catch {
        return 0;
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function ProductCard({ product }) {
    const image = product.image_url || product.image || null;
    const [qty, setQty] = useState(0);

    useEffect(() => {
        const syncQty = () => setQty(getProductQty(product.id));
        syncQty();

        window.addEventListener('cart-updated', syncQty);
        window.addEventListener('storage', syncQty);
        return () => {
            window.removeEventListener('cart-updated', syncQty);
            window.removeEventListener('storage', syncQty);
        };
    }, [product.id]);

    const handleAdd = () => {
        const payload = {
            id: product.id,
            name: product.name,
            price: product.price,
            image,
        };

        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: payload }));
    };

    const handleDecrement = () => {
        window.dispatchEvent(new CustomEvent('decrement-cart-item', { detail: { id: product.id } }));
    };

    return (
        <article className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex h-[220px]">
            {image ? (
                <img src={image} alt={product.name} className="w-36 h-auto object-cover" />
            ) : (
                <div className="w-36 bg-gray-100 flex items-center justify-center text-xs text-gray-500">Sin imagen</div>
            )}

            <div className="p-4 flex-1 flex flex-col gap-2 h-full">
                <h3 className="font-extrabold text-xl leading-tight tracking-tight text-neutral-900 line-clamp-2 min-h-[56px]">
                    {product.name}
                </h3>
                <p className="text-sm leading-5 text-gray-600 line-clamp-3 min-h-[60px]">{product.short_description}</p>
                <div className="mt-auto pt-2 flex items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">Precio</span>
                        <div className="text-lg leading-none font-bold tracking-tight text-neutral-900">{formatCurrency(product.price)}</div>
                    </div>
                    {qty > 0 ? (
                        <div className="flex items-center gap-2 shrink-0 rounded-full border border-amber-200/70 bg-amber-50/50 px-2.5 py-1.5">
                            <button
                                onClick={handleDecrement}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-base font-semibold text-white shadow-sm transition hover:bg-amber-400"
                            >
                                -
                            </button>
                            <span className="min-w-[24px] text-center text-base font-semibold text-neutral-900">{qty}</span>
                            <button
                                onClick={handleAdd}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-base font-semibold text-white shadow-sm transition hover:bg-amber-400"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAdd}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-white shadow-sm transition hover:bg-amber-400"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
