import axios from 'axios';
import { Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SeoHead from '../../Components/SeoHead';
import PublicLayout from '../../Layouts/PublicLayout';

const ratingLabels = {
    5: 'Excelente',
    4: 'Muy buena',
    3: 'Buena',
    2: 'Regular',
    1: 'Por mejorar',
};

function formatLikes(likes) {
    if (likes >= 1000) {
        return `${(likes / 1000).toFixed(1).replace('.0', '')}k`;
    }

    return String(likes);
}

function StarRating({ value, size = 'h-5 w-5' }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
                <Star
                    key={starValue}
                    className={`${size} ${starValue <= Number(value) ? '' : 'text-neutral-600'}`}
                    style={starValue <= Number(value) ? { color: 'color-mix(in srgb, var(--brand-primary) 78%, white)' } : undefined}
                    fill="currentColor"
                />
            ))}
        </div>
    );
}

function decorateMoment(moment, currentState = {}) {
    return {
        ...moment,
        likes_count: Number(moment.likes_count || 0),
        comments_count: Number(moment.comments_count || moment.comments?.length || 0),
        comments: moment.comments || [],
        images: moment.images || [],
        activeImageIndex: currentState.activeImageIndex ?? 0,
        showComments: currentState.showComments ?? false,
        commentDraft: currentState.commentDraft ?? '',
        commentNameDraft: currentState.commentNameDraft ?? '',
    };
}

