import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Camera, Heart, MessageCircle, Star, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

function StatCard({ title, value, hint, icon: Icon, accent }) {
    return (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function RatingStars({ value }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Number(value) ? 'text-amber-400' : 'text-slate-300'}`}
                    fill="currentColor"
                />
            ))}
        </div>
    );
}

export default function AdminMomentsIndex({ auth, stats, moments = [] }) {
    const form = useForm({});

    const removeMoment = (moment) => {
        if (!window.confirm(`Eliminar el momento de ${moment.name}? Esta accion no se puede deshacer.`)) {
            return;
        }

        form.delete(route('admin.moments.destroy', moment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Momento eliminado correctamente.');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'No se pudo eliminar el momento.');
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(135deg,#fff8eb_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                                Moderacion social
                            </span>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Momentos compartidos</h1>
                            <p className="mt-3 text-base leading-7 text-slate-600">
                                Revisa el contenido generado por clientes, valida la prueba social activa y elimina publicaciones cuando haga falta.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={route('feed.index')}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
                            >
                                Ver feed publico
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('landing')}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                Ir a la landing
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Momentos" />

            <div className="pb-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Momentos" value={stats.moments} hint="Publicaciones visibles en el feed social." icon={Camera} accent="bg-slate-100 text-slate-700" />
                        <StatCard title="Comentarios" value={stats.comments} hint="Conversaciones generadas por los visitantes." icon={MessageCircle} accent="bg-sky-100 text-sky-700" />
                        <StatCard title="Likes" value={stats.likes} hint="Reacciones positivas acumuladas en el feed." icon={Heart} accent="bg-rose-100 text-rose-700" />
                        <StatCard title="Promedio" value={stats.averageRating} hint="Calificacion media de la experiencia compartida." icon={Star} accent="bg-amber-100 text-amber-700" />
                    </section>

                    <section className="space-y-5">
                        {moments.length === 0 && (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                                <p className="text-lg font-bold text-slate-900">Todavia no hay momentos publicados</p>
                                <p className="mt-2 text-sm text-slate-500">Cuando los clientes compartan contenido, aqui podras revisarlo y moderarlo.</p>
                            </div>
                        )}

                        {moments.map((moment) => (
                            <article
                                key={moment.id}
                                className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                            >
                                <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                                    <div className="relative h-full min-h-[240px] bg-slate-100">
                                        <img src={moment.image_url} alt={moment.title} className="h-full w-full object-cover" />
                                        <div className="absolute left-4 top-4 inline-flex rounded-full bg-black/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                                            {moment.images_count} imagen{moment.images_count === 1 ? '' : 'es'}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">{moment.tag}</p>
                                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{moment.title}</h2>
                                                <p className="mt-2 text-sm font-semibold text-slate-700">{moment.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">{moment.created_at_label}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href={moment.share_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Ver publico
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMoment(moment)}
                                                    disabled={form.processing}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center gap-4">
                                            <RatingStars value={moment.rating} />
                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {moment.likes_count} likes
                                            </span>
                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {moment.comments_count} comentarios
                                            </span>
                                        </div>

                                        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{moment.caption}</p>

                                        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-slate-900">Ultimos comentarios</p>
                                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                    {moment.comments_count} en total
                                                </p>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {moment.comments_preview.length === 0 && (
                                                    <p className="text-sm text-slate-500">Este momento todavia no tiene comentarios.</p>
                                                )}

                                                {moment.comments_preview.map((comment) => (
                                                    <div key={comment.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                                                        <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-600">{comment.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
