import PublicLayout from '@/Layouts/PublicLayout';
import { Link } from '@inertiajs/react';
import SeoHead from '@/Components/SeoHead';

export default function ReservationThanks({ whatsappLink }) {
    return (
        <>
            <SeoHead
                title="Reserva registrada"
                description="Tu solicitud de reserva en HUMO Cocina al Barril fue registrada correctamente."
                canonical={route('reservation.thanks')}
                image="/images/humo_hero.png"
                robots="noindex,nofollow"
            />

            <PublicLayout>
                <section className="bg-[radial-gradient(circle_at_top,#20170d_0%,#0d0d0d_32%,#050505_100%)] py-20">
                    <div className="mx-auto max-w-3xl px-6">
                        <div className="rounded-[2rem] border border-white/10 bg-white p-10 text-center text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
                            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                Reserva recibida
                            </span>
                            <h1 className="mt-5 text-4xl font-black tracking-tight">Tu solicitud ya quedo registrada</h1>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                Revisaremos la disponibilidad y te confirmaremos lo antes posible. Si quieres acelerar la gestion, puedes abrir WhatsApp con el resumen listo.
                            </p>

                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                {whatsappLink && (
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex justify-center rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
                                    >
                                        Confirmar por WhatsApp
                                    </a>
                                )}
                                <Link href={route('landing')} className="inline-flex justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
