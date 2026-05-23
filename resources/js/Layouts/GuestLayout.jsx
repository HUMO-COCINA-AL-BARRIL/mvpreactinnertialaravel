import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(120,113,108,0.18),_transparent_30%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
                <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-4">
                                <ApplicationLogo className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">HUMO</p>
                                    <h1 className="mt-2 text-4xl font-black tracking-tight">Admin App</h1>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-5">
                            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                                Cocina al barril
                            </span>
                            <p className="max-w-lg text-4xl font-black leading-tight text-white">
                                Un acceso con presencia de marca y una interfaz lista para gestionar el negocio.
                            </p>
                            <p className="max-w-xl text-base leading-7 text-neutral-300">
                                Revisa pedidos, productos y operación diaria desde un panel más moderno, claro y consistente con la experiencia pública de HUMO.
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-lg items-center">
                        <div className="w-full rounded-[2rem] border border-white/10 bg-white px-6 py-8 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-8">
                            <div className="mb-8 flex items-center justify-center lg:hidden">
                                <Link href="/" className="inline-flex items-center gap-3">
                                    <ApplicationLogo className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-500">HUMO</p>
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
