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

export default function ProductCard({ product }) {
    const currency = new Intl.NumberFormat('es-CO');
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
        <article className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex min-h-[132px]">
            {image ? (
                <img src={image} alt={product.name} className="w-36 h-auto object-cover" />
            ) : (
                <div className="w-36 bg-gray-100 flex items-center justify-center text-xs text-gray-500">Sin imagen</div>
            )}

            <div className="p-4 flex-1 flex flex-col gap-1">
                <h3 className="font-extrabold text-2xl leading-tight uppercase tracking-tight">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.short_description}</p>
                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <div className="text-lg leading-none font-bold tracking-tight">${currency.format(product.price)}</div>
                    {qty > 0 ? (
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={handleDecrement} className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                -
                            </button>
                            <span className="font-bold text-base min-w-4 text-center">{qty}</span>
                            <button onClick={handleAdd} className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                +
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAdd} className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                            +
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
