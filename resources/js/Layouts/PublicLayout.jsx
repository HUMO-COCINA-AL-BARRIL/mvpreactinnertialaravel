import { useState } from 'react';
import Header from '../Components/Header';
import CartDrawer from '../Components/CartDrawer';

const defaultBusiness = {
    name: 'HUMO Cocina al Barril',
    rating: 5.0,
    isOpen: true,
    logo: '/images/logo_humo.jpg',
};

export default function PublicLayout({ children, business = defaultBusiness, mainClassName = 'min-h-screen bg-neutral-950 text-white' }) {
    const [showCart, setShowCart] = useState(false);
    const closeCart = () => setShowCart(false);

    return (
        <>
            <Header business={business} onToggleCart={() => setShowCart((s) => !s)} />

            <main className={mainClassName}>
                {children}
            </main>

            <footer className="bg-black border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-neutral-400 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                    <p>HUMO Cocina al Barril</p>
                    <p>Manizales, Colombia</p>
                </div>
            </footer>

            <CartDrawer show={showCart} onClose={closeCart} />
        </>
    );
}
