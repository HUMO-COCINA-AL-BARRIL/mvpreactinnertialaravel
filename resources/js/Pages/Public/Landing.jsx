import axios from 'axios';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductCard from '../../Components/ProductCard';
import SeoHead from '../../Components/SeoHead';
import PublicLayout from '../../Layouts/PublicLayout';

function ToggleButton({ children, active }) {
    return (
        <button
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold shadow-[0_12px_35px_rgba(0,0,0,0.22)] transition duration-200 ${
                active
                    ? 'border-amber-300 bg-[linear-gradient(135deg,#f59e0b_0%,#fbbf24_100%)] text-black'
                    : 'border-white/10 bg-white text-neutral-900 hover:-translate-y-0.5 hover:border-amber-300'
            }`}
        >
            {children}
        </button>
    );
}

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

function StarRating({ value, onChange, interactive = false, size = 'h-5 w-5' }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starValue) => {
                const active = starValue <= Number(value);

                if (interactive) {
                    return (
                        <button
                            key={starValue}
                            type="button"
                            onClick={() => onChange(starValue)}
                            className={`rounded-full p-1 transition ${active ? 'text-amber-300' : 'text-neutral-600 hover:text-amber-200'}`}
                            aria-label={`${starValue} estrellas`}
                        >
                            <Star className={size} fill="currentColor" />
                        </button>
                    );
                }

                return (
                    <Star
                        key={starValue}
                        className={`${size} ${active ? 'text-amber-300' : 'text-neutral-600'}`}
                        fill="currentColor"
                    />
                );
            })}
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

export default function Landing({
    featuredCategories = [],
    featuredProducts = [],
    moments: initialMoments = [],
}) {
    const [moments, setMoments] = useState(initialMoments.map((moment) => decorateMoment(moment)));
    const [momentForm, setMomentForm] = useState({
        name: '',
        opinion: '',
        rating: 5,
        images: [],
    });
    const [isSubmittingMoment, setIsSubmittingMoment] = useState(false);
    const [pendingActions, setPendingActions] = useState({});
    const touchStartX = useRef({});

    useEffect(() => {
        return () => {
            momentForm.images.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(image.preview);
                }
            });
        };
    }, [momentForm.images]);

    const averageRating = moments.length
        ? (moments.reduce((sum, moment) => sum + Number(moment.rating || 0), 0) / moments.length).toFixed(1)
        : '5.0';

    const totalComments = moments.reduce((sum, moment) => sum + Number(moment.comments_count || 0), 0);

    const setActionPending = (key, value) => {
        setPendingActions((currentState) => ({
            ...currentState,
            [key]: value,
        }));
    };

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

    const handleMomentSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = momentForm.name.trim();
        const trimmedOpinion = momentForm.opinion.trim();

        if (!trimmedName || !trimmedOpinion) {
            toast.error('Completa tu nombre y tu opinion para publicar el momento.');
            return;
        }

        setIsSubmittingMoment(true);

        try {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('caption', trimmedOpinion);
            formData.append('rating', momentForm.rating);
            momentForm.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image.file);
            });

            const response = await axios.post(route('moments.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMoments((currentMoments) => [
                decorateMoment(response.data.moment, { showComments: true }),
                ...currentMoments,
            ].slice(0, 2));
            setMomentForm({
                name: '',
                opinion: '',
                rating: 5,
                images: [],
            });
            toast.success(response.data.message || 'Tu momento ya aparece en el feed.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo publicar el momento.');
        } finally {
            setIsSubmittingMoment(false);
        }
    };

    const handleMomentImagesChange = (files) => {
        momentForm.images.forEach((image) => {
            if (image.preview) {
                URL.revokeObjectURL(image.preview);
            }
        });

        const nextImages = Array.from(files || []).slice(0, 6).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            id: `${file.name}-${file.size}-${file.lastModified}`,
        }));

        setMomentForm((currentForm) => ({
            ...currentForm,
            images: nextImages,
        }));
    };

    const handleRemoveSelectedImage = (indexToRemove) => {
        setMomentForm((currentForm) => ({
            ...currentForm,
            images: currentForm.images.filter((image, index) => {
                if (index === indexToRemove && image.preview) {
                    URL.revokeObjectURL(image.preview);
                }

                return index !== indexToRemove;
            }),
        }));
    };

    const handleLikeToggle = async (momentId) => {
        const actionKey = `like-${momentId}`;
        setActionPending(actionKey, true);

        try {
            const response = await axios.post(route('moments.reactions.toggle', momentId), {
                type: 'like',
            });

            syncMomentFromServer(response.data.moment);
        } catch (error) {
            toast.error('No se pudo actualizar el like.');
        } finally {
            setActionPending(actionKey, false);
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

        const actionKey = `comment-${momentId}`;
        setActionPending(actionKey, true);

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
        } catch (error) {
            toast.error('No se pudo publicar el comentario.');
        } finally {
            setActionPending(actionKey, false);
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
        } catch (error) {
            // Si el portapapeles falla, mostramos una notificacion alternativa.
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
                title="Asados al barril en Manizales"
                description="HUMO Cocina al Barril en Manizales con carnes al barril, reservas, domicilios, menu digital y momentos reales compartidos por clientes."
                canonical={route('landing')}
                image="/images/humo_hero.png"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'Restaurant',
                    name: 'HUMO Cocina al Barril',
                    image: [`${window.location.origin}/images/humo_hero.png`],
                    servesCuisine: ['Asados', 'Carnes al barril', 'Parrilla'],
                    priceRange: '$$',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Carrera 23 #74-114, sector El Perro',
                        addressLocality: 'Manizales',
                        addressCountry: 'CO',
                    },
                    telephone: '+57 300 123 4567',
                    url: route('landing'),
                }}
            />

            <PublicLayout>
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-neutral-900" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
                        <div>
                            <span className="mb-5 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400">
                                Cocina al barril en Manizales
                            </span>

                            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
                                La mejor experiencia en asados al barril
                            </h1>

                            <p className="mb-8 max-w-xl text-lg leading-relaxed text-neutral-300">
                                En HUMO vivimos la carne con fuego lento, sabor intenso y una experiencia pensada para compartir. Costillas, chicharron, carnes al barril, picadas, reservas y pedidos para llevar.
                            </p>

                            <div className="mb-8 flex flex-wrap gap-4">
                                <ToggleButton active>🔥 Asados al barril</ToggleButton>
                                <ToggleButton>🛵 Domicilios</ToggleButton>
                                <ToggleButton>📍 Manizales</ToggleButton>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <Link
                                    href={route('menu.index')}
                                    className="group inline-flex min-h-[84px] flex-col justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,#f59e0b_0%,#fbbf24_100%)] px-6 py-5 text-black shadow-[0_20px_45px_rgba(245,158,11,0.28)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(245,158,11,0.38)]"
                                >
                                    <span className="text-lg">🍖</span>
                                    <span className="mt-2 text-lg font-black">Ver menu</span>
                                    <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-black/70">Favoritos de la casa</span>
                                </Link>

                                <Link
                                    href={route('reservation.create')}
                                    className="group inline-flex min-h-[84px] flex-col justify-center rounded-[1.75rem] border border-amber-400/35 bg-[linear-gradient(180deg,rgba(245,158,11,0.16)_0%,rgba(245,158,11,0.06)_100%)] px-6 py-5 text-amber-100 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-amber-300/60 hover:bg-amber-400/15"
                                >
                                    <span className="text-lg">🍽️</span>
                                    <span className="mt-2 text-lg font-black text-amber-300">Reservar mesa</span>
                                    <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/70">Planea tu visita</span>
                                </Link>

                                <a
                                    href="https://wa.me/573001234567?text=Hola%20HUMO,%20quiero%20hacer%20un%20pedido"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex min-h-[84px] flex-col justify-center rounded-[1.75rem] bg-[linear-gradient(180deg,#ffffff_0%,#f5f5f5_100%)] px-6 py-5 text-black shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:bg-white"
                                >
                                    <span className="text-lg">💬</span>
                                    <span className="mt-2 text-lg font-black">Pedir por WhatsApp</span>
                                    <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Rapido y directo</span>
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">
                                <img
                                    src="/images/humo_hero.png"
                                    alt="Comida al barril HUMO"
                                    className="h-[520px] w-full object-cover"
                                />
                            </div>

                            <div className="absolute -bottom-6 left-6 right-6 rounded-3xl bg-white p-5 text-black shadow-xl">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-extrabold">{averageRating}</p>
                                        <p className="text-xs text-gray-500">Calificacion</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">{moments.length}</p>
                                        <p className="text-xs text-gray-500">Momentos</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">Fuego</p>
                                        <p className="text-xs text-gray-500">Sabor al barril</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-neutral-900 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-3xl border border-white/10 bg-neutral-800 p-6">
                                <h3 className="mb-3 text-xl font-bold">Especialidad</h3>
                                <p className="text-neutral-300">
                                    Carnes preparadas al barril con coccion lenta, textura jugosa y sabor ahumado.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-neutral-800 p-6">
                                <h3 className="mb-3 text-xl font-bold">Ubicacion</h3>
                                <p className="text-neutral-300">
                                    Manizales, Carrera 23 #74-114, sector El Perro.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-neutral-800 p-6">
                                <h3 className="mb-3 text-xl font-bold">Opciones</h3>
                                <p className="text-neutral-300">
                                    Pide para llevar, reserva tu mesa o solicita domicilio desde el menu digital.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0a0a0a_0%,#151515_100%)] py-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_28%)]" />

                    <div className="relative mx-auto max-w-7xl px-6">
                        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                                    Momentos HUMO
                                </span>
                                <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white">
                                    Un feed de momentos reales creado por quienes visitan HUMO
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-300">
                                    En la landing mostramos solo los dos momentos mas recientes. Si quieres ver el historial completo, entra al feed.
                                </p>
                            </div>

                            <Link
                                href={route('feed.index')}
                                className="inline-flex items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:border-amber-300 hover:bg-amber-400/15 hover:text-amber-200"
                            >
                                Ver feed completo
                            </Link>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

                                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
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
                                                        <p className="text-xs font-semibold text-amber-300">
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
                                                                        ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                                                                        : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:text-white'
                                                                }`}
                                                                aria-label={`Ver paso ${imageIndex + 1}`}
                                                            >
                                                                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                                                                    post.activeImageIndex === imageIndex ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'
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
                                                    <h3 className="text-3xl font-black tracking-tight text-white">{post.title}</h3>
                                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
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
                                                            className={`inline-flex items-center gap-2 text-sm font-semibold transition ${post.showComments ? 'text-amber-300' : 'text-white hover:text-amber-300'}`}
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
                                                                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300 transition hover:text-amber-200"
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
                                                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-amber-400/60"
                                                                    />
                                                                    <textarea
                                                                        rows="3"
                                                                        value={post.commentDraft}
                                                                        onChange={(event) => handleCommentDraftChange(post.id, event.target.value)}
                                                                        placeholder="Deja un comentario sobre este momento"
                                                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-amber-400/60"
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={pendingActions[`comment-${post.id}`]}
                                                                        className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:opacity-60"
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
                                            Publica el primero desde el formulario y empezamos a construir este feed social.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_50%,#ec4899_100%)] text-white shadow-lg">
                                            <Camera className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Comparte tu momento</p>
                                            <p className="text-xs text-neutral-400">Deja tu nombre, opinion y calificacion sin crear cuenta</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <p className="text-2xl font-black text-white">{moments.length}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Momentos</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <p className="text-2xl font-black text-white">{totalComments}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Comentarios</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <p className="text-2xl font-black text-white">{averageRating}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">Calificacion</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleMomentSubmit} className="mt-6 space-y-4">
                                        <div>
                                            <label htmlFor="moment-name" className="mb-2 block text-sm font-semibold text-white">
                                                Nombre
                                            </label>
                                            <input
                                                id="moment-name"
                                                type="text"
                                                value={momentForm.name}
                                                onChange={(event) => setMomentForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                                                placeholder="Ej. Laura G."
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-amber-400/60"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="moment-opinion" className="mb-2 block text-sm font-semibold text-white">
                                                Opinion
                                            </label>
                                            <textarea
                                                id="moment-opinion"
                                                rows="4"
                                                value={momentForm.opinion}
                                                onChange={(event) => setMomentForm((currentForm) => ({ ...currentForm, opinion: event.target.value }))}
                                                placeholder="Cuenta que te gusto de tu visita, pedido o reserva."
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-amber-400/60"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="moment-images" className="mb-2 block text-sm font-semibold text-white">
                                                Imagenes del momento
                                            </label>
                                            <label className="flex cursor-pointer items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-5 text-sm font-semibold text-neutral-300 transition hover:border-amber-400/40 hover:text-white">
                                                <input
                                                    id="moment-images"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(event) => handleMomentImagesChange(event.target.files)}
                                                />
                                                Puedes subir hasta 6 imagenes
                                            </label>

                                            {momentForm.images.length > 0 && (
                                                <div className="mt-3 grid grid-cols-3 gap-3">
                                                    {momentForm.images.map((image, index) => (
                                                        <div key={image.id || index} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                                                            <img
                                                                src={image.preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="h-24 w-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSelectedImage(index)}
                                                                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="mb-3 text-sm font-semibold text-white">Calificacion</p>
                                            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <StarRating
                                                        value={momentForm.rating}
                                                        interactive
                                                        onChange={(rating) => setMomentForm((currentForm) => ({ ...currentForm, rating }))}
                                                    />
                                                    <span className="text-sm font-semibold text-amber-300">
                                                        {momentForm.rating} estrella{momentForm.rating === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingMoment}
                                            className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
                                        >
                                            Publicar momento
                                        </button>
                                    </form>
                                </div>

                                <div className="rounded-[2rem] border border-amber-400/15 bg-amber-400/8 p-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Tu experiencia cuenta</p>
                                    <h3 className="mt-4 text-3xl font-black tracking-tight text-white">
                                        Comentarios y calificaciones que hacen crecer la marca
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-neutral-300">
                                        Si reservaste, pediste a domicilio o viviste la experiencia en mesa, este feed se convierte en una mezcla de prueba social, resenas y contenido fresco creado por clientes reales.
                                    </p>

                                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                                        <p className="text-sm font-semibold text-white">Como funciona</p>
                                        <p className="mt-2 text-sm leading-7 text-neutral-400">
                                            La persona escribe su nombre, deja su opinion, elige estrellas y luego puede seguir interactuando con likes, comentarios y compartir.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {featuredCategories.length > 0 && (
                    <section className="bg-neutral-950 py-16">
                        <div className="mx-auto max-w-7xl px-6">
                            <h2 className="mb-8 text-3xl font-extrabold">Categorias destacadas</h2>

                            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                                {featuredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="rounded-3xl border border-white/10 bg-neutral-900 p-5"
                                    >
                                        <p className="font-bold">{category.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="bg-neutral-100 py-20 text-black">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold text-amber-600">Productos mas pedidos</h2>
                                <p className="mt-2 text-gray-600">Seleccion de la casa disponible hoy.</p>
                            </div>

                            <Link
                                href={route('menu.index')}
                                className="hidden font-semibold text-amber-700 md:inline-flex"
                            >
                                Ver todo el menu
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-black py-20">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-4 text-4xl font-extrabold">Listo para probar HUMO?</h2>

                        <p className="mb-8 text-neutral-300">
                            Consulta el menu, arma tu pedido y finaliza por WhatsApp con los datos de la orden.
                        </p>

                        <Link
                            href={route('menu.index')}
                            className="inline-flex rounded-2xl bg-amber-500 px-12 py-4 font-bold text-black shadow-lg transition hover:bg-amber-400"
                        >
                            Ordenar ahora
                        </Link>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
