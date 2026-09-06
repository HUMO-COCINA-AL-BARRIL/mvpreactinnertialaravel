import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Flame, Bike, MapPin, Utensils, CalendarDays, Camera, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductCard from '../../Components/ProductCard';
import SeoHead, { SITE_URL } from '../../Components/SeoHead';
import PublicLayout from '../../Layouts/PublicLayout';

function HeroTag({ children }) {
    return <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">{children}</span>;
}

function HeroActions() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        if (paused || hovered || focused || reducedMotion) return;
        const timer = window.setTimeout(() => setActive((value) => (value + 1) % 3), 5500);
        return () => window.clearTimeout(timer);
    }, [active, paused, hovered, focused, reducedMotion]);
    const actions = [
        { label: 'Reservar mesa', title: 'Tu próxima buena mesa empieza aquí.', text: 'Haz espacio para compartir. Reserva tu visita y ven a disfrutar del sabor del barril.', href: route('reservation.create'), icon: CalendarDays },
        { label: 'Ver menú', title: 'Encuentra tu próximo antojo.', text: 'Explora nuestros asados y elige los favoritos para tu próxima comida.', href: route('menu.index'), icon: Utensils },
        { label: 'Pedir por WhatsApp', title: 'El sabor de HUMO, donde estés.', text: 'Escríbenos y pide tus favoritos a domicilio en Manizales.', href: 'https://wa.me/573001234567?text=Hola%20HUMO,%20quiero%20hacer%20un%20pedido', icon: MessageCircle, external: true },
    ];
    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
            <div className="mb-5 flex flex-wrap gap-2" aria-label="Qué quieres hacer en HUMO">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return <button key={action.label} type="button" onClick={() => setActive(index)} aria-pressed={active === index}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${active === index ? 'brand-dark-badge' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                        <Icon aria-hidden="true" className="h-4 w-4" />{action.label}
                    </button>;
                })}
            </div>
            <div className="grid">
                {actions.map((action, index) => (
                    <Transition key={action.label} show={active === index} unmount={false}
                        className="col-start-1 row-start-1" aria-hidden={active !== index} inert={active !== index ? '' : undefined}
                        enter="transition duration-500 motion-reduce:transition-none" enterFrom="opacity-0 translate-y-3 motion-reduce:translate-y-0" enterTo="opacity-100 translate-y-0"
                        leave="transition duration-200 motion-reduce:transition-none" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <h2 className="text-2xl font-semibold tracking-tight text-white">{action.title}</h2>
                        <p className="mt-2 min-h-[72px] max-w-lg text-sm leading-6 text-neutral-400">{action.text}</p>
                        {action.external ? (
                            <a href={action.href} target="_blank" rel="noopener noreferrer" className="brand-button mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">{action.label}<ChevronRight aria-hidden="true" className="h-4 w-4" /></a>
                        ) : (
                            <Link href={action.href} className="brand-button mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">{action.label}<ChevronRight aria-hidden="true" className="h-4 w-4" /></Link>
                        )}
                    </Transition>
                ))}
            </div>
            {!reducedMotion && <button type="button" onClick={() => setPaused((value) => !value)} className="mt-4 rounded px-1 py-2 text-xs text-neutral-400 hover:text-white">{paused ? 'Reanudar animación' : 'Pausar animación'}</button>}
        </div>
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
                            className={`rounded-full p-1 transition ${active ? '' : 'text-neutral-600'}`}
                            style={active ? { color: 'color-mix(in srgb, var(--brand-primary) 78%, white)' } : undefined}
                            aria-label={`${starValue} estrellas`}
                        >
                            <Star className={size} fill="currentColor" />
                        </button>
                    );
                }

                return (
                    <Star
                        key={starValue}
                        className={`${size} ${active ? '' : 'text-neutral-600'}`}
                        style={active ? { color: 'color-mix(in srgb, var(--brand-primary) 78%, white)' } : undefined}
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
    const { business } = usePage().props;
    const theme = business?.theme ?? {};
    const sectionTitles = business?.sectionTitles ?? {};
    const brandName = business?.name ?? 'HUMO Cocina al Barril';
    const heroTitle = business?.heroTitle ?? 'La mejor experiencia en asados al barril';
    const defaultHeroDescription = 'El sabor del barril, el calor de una buena mesa. Disfruta nuestros asados en HUMO, reserva para compartir o pide tus favoritos a domicilio en Manizales.';
    const heroDescription = !business?.heroDescription || business.heroDescription === 'Personaliza este espacio con la propuesta de valor principal de tu negocio.' ? defaultHeroDescription : business.heroDescription;
    const heroBadge = business?.heroBadge ?? 'Cocina al barril en tu ciudad';
    const heroImage = business?.heroImage ?? '/images/humo_hero.png';
    const ctaDescription = business?.ctaDescription ?? 'Consulta el menu, arma tu pedido y finaliza por WhatsApp con los datos de la orden.';
    const [moments, setMoments] = useState(initialMoments.map((moment) => decorateMoment(moment)));
    const [momentSlide, setMomentSlide] = useState(0);
    const visibleMoments = moments.length ? [moments[momentSlide % moments.length]] : [];
    const [carouselHovered, setCarouselHovered] = useState(false);
    const [carouselFocused, setCarouselFocused] = useState(false);
    const [momentForm, setMomentForm] = useState({
        name: '',
        opinion: '',
        rating: 5,
        images: [],
    });
    const [showMomentComposer, setShowMomentComposer] = useState(false);
    const [isSubmittingMoment, setIsSubmittingMoment] = useState(false);
    const [pendingActions, setPendingActions] = useState({});
    const touchStartX = useRef({});
    const activeCommentsOpen = visibleMoments[0]?.showComments ?? false;

    useEffect(() => {
        if (moments.length < 2 || carouselHovered || carouselFocused || showMomentComposer || activeCommentsOpen) return;

        const timeout = window.setTimeout(() => {
            setMomentSlide((current) => (current + 1) % moments.length);
        }, 5000);

        return () => window.clearTimeout(timeout);
    }, [momentSlide, moments.length, carouselHovered, carouselFocused, showMomentComposer, activeCommentsOpen]);


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
            ].slice(0, 12));
            setMomentSlide(0);
            setMomentForm({
                name: '',
                opinion: '',
                rating: 5,
                images: [],
            });
            setShowMomentComposer(false);
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
            title: `${moment.title} | ${brandName}`,
            text: `${moment.name} compartio este momento en ${brandName}: ${moment.caption}`,
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
                title={heroTitle}
                description={heroDescription}
                canonical={route('landing')}
                image={heroImage}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'Restaurant',
                    name: brandName,
                    '@id': `${SITE_URL}/#restaurant`,
                    image: [new URL(heroImage, SITE_URL).href],
                    description: heroDescription,
                    hasMenu: `${SITE_URL}/menu`,
                    servesCuisine: ['Asados', 'Carnes al barril', 'Parrilla'],
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: 'Manizales',
                        addressCountry: 'CO',
                    },
                    url: `${SITE_URL}/`,
                }}
            />

            <PublicLayout>
                <section className="relative overflow-hidden" style={{ backgroundColor: theme.sectionBackgroundColor }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-neutral-900" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
                        <div>


                            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
                                {heroTitle}
                            </h1>

                            <p className="mb-8 max-w-xl text-lg leading-relaxed text-neutral-300">
                                {heroDescription}
                            </p>

                            <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2">
                                <HeroTag><Flame aria-hidden="true" className="h-3.5 w-3.5" /> Asados al barril</HeroTag>
                                <HeroTag><Bike aria-hidden="true" className="h-3.5 w-3.5" /> Domicilios</HeroTag>
                                <HeroTag><MapPin aria-hidden="true" className="h-3.5 w-3.5" /> Manizales</HeroTag>
                            </div>

                            <HeroActions />
                        </div>

                        <div className="relative">
                            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">
                                <img
                                    src={heroImage}
                                    alt={`Hero principal de ${brandName}`}
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

                <section className="py-20" style={{ backgroundColor: theme.sectionSurfaceColor }}>
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

                <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0a0a0a_0%,#151515_100%)] py-12 sm:py-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_28%)]" />

                    <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <span className="brand-dark-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
                                    Momentos HUMO
                                </span>
                                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    La buena mesa se comparte
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-300">
                                    Fotos, antojos e historias de nuestra comunidad. Comparte la tuya.
                                </p>
                            </div>

                            <Link
                                href={route('feed.index')}
                                className="brand-dark-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
                            >
                                Ver feed completo
                            </Link>
                        </div>

                        <div className="mx-auto w-full">
                            <div id="compartir-momento" className="mb-6 w-full rounded-2xl border border-white/10 bg-neutral-900 p-4">
                                <button type="button" onClick={() => setShowMomentComposer(true)} aria-haspopup="dialog" className="group flex w-full items-center gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                                    <span className="brand-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full"><Camera className="h-5 w-5" /></span>
                                    <span className="flex-1 rounded-full bg-white/5 px-4 py-3 text-sm text-neutral-300 transition group-hover:bg-white/10">¿Qué tal estuvo tu visita? Comparte tu momento</span>
                                </button>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                                    <p className="text-xs text-neutral-400">{moments.length} momentos · {totalComments} comentarios · {averageRating} ★</p>
                                    <button type="button" onClick={() => setShowMomentComposer(true)} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-white/5"><Camera className="h-4 w-4" /> Foto / Opinión</button>
                                </div>
                            </div>
                            <div className="w-full" role="region" aria-roledescription="carrusel" aria-label="Publicaciones de la comunidad"
                                onMouseEnter={() => setCarouselHovered(true)} onMouseLeave={() => setCarouselHovered(false)}
                                onFocusCapture={() => setCarouselFocused(true)}
                                onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setCarouselFocused(false); }}>
                                {moments.length > 1 && (
                                    <div className="mb-4 flex flex-wrap justify-center gap-1" aria-label="Elegir publicación">
                                        {moments.map((moment, index) => (
                                            <button key={moment.id} type="button" onClick={() => setMomentSlide(index)}
                                                aria-label={`Ver publicación ${index + 1} de ${moment.name}`}
                                                aria-current={momentSlide % moments.length === index ? 'true' : undefined}
                                                className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                                                <span className={`h-2 rounded-full transition-all ${momentSlide % moments.length === index ? 'w-5 bg-amber-400' : 'w-2 bg-white/30'}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            <div className="space-y-5">
                                {visibleMoments.map((post) => (
                                    <article
                                        key={post.id}
                                        className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"
                                    >
                                        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span aria-hidden="true" className="brand-dark-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">{post.name?.trim().slice(0, 2).toUpperCase() || "HU"}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{post.name}</p>
                                                    <p className="text-xs text-neutral-400">{post.tag}</p>
                                                </div>
                                            </div>

                                            <span className="brand-dark-badge shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                Momento
                                            </span>
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <img
                                                    src={post.images[post.activeImageIndex]?.url || post.image_url || '/images/humo_hero.png'}
                                                    alt={post.title}
                                                    className="aspect-square max-h-[600px] w-full touch-pan-y object-cover"
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
                                                <div className="flex items-center justify-center gap-1 border-b border-white/10 py-1">
                                                    {post.images.map((image, imageIndex) => (
                                                        <button key={image.id || image.url} type="button"
                                                            onClick={() => handleMomentImageChange(post.id, imageIndex)}
                                                            aria-label={`Ver imagen ${imageIndex + 1}`}
                                                            aria-pressed={post.activeImageIndex === imageIndex}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                                                            <span className={`h-1.5 rounded-full transition-all ${post.activeImageIndex === imageIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="p-4 sm:p-5">
                                                <div className="max-w-3xl">
                                                    <h3 className="text-lg font-semibold tracking-tight text-white">{post.title}</h3>
                                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>
                                                        {ratingLabels[post.rating] || 'Experiencia'}
                                                    </p>
                                                    <div className="mt-3">
                                                        <StarRating value={post.rating} size="h-4 w-4" />
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 text-neutral-300">{post.caption}</p>
                                                </div>

                                                <div className="mt-4 border-t border-white/10 pt-4">
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
                                                            style={post.showComments ? { color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' } : undefined}
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

                                                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
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
                                            Publica el primero desde el formulario y empezamos a construir este feed social.
                                        </p>
                                    </div>
                                )}
                            </div>

                            </div>
                            <Dialog open={showMomentComposer} onClose={() => { if (!isSubmittingMoment) setShowMomentComposer(false); }} className="relative z-[70]"
                                style={{ '--brand-primary': theme.primaryButtonColor ?? '#f59e0b', '--brand-primary-text': theme.primaryButtonTextColor ?? '#000000' }}>
                                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
                                <div className="fixed inset-0 overflow-y-auto">
                                    <div className="flex min-h-full items-center justify-center p-4">
                                        <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-white shadow-2xl">
                                            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                                                <div>
                                                    <Dialog.Title className="text-lg font-semibold">Crear publicación</Dialog.Title>
                                                    <Dialog.Description className="mt-1 text-xs text-neutral-400">Comparte tu momento. Sin crear cuenta.</Dialog.Description>
                                                </div>
                                                <button type="button" onClick={() => setShowMomentComposer(false)} disabled={isSubmittingMoment} aria-label="Cerrar publicación" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50">
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                    <form onSubmit={handleMomentSubmit} className="space-y-4 p-5 sm:p-6">
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
                                                className="brand-dark-input w-full rounded-2xl px-4 py-3 text-sm transition"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="moment-opinion" className="mb-2 block text-sm font-semibold text-white">
                                                Opinión
                                            </label>
                                            <textarea
                                                id="moment-opinion"
                                                rows="3"
                                                value={momentForm.opinion}
                                                onChange={(event) => setMomentForm((currentForm) => ({ ...currentForm, opinion: event.target.value }))}
                                                placeholder="¿Qué tal estuvo tu visita?"
                                                className="brand-dark-input w-full rounded-2xl px-4 py-3 text-sm transition"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="moment-images" className="mb-2 block text-sm font-semibold text-white">
                                                Imágenes del momento
                                            </label>
                                            <label className="brand-dark-button focus-within:ring-2 focus-within:ring-amber-400 flex cursor-pointer items-center justify-center rounded-[1.5rem] border border-dashed px-4 py-5 text-sm font-semibold">
                                                <input
                                                    id="moment-images"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="sr-only"
                                                    onChange={(event) => handleMomentImagesChange(event.target.files)}
                                                />
                                                Añadir fotos · máximo 6
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
                                                                aria-label={`Eliminar foto ${index + 1}`}
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
                                            <p className="mb-3 text-sm font-semibold text-white">Calificación</p>
                                            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <StarRating
                                                        value={momentForm.rating}
                                                        interactive
                                                        onChange={(rating) => setMomentForm((currentForm) => ({ ...currentForm, rating }))}
                                                    />
                                                    <span className="text-sm font-semibold" style={{ color: 'color-mix(in srgb, var(--brand-primary) 72%, white)' }}>
                                                        {momentForm.rating} estrella{momentForm.rating === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingMoment}
                                            className="brand-button w-full rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-60"
                                        >
                                            {isSubmittingMoment ? 'Publicando…' : 'Publicar momento'}
                                        </button>
                                    </form>
                                        </Dialog.Panel>
                                    </div>
                                </div>
                            </Dialog>

                        </div>
                    </div>
                </section>

                {featuredCategories.length > 0 && (
                    <section className="py-16" style={{ backgroundColor: theme.sectionBackgroundColor }}>
                        <div className="mx-auto max-w-7xl px-6">
                            <h2 className="mb-8 text-3xl font-extrabold">{sectionTitles.featuredCategories || 'Categorias destacadas'}</h2>

                            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                                {featuredCategories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={route('menu.index', { category: category.slug })}
                                        className="group relative flex min-h-[140px] items-end overflow-hidden rounded-2xl border border-white/10 bg-neutral-800 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 sm:min-h-[170px]"
                                    >
                                        {category.image_url && (
                                            <img src={category.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                                        )}
                                        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                        <div className="relative flex w-full items-end justify-between gap-3 text-white">
                                            <div>
                                                <p className="text-base font-semibold leading-tight">{category.name}</p>
                                                <p className="mt-1.5 text-xs text-white/75">Explorar menú</p>
                                            </div>
                                            <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-20 text-black" style={{ backgroundColor: '#f5f1ea' }}>
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold" style={{ color: theme.primaryButtonColor }}>{sectionTitles.featuredProducts || 'Productos mas pedidos'}</h2>
                                <p className="mt-2 text-gray-600">Seleccion de la casa disponible hoy.</p>
                            </div>

                            <Link
                                href={route('menu.index')}
                                className="brand-auth-link hidden font-semibold md:inline-flex"
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

                <section className="py-20" style={{ backgroundColor: theme.ctaBackgroundColor }}>
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-4 text-4xl font-extrabold">{sectionTitles.cta || `Listo para probar ${brandName}?`}</h2>

                        <p className="mb-8 text-neutral-300">
                            {ctaDescription}
                        </p>

                        <Link
                            href={route('menu.index')}
                            className="brand-button inline-flex rounded-2xl px-12 py-4 font-bold shadow-lg"
                        >
                            Ordenar ahora
                        </Link>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}
