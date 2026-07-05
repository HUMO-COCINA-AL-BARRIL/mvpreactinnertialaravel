import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Header from '../Components/Header';
import CartDrawer from '../Components/CartDrawer';

const defaultBusiness = {
    name: 'HUMO Cocina al Barril',
    rating: 5.0,
    isOpen: true,
    logo: '/images/logo_humo.jpg',
};

export default function PublicLayout({ children, business = defaultBusiness, mainClassName = 'min-h-screen bg-neutral-950 text-white' }) {
    const { business: sharedBusiness } = usePage().props;
    const [showCart, setShowCart] = useState(false);
    const closeCart = () => setShowCart(false);
    const resolvedBusiness = sharedBusiness ?? business;
    const theme = resolvedBusiness.theme ?? {};

    return (
        <div
            style={{
                '--brand-navbar-bg': theme.navbarBackgroundColor,
                '--brand-navbar-text': theme.navbarTextColor,
                '--brand-primary': theme.primaryButtonColor,
                '--brand-primary-text': theme.primaryButtonTextColor,
                '--brand-section-bg': theme.sectionBackgroundColor,
                '--brand-surface-bg': theme.sectionSurfaceColor,
                '--brand-cta-bg': theme.ctaBackgroundColor,
            }}
        >
            <Header business={resolvedBusiness} onToggleCart={() => setShowCart((s) => !s)} />

            <main className={mainClassName}>
                {children}
            </main>

            <footer className="border-t border-white/10" style={{ background: `linear-gradient(180deg, ${theme.sectionBackgroundColor || '#060606'} 0%, ${theme.ctaBackgroundColor || '#111111'} 100%)` }}>
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>{resolvedBusiness.name}</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Visitanos o pide directo por WhatsApp</h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
                                Un punto pensado para compartir cortes al barril, reservas especiales y pedidos rapidos en un solo lugar.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Ubicacion</p>
                                <p className="mt-3 text-base font-semibold text-white">Carrera 23 #74-114</p>
                                <p className="mt-1 text-sm text-neutral-400">Sector El Perro, Manizales, Colombia</p>
                            </div>

                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Contacto</p>
                                <a
                                    href="tel:+573001234567"
                                    className="mt-3 block text-base font-semibold text-white transition"
                                    style={{ '--hover-color': 'var(--brand-primary)' }}
                                >
                                    +57 300 123 4567
                                </a>
                                <a
                                    href="https://wa.me/573001234567?text=Hola%20HUMO,%20quiero%20mas%20informacion"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block text-sm text-neutral-400 transition hover:text-white"
                                >
                                    WhatsApp directo
                                </a>
                            </div>

                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Horarios</p>
                                <p className="mt-3 text-sm text-neutral-200">Lunes a jueves: 12:00 m. - 10:00 p. m.</p>
                                <p className="mt-1 text-sm text-neutral-400">Viernes a domingo: 12:00 m. - 11:00 p. m.</p>
                            </div>

                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Accesos</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <a href="/" className="block text-neutral-200 transition hover:text-white">Inicio</a>
                                    <a href="/menu" className="block text-neutral-400 transition hover:text-white">Menu digital</a>
                                    <a href="/reservation" className="block text-neutral-400 transition hover:text-white">Reservar mesa</a>
                                    <Link href={route('orders.tracking')} className="block text-neutral-400 transition hover:text-white">Seguir pedido</Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                            <p>{resolvedBusiness.name}</p>
                            <p>Manizales, Colombia</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                        <div className="border-b border-white/10 px-5 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>Mapa</p>
                            <p className="mt-2 text-lg font-bold text-white">Como llegar a HUMO</p>
                        </div>

                        <div className="aspect-[4/3] w-full">
                            <iframe
                                title="Mapa HUMO Cocina al Barril"
                                src="https://www.google.com/maps?q=Carrera%2023%20%2374-114%20Manizales%20Colombia&z=16&output=embed"
                                className="h-full w-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>

                        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Carrera+23+%2374-114+Manizales+Colombia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="brand-button inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-bold"
                            >
                                Abrir en Google Maps
                            </a>
                            <a
                                href="https://wa.me/573001234567?text=Hola%20HUMO,%20quiero%20pedir%20o%20reservar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="brand-dark-button inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
                            >
                                Pedir o reservar
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <CartDrawer show={showCart} onClose={closeCart} />
        </div>
    );
}
