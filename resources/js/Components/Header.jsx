import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from '@inertiajs/react';

function getCartCount() {
    try {
        const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
        return items.reduce((total, item) => total + (item.qty || 0), 0);
    } catch {
        return 0;
    }
}

export default function Header({ business = {}, onToggleCart = () => {} }) {
    const name = business.name ?? 'La Patateria Manizales';
    const rating = business.rating ?? 5.0;
    const status = business.isOpen ? 'Abierto' : 'Cerrado';
    const theme = business.theme ?? {};
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const syncCount = () => setCartCount(getCartCount());
        syncCount();

        window.addEventListener('add-to-cart', syncCount);
        window.addEventListener('cart-updated', syncCount);
        window.addEventListener('storage', syncCount);

        return () => {
            window.removeEventListener('add-to-cart', syncCount);
            window.removeEventListener('cart-updated', syncCount);
            window.removeEventListener('storage', syncCount);
        };
    }, []);

    const badge = useMemo(() => (cartCount > 99 ? '99+' : cartCount), [cartCount]);

    return (
        <header
            className="brand-navbar shadow-sm"
            style={{
                color: theme.navbarTextColor,
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('landing')} className="flex items-center gap-4">
                        <img src={business.logo ?? '/logo.png'} alt="logo" className="h-12 w-12 rounded-full" />
                        <div>
                            <div className="font-bold text-lg">{name}</div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: theme.navbarTextColor }}>
                                <span className="inline-flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201 4.665 24 6 15.595 0 9.748l8.332-1.73z"/></svg>
                                    <span className="font-medium">{rating.toFixed(1)}</span>
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${business.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                                    {status}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleCart}
                        className="brand-button relative inline-flex h-11 w-11 items-center justify-center rounded-xl shadow"
                        aria-label="Abrir carrito"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-black px-1.5 py-0.5 text-center text-xs font-bold text-white">
                                {badge}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