export default function Feed({ moments: initialMoments = [] }) {
    const [moments, setMoments] = useState(initialMoments.map((moment) => decorateMoment(moment)));
    const [pendingActions, setPendingActions] = useState({});
    const touchStartX = useRef({});

    const averageRating = moments.length
        ? (moments.reduce((sum, moment) => sum + Number(moment.rating || 0), 0) / moments.length).toFixed(1)
        : '5.0';

    const totalComments = moments.reduce((sum, moment) => sum + Number(moment.comments_count || 0), 0);

    const updateMoment = (momentId, updater) => {
        setMoments((currentMoments) => currentMoments.map((moment) => (
            moment.id === momentId ? updater(moment) : moment
        )));
    };

    const syncMomentFromServer = (updatedMoment, overrides = {}) => {
        setMoments((currentMoments) => {
            const existingMoment = currentMoments.find((moment) => moment.id === updatedMoment.id);
            const decorated = decorateMoment(updatedMoment, {
                ...existingMoment,
                ...overrides,
            });

            return currentMoments.map((moment) => (
                moment.id === updatedMoment.id ? decorated : moment
            ));
        });
    };

    const handleLikeToggle = async (momentId) => {
        setPendingActions((current) => ({ ...current, [`like-${momentId}`]: true }));

        try {
            const response = await axios.post(route('moments.reactions.toggle', momentId), {
                type: 'like',
            });

            syncMomentFromServer(response.data.moment);
        } catch {
            toast.error('No se pudo actualizar el like.');
        } finally {
            setPendingActions((current) => ({ ...current, [`like-${momentId}`]: false }));
        }
    };

    const handleCommentToggle = (momentId) => {
        updateMoment(momentId, (moment) => ({
            ...moment,
            showComments: !moment.showComments,
        }));
    };

    const handleCommentDraftChange = (momentId, value) => {
        updateMoment(momentId, (moment) => ({
            ...moment,
            commentDraft: value,
        }));
    };

    const handleCommentNameChange = (momentId, value) => {
        updateMoment(momentId, (moment) => ({
            ...moment,
            commentNameDraft: value,
        }));
    };

    const handleCommentSubmit = async (event, momentId) => {
        event.preventDefault();

        const currentMoment = moments.find((moment) => moment.id === momentId);
        const comment = currentMoment?.commentDraft?.trim();

        if (!comment) {
            toast.error('Escribe un comentario antes de publicarlo.');
            return;
        }

        setPendingActions((current) => ({ ...current, [`comment-${momentId}`]: true }));

        try {
            const response = await axios.post(route('moments.comments.store', momentId), {
                name: currentMoment?.commentNameDraft?.trim() || undefined,
                comment,
            });

            syncMomentFromServer(response.data.moment, {
                showComments: true,
                commentDraft: '',
                commentNameDraft: '',
            });
            toast.success(response.data.message || 'Comentario publicado en el feed.');
        } catch {
            toast.error('No se pudo publicar el comentario.');
        } finally {
            setPendingActions((current) => ({ ...current, [`comment-${momentId}`]: false }));
        }
    };

    const handleShare = async (moment) => {
        const shareUrl = moment.share_url;
        const sharePayload = {
            title: `${moment.title} | HUMO Cocina al Barril`,
            text: `${moment.name} compartio este momento en HUMO: ${moment.caption}`,
            url: shareUrl,
        };

        try {
            if (navigator?.share) {
                await navigator.share(sharePayload);
                toast.success('Momento compartido.');
                return;
            }

            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Enlace del momento copiado para compartir.');
                return;
            }
        } catch {
            // Si compartir falla, mantenemos un mensaje amable.
        }

        toast.success('Momento listo para compartir.');
    };

    const handleMomentImageChange = (momentId, nextIndex) => {
        updateMoment(momentId, (moment) => ({
            ...moment,
            activeImageIndex: nextIndex,
        }));
    };

    const handleMomentTouchStart = (momentId, event) => {
        touchStartX.current[momentId] = event.touches[0]?.clientX ?? 0;
    };

    const handleMomentTouchEnd = (moment) => (event) => {
        const startX = touchStartX.current[moment.id];
        const endX = event.changedTouches[0]?.clientX ?? startX;
        const deltaX = startX - endX;

        delete touchStartX.current[moment.id];

        if (moment.images.length <= 1 || Math.abs(deltaX) < 40) {
            return;
        }

        const nextIndex = deltaX > 0
            ? (moment.activeImageIndex === moment.images.length - 1 ? 0 : moment.activeImageIndex + 1)
            : (moment.activeImageIndex === 0 ? moment.images.length - 1 : moment.activeImageIndex - 1);

        handleMomentImageChange(moment.id, nextIndex);
    };

    const showPreviousMomentImage = (moment) => {
        const nextIndex = moment.activeImageIndex === 0 ? moment.images.length - 1 : moment.activeImageIndex - 1;
        handleMomentImageChange(moment.id, nextIndex);
    };

    const showNextMomentImage = (moment) => {
        const nextIndex = moment.activeImageIndex === moment.images.length - 1 ? 0 : moment.activeImageIndex + 1;
        handleMomentImageChange(moment.id, nextIndex);
    };

    return (
        <>
            <SeoHead
                title="Feed de momentos"
                description="Explora el feed de momentos de HUMO Cocina al Barril con publicaciones reales, comentarios y reacciones en orden cronologico."
                canonical={route('feed.index')}
                image="/images/humo_hero.png"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Feed de momentos HUMO Cocina al Barril',
                    url: route('feed.index'),
                    about: 'Momentos compartidos por clientes en HUMO Cocina al Barril',
                }}
            />

            <PublicLayout>
                <section className="relative overflow-hidden bg-[linear-gradient(180deg,#080808_0%,#141414_100%)] py-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />

                    <div className="relative mx-auto max-w-6xl px-6">
                        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <span className="brand-dark-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
                                    Feed HUMO
                                </span>
                                <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
                                    Momentos en orden cronologico
                                </h1>
                                <p className="mt-4 text-base leading-7 text-neutral-300">
                                    Un timeline publico con las cards de los momentos compartidos por clientes, ordenado del mas reciente al mas antiguo.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-2xl font-black text-white">{moments.length}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Momentos</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-2xl font-black text-white">{totalComments}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Comentarios</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-2xl font-black text-white">{averageRating}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Promedio</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 flex items-center justify-between">
                            <Link href={route('landing')} className="brand-dark-button inline-flex rounded-2xl px-4 py-2 text-sm font-semibold">
                                Volver a la landing
                            </Link>
                            <p className="text-sm text-neutral-400">Orden: mas reciente primero</p>
                        </div>

                        <div className="space-y-6">
                            {moments.map((post) => (
                                <article
                                    key={post.id}
                                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-[0_25px_70px_rgba(0,0,0,0.32)]"
                                >
                                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src="/images/logo_humo.jpg" alt="HUMO" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">{post.name}</p>
                                                <p className="text-xs text-neutral-400">{post.tag}</p>
                                            </div>
                                        </div>

                                        <span className="brand-dark-badge rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                            Momento
                                        </span>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <img
                                                src={post.images[post.activeImageIndex]?.url || post.image_url || '/images/humo_hero.png'}
                                                alt={post.title}
                                                className="h-[360px] w-full touch-pan-y object-cover"
                                                onTouchStart={(event) => handleMomentTouchStart(post.id, event)}
                                                onTouchEnd={handleMomentTouchEnd(post)}
                                            />

                                            {post.images.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => showPreviousMomentImage(post)}
                                                        className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg transition hover:bg-black/75 md:flex"
                                                        aria-label="Imagen anterior"
                                                    >
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => showNextMomentImage(post)}
                                                        className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg transition hover:bg-black/75 md:flex"
                                                        aria-label="Imagen siguiente"
                                                    >
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {post.images.length > 1 && (
                                            <div className="border-b border-white/10 bg-black/20 px-5 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                                        <span className="md:hidden">Desliza para cambiar imagen</span>
                                                        <span className="hidden md:inline">Recorre las imagenes del momento</span>
                                                    </p>
                                                    <p className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>
                                                        {post.activeImageIndex + 1} / {post.images.length}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    {post.images.map((image, imageIndex) => (
                                                        <button
                                                            key={image.id || image.url}
                                                            type="button"
                                                            onClick={() => handleMomentImageChange(post.id, imageIndex)}
                                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                                                post.activeImageIndex === imageIndex
                                                                    ? 'brand-dark-badge'
                                                                    : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:text-white'
                                                            }`}
                                                            aria-label={`Ver paso ${imageIndex + 1}`}
                                                        >
                                                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                                                                post.activeImageIndex === imageIndex ? 'brand-button' : 'bg-white/10 text-white'
                                                            }`}>
                                                                {imageIndex + 1}
                                                            </span>
                                                            <span>Paso {imageIndex + 1}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="max-w-3xl">
                                                <h2 className="text-3xl font-black tracking-tight text-white">{post.title}</h2>
                                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>
                                                    {ratingLabels[post.rating] || 'Experiencia'}
                                                </p>
                                                <div className="mt-3">
                                                    <StarRating value={post.rating} size="h-4 w-4" />
                                                </div>
                                                <p className="mt-4 text-sm leading-7 text-neutral-300">{post.caption}</p>
                                            </div>

                                            <div className="mt-6 border-t border-white/10 pt-5">
                                                <div className="flex flex-wrap items-center gap-4 text-white">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLikeToggle(post.id)}
                                                        disabled={pendingActions[`like-${post.id}`]}
                                                        className={`inline-flex items-center gap-2 text-sm font-semibold transition ${post.liked ? 'text-rose-300' : 'text-white hover:text-rose-300'} disabled:opacity-60`}
                                                    >
                                                        <Heart className="h-5 w-5" fill={post.liked ? 'currentColor' : 'none'} />
                                                        {formatLikes(post.likes_count)}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCommentToggle(post.id)}
                                                        className={`inline-flex items-center gap-2 text-sm font-semibold transition ${post.showComments ? '' : 'text-white'}`}
                                                        style={{ color: post.showComments ? 'color-mix(in srgb, var(--brand-primary) 72%, white)' : undefined }}
                                                    >
                                                        <MessageCircle className="h-5 w-5" />
                                                        {post.comments_count}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleShare(post)}
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-sky-300"
                                                    >
                                                        <Send className="h-5 w-5" />
                                                        Compartir
                                                    </button>
                                                </div>

                                                <div className="mt-5 space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Comentarios</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCommentToggle(post.id)}
                                                            className="text-xs font-semibold uppercase tracking-[0.16em] transition"
                                                            style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}
                                                        >
                                                            {post.showComments ? 'Ocultar' : 'Ver'}
                                                        </button>
                                                    </div>

                                                    {post.showComments && (
                                                        <>
                                                            <div className="space-y-3">
                                                                {post.comments.map((comment) => (
                                                                    <div key={comment.id} className="rounded-2xl bg-black/20 px-4 py-3">
                                                                        <p className="text-sm font-semibold text-white">{comment.name}</p>
                                                                        <p className="mt-1 text-sm leading-6 text-neutral-300">{comment.text}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <form onSubmit={(event) => handleCommentSubmit(event, post.id)} className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={post.commentNameDraft}
                                                                    onChange={(event) => handleCommentNameChange(post.id, event.target.value)}
                                                                    placeholder="Tu nombre (opcional)"
                                                                    className="brand-dark-input w-full rounded-2xl px-4 py-3 text-sm transition"
                                                                />
                                                                <textarea
                                                                    rows="3"
                                                                    value={post.commentDraft}
                                                                    onChange={(event) => handleCommentDraftChange(post.id, event.target.value)}
                                                                    placeholder="Deja un comentario sobre este momento"
                                                                    className="brand-dark-input w-full rounded-2xl px-4 py-3 text-sm transition"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={pendingActions[`comment-${post.id}`]}
                                                                    className="brand-dark-button rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
                                                                >
                                                                    Comentar
                                                                </button>
                                                            </form>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {moments.length === 0 && (
                                <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                                    <p className="text-lg font-semibold text-white">Todavia no hay momentos publicados</p>
                                    <p className="mt-2 text-sm text-neutral-400">
                                        Cuando se publiquen nuevos momentos en la landing, apareceran tambien aqui en orden cronologico.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
