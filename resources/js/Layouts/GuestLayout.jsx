import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';

export default function Guest({ children }) {
    const { business } = usePage().props;
    const theme = business?.theme ?? {};
    const businessName = business?.name ?? 'HUMO Cocina al Barril';
    const logo = business?.logo ?? null;
    const heroTitle = business?.heroTitle ?? 'Un acceso con presencia de marca y una interfaz lista para gestionar el negocio.';
    const heroDescription = business?.heroDescription ?? 'Revisa pedidos, productos y operacion diaria desde un panel moderno, claro y consistente con la experiencia publica de tu negocio.';
    const badge = business?.heroBadge ?? 'Acceso administrativo';

    return (
        <div
            className="relative min-h-screen overflow-hidden text-white"
            style={{
                backgroundColor: theme.sectionBackgroundColor || '#0a0a0a',
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at top left, ${(theme.primaryButtonColor || '#f59e0b')}33, transparent 35%), radial-gradient(circle at bottom right, ${(theme.sectionSurfaceColor || '#78716c')}55, transparent 30%)`,
                }}
            />
            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
                <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-4">
                                {logo ? (
                                    <img src={logo} alt={businessName} className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
                                ) : (
                                    <ApplicationLogo className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
                                )}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: theme.primaryButtonColor || '#fbbf24' }}>{businessName}</p>
                                    <h1 className="mt-2 text-4xl font-black tracking-tight">Admin App</h1>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-5">
                            <span className="brand-auth-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                                {badge}
                            </span>
                            <p className="max-w-lg text-4xl font-black leading-tight text-white">
                                {heroTitle}
                            </p>
                            <p className="max-w-xl text-base leading-7 text-neutral-300">
                                {heroDescription}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-lg items-center">
                        <div className="w-full rounded-[2rem] border border-white/10 bg-white px-6 py-8 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-8">
                            <div className="mb-8 flex items-center justify-center lg:hidden">
                                <Link href="/" className="inline-flex items-center gap-3">
                                    {logo ? (
                                        <img src={logo} alt={businessName} className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
                                    ) : (
                                        <ApplicationLogo className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
                                    )}
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.primaryButtonColor || '#f59e0b' }}>{businessName}</p>
                                        <p className="text-lg font-black tracking-tight text-slate-900">Admin App</p>
                                    </div>
                                </Link>
                            </div>

                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
