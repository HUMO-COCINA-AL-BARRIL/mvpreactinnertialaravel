import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Shapes, Bike, PanelLeftClose, PanelLeftOpen, Store, CalendarDays, Camera, ShoppingCart, Palette } from 'lucide-react';

function hexToRgba(hex, alpha) {
    if (!hex) {
        return undefined;
    }

    const normalized = hex.replace('#', '');

    if (normalized.length !== 6) {
        return undefined;
    }

    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function Authenticated({ user, header, children, themeOverride = null, businessNameOverride = null, logoOverride = null }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { business } = usePage().props;
    const isBusinessOpen = business?.isOpen ?? true;
    const businessName = businessNameOverride ?? business?.name ?? 'HUMO Cocina al Barril';
    const theme = themeOverride ?? business?.theme ?? {};
    const logo = logoOverride ?? business?.logo;
    const primaryColor = theme.primaryButtonColor ?? '#f59e0b';
    const primaryTextColor = theme.primaryButtonTextColor ?? '#000000';
    const sidebarBackground = theme.sectionSurfaceColor ?? '#171717';
    const appBackground = '#f5f1ea';
    const sidebarAccentSoft = hexToRgba(primaryColor, 0.16);
    const sidebarAccentBorder = hexToRgba(primaryColor, 0.32);

    const toggleBusinessStatus = () => {
        router.patch(
            route('admin.business-status.update'),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const navigation = [
        { label: 'Dashboard', href: route('dashboard'), active: route().current('dashboard'), icon: LayoutDashboard },
        { label: 'Personalizacion', href: route('admin.customization.index'), active: route().current('admin.customization.*'), icon: Palette },
        { label: 'Productos', href: route('admin.products.index'), active: route().current('admin.products.*'), icon: Package },
        { label: 'Categorias', href: route('admin.categories.index'), active: route().current('admin.categories.*'), icon: Shapes },
        { label: 'Domicilios', href: route('admin.delivery-fees.index'), active: route().current('admin.delivery-fees.*'), icon: Bike },
        { label: 'Pedidos RT', href: route('admin.orders.index'), active: route().current('admin.orders.*'), icon: ShoppingCart },
        { label: 'Reservas', href: route('admin.reservations.index'), active: route().current('admin.reservations.*'), icon: CalendarDays },
        { label: 'Momentos', href: route('admin.moments.index'), active: route().current('admin.moments.*'), icon: Camera },
    ];

    return (
        <div className="min-h-screen text-slate-900" style={{ backgroundColor: appBackground }}>
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
                <aside
                    className={`flex h-full flex-col border-r border-white/10 px-4 py-5 text-white shadow-2xl transition-all duration-300 ${sidebarOpen ? 'w-[280px]' : 'w-[104px]'}`}
                    style={{ backgroundColor: sidebarBackground }}
                >
                    <div className={`rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${sidebarOpen ? '' : 'px-2.5 py-3'}`}>
                        <div className={`flex items-center ${sidebarOpen ? 'justify-between gap-3' : 'flex-col gap-2'}`}>
                            <Link href="/" className={`flex min-w-0 items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl blur-md" style={{ backgroundColor: sidebarAccentSoft }} />
                                    {logo ? (
                                        <img src={logo} alt={businessName} className="relative h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
                                    ) : (
                                        <ApplicationLogo className="relative h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
                                    )}
                                </div>
                                {sidebarOpen && (
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>HUMO</p>
                                        <p className="truncate text-base font-semibold text-white">Panel administrativo</p>
                                        <p className="mt-1 text-xs text-white/45">Control del menu, pedidos y reservas</p>
                                    </div>
                                )}
                            </Link>

                            <button
                                type="button"
                                onClick={() => setSidebarOpen((value) => !value)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-white/10 hover:text-white"
                                style={{ borderColor: sidebarAccentBorder }}
                                title={sidebarOpen ? 'Contraer sidebar' : 'Expandir sidebar'}
                            >
                                {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                        item.active
                                            ? 'shadow-[0_12px_30px_rgba(15,23,42,0.25)]'
                                            : 'text-white/68 hover:bg-white/8 hover:text-white'
                                    } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                                    style={item.active ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    <div className={`mt-6 flex items-center border-t border-white/10 py-4 ${sidebarOpen ? 'justify-between gap-3 px-2' : 'justify-center'}`}>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-sm font-medium text-white/90">
                                        <Store aria-hidden="true" className="h-4 w-4 shrink-0 text-white/55" />
                                        Pedidos
                                    </p>
                                    <p className="mt-0.5 text-xs text-white/55" aria-live="polite">
                                        {isBusinessOpen ? 'Abiertos' : 'Pausados'}
                                    </p>
                                    {!isBusinessOpen && (
                                        <p className="mt-1 max-w-[160px] text-xs leading-4 text-white/55">
                                            No se reciben pedidos. Puede ser por alta demanda o cierre del comercio.
                                        </p>
                                    )}
                                </div>
                            )}

                        <button
                            type="button"
                            role="switch"
                            aria-checked={isBusinessOpen}
                            aria-label="Recepción de pedidos"
                            onClick={toggleBusinessStatus}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                            title={isBusinessOpen ? 'Cerrar pedidos' : 'Abrir pedidos'}
                        >
                            <span aria-hidden="true" className={`flex h-6 w-10 items-center rounded-full p-1 transition-colors ${isBusinessOpen ? 'bg-emerald-400' : 'bg-white/20'}`}>
                                <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isBusinessOpen ? 'translate-x-4' : 'translate-x-0'}`} />
                            </span>
                        </button>
                    </div>

                    <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                        <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            <span
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            >
                                {user.name?.slice(0, 1).toUpperCase()}
                            </span>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                                    <p className="truncate text-xs text-white/50">{user.email}</p>
                                </div>
                            )}
                        </div>

                        {sidebarOpen && (
                            <div className="mt-4 space-y-2">
                                <Link
                                    href={route('profile.edit')}
                                    className="block rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
                                >
                                    Perfil
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                                >
                                    Cerrar sesion
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <div className={`${sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[104px]'} transition-all duration-300`}>
                <nav className="sticky top-0 z-30 border-b border-slate-200/80 backdrop-blur lg:hidden" style={{ backgroundColor: `${appBackground}f2` }}>
                    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="inline-flex items-center gap-3">
                            {logo ? (
                                <img src={logo} alt={businessName} className="h-11 w-11 rounded-2xl object-cover" />
                            ) : (
                                <ApplicationLogo className="h-11 w-11 rounded-2xl object-cover" />
                            )}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>HUMO</p>
                                <p className="text-sm font-semibold text-slate-900">Panel administrativo</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-full">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full font-bold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                {user.name?.slice(0, 1).toUpperCase()}
                                            </span>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                                    <Dropdown.Link href={route('profile.edit')} className="rounded-xl text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                                        Perfil
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="rounded-xl text-rose-600 hover:bg-rose-50 focus:bg-rose-50">
                                        Cerrar sesion
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' border-t border-slate-200 bg-white'}>
                        <div className="space-y-1 px-4 py-4">
                            <button
                                type="button"
                                onClick={toggleBusinessStatus}
                                className={`mb-3 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                                    isBusinessOpen
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-rose-50 text-rose-700'
                                }`}
                            >
                                <span>{isBusinessOpen ? 'Recibiendo pedidos' : 'Pedidos pausados'}</span>
                                <span>{isBusinessOpen ? 'Cerrar' : 'Abrir'}</span>
                            </button>

                            {navigation.map((item) => (
                                <ResponsiveNavLink
                                    key={item.label}
                                    href={item.href}
                                    active={item.active}
                                    className="rounded-2xl border-l-0 px-4 py-3"
                                >
                                    {item.label}
                                </ResponsiveNavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="relative z-10">
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="relative z-10">{children}</main>
            </div>
        </div>
    );
}
