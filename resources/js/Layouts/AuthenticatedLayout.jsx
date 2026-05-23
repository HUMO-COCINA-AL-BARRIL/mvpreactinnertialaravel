import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Shapes, Bike, PanelLeftClose, PanelLeftOpen, Store, Power, CalendarDays, Camera, ShoppingCart } from 'lucide-react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { business } = usePage().props;
    const isBusinessOpen = business?.isOpen ?? true;
    const businessName = business?.name ?? 'HUMO Cocina al Barril';

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
        { label: 'Productos', href: route('admin.products.index'), active: route().current('admin.products.*'), icon: Package },
        { label: 'Categorias', href: route('admin.categories.index'), active: route().current('admin.categories.*'), icon: Shapes },
        { label: 'Domicilios', href: route('admin.delivery-fees.index'), active: route().current('admin.delivery-fees.*'), icon: Bike },
        { label: 'Pedidos RT', href: route('admin.orders.index'), active: route().current('admin.orders.*'), icon: ShoppingCart },
        { label: 'Reservas', href: route('admin.reservations.index'), active: route().current('admin.reservations.*'), icon: CalendarDays },
        { label: 'Momentos', href: route('admin.moments.index'), active: route().current('admin.moments.*'), icon: Camera },
    ];

    return (
        <div className="min-h-screen bg-[#f5f1ea] text-slate-900">
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
                <aside className={`flex h-full flex-col border-r border-white/10 bg-[#171717] px-4 py-5 text-white shadow-2xl transition-all duration-300 ${sidebarOpen ? 'w-[280px]' : 'w-[104px]'}`}>
                    <div className={`rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${sidebarOpen ? '' : 'px-2.5 py-3'}`}>
                        <div className={`flex items-center ${sidebarOpen ? 'justify-between gap-3' : 'flex-col gap-2'}`}>
                            <Link href="/" className={`flex min-w-0 items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md" />
                                    <ApplicationLogo className="relative h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
                                </div>
                                {sidebarOpen && (
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">HUMO</p>
                                        <p className="truncate text-base font-semibold text-white">Panel administrativo</p>
                                        <p className="mt-1 text-xs text-white/45">Control del menu, pedidos y reservas</p>
                                    </div>
                                )}
                            </Link>

                            <button
                                type="button"
                                onClick={() => setSidebarOpen((value) => !value)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-amber-300/30 hover:bg-white/10 hover:text-white"
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
                                            ? 'bg-amber-400 text-black shadow-[0_12px_30px_rgba(251,191,36,0.25)]'
                                            : 'text-white/68 hover:bg-white/8 hover:text-white'
                                    } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
                        <div className={`flex items-start gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isBusinessOpen ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                                <Store className="h-5 w-5" />
                            </span>

                            {sidebarOpen && (
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">Estado del comercio</p>
                                    <p className="mt-1 text-xs leading-5 text-white/55">
                                        {isBusinessOpen ? `${businessName} esta recibiendo pedidos.` : `${businessName} esta pausado para nuevos pedidos.`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={toggleBusinessStatus}
                            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                isBusinessOpen
                                    ? 'bg-rose-500/12 text-rose-200 hover:bg-rose-500/18'
                                    : 'bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/18'
                            }`}
                            title={isBusinessOpen ? 'Cerrar comercio para pedidos' : 'Abrir comercio para pedidos'}
                        >
                            <Power className="h-4 w-4" />
                            {sidebarOpen ? (isBusinessOpen ? 'Cerrar pedidos' : 'Abrir pedidos') : null}
                        </button>
                    </div>

                    <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                        <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 font-bold text-black">
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
                <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f5f1ea]/95 backdrop-blur lg:hidden">
                    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <ApplicationLogo className="h-11 w-11 rounded-2xl object-cover" />
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-600">HUMO</p>
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
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-bold text-black">
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
