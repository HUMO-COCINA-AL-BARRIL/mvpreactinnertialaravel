import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageUploadField from '@/Components/ImageUploadField';
import InputError from '@/Components/InputError';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronRight,
    Eye,
    Layers3,
    Image as ImageIcon,
    LayoutPanelTop,
    PaintBucket,
    Sparkles,
    SwatchBook,
    Type,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const palettePresets = [
    {
        id: 'ember',
        name: 'Ember Night',
        description: 'Calido, premium y enfocado en gastronomia.',
        colors: {
            navbar_background_color: '#171717',
            navbar_text_color: '#f8fafc',
            primary_button_color: '#f59e0b',
            primary_button_text_color: '#111111',
            section_background_color: '#09090b',
            section_surface_color: '#18181b',
            cta_background_color: '#111827',
        },
    },
    {
        id: 'ocean',
        name: 'Ocean Slate',
        description: 'Moderno, limpio y orientado a tecnologia o servicios.',
        colors: {
            navbar_background_color: '#eff6ff',
            navbar_text_color: '#0f172a',
            primary_button_color: '#0ea5e9',
            primary_button_text_color: '#f8fafc',
            section_background_color: '#0f172a',
            section_surface_color: '#1e293b',
            cta_background_color: '#082f49',
        },
    },
    {
        id: 'forest',
        name: 'Forest Gold',
        description: 'Sobrio, natural y con caracter de marca artesanal.',
        colors: {
            navbar_background_color: '#f7fee7',
            navbar_text_color: '#14532d',
            primary_button_color: '#65a30d',
            primary_button_text_color: '#f7fee7',
            section_background_color: '#052e16',
            section_surface_color: '#14532d',
            cta_background_color: '#1a2e05',
        },
    },
];

const steps = [
    { key: 'brand', label: 'Marca', icon: ImageIcon, eyebrow: 'Base visual', title: 'Logo, hero y nombre principal' },
    { key: 'palette', label: 'Paleta', icon: SwatchBook, eyebrow: 'Direccion visual', title: 'Elige un look inicial o usa custom' },
    { key: 'content', label: 'Textos', icon: Type, eyebrow: 'Contenido', title: 'Titulos y mensajes principales' },
    { key: 'preview', label: 'Preview', icon: Eye, eyebrow: 'Revision final', title: 'Asi se vera publico y admin' },
];

function Field({ label, error, children, hint = null }) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
            <div className="mt-2">{children}</div>
            <InputError message={error} className="mt-2" />
        </label>
    );
}

function TextInput(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-400 ${props.className || ''}`}
        />
    );
}

function TextArea(props) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-400 ${props.className || ''}`}
        />
    );
}

function ColorField({ label, value, onChange, error }) {
    return (
        <Field label={label} error={error}>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <input type="color" value={value} onChange={onChange} className="h-11 w-14 rounded-xl border-0 bg-transparent p-0" />
                <TextInput value={value} onChange={onChange} className="py-2.5" />
            </div>
        </Field>
    );
}

function PaletteCard({ palette, active, onSelect }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
                active
                    ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
                    : 'border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-black tracking-tight">{palette.name}</p>
                    <p className={`mt-2 text-sm leading-6 ${active ? 'text-white/70' : 'text-slate-500'}`}>{palette.description}</p>
                </div>
                {active && (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950">
                        <Check className="h-4 w-4" />
                    </span>
                )}
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">
                {Object.values(palette.colors).map((color) => (
                    <span
                        key={color}
                        className="h-11 rounded-2xl border border-black/5"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </button>
    );
}

function PreviewBrowser({ title, children }) {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-5 py-3">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
                <span className="text-xs text-slate-400">Preview</span>
            </div>
            {children}
        </div>
    );
}

export default function Wizard({ auth, customization }) {
    const { business } = usePage().props;
    const [activeStep, setActiveStep] = useState(0);
    const [selectedPalette, setSelectedPalette] = useState('custom');
    const [logoPreview, setLogoPreview] = useState(customization.logoUrl);
    const [heroPreview, setHeroPreview] = useState(customization.heroImageUrl);
    const [saveState, setSaveState] = useState(customization.setupCompleted ? 'Cambios listos para guardarse.' : 'Completa el setup para publicar tu tema y entrar al dashboard.');
    const [hasPendingMediaChanges, setHasPendingMediaChanges] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const skipFirstAutosave = useRef(true);
    const autosaveTimeout = useRef(null);
    const isFinalSubmitInProgress = useRef(false);
    const form = useForm({
        _method: 'put',
        business_name: customization.businessName || '',
        closed_message: customization.closedMessage || '',
        hero_badge: customization.heroBadge || '',
        hero_title: customization.heroTitle || '',
        hero_description: customization.heroDescription || '',
        featured_categories_title: customization.featuredCategoriesTitle || '',
        featured_products_title: customization.featuredProductsTitle || '',
        cta_title: customization.ctaTitle || '',
        cta_description: customization.ctaDescription || '',
        navbar_background_color: customization.navbarBackgroundColor || '#ffffff',
        navbar_text_color: customization.navbarTextColor || '#111827',
        primary_button_color: customization.primaryButtonColor || '#f59e0b',
        primary_button_text_color: customization.primaryButtonTextColor || '#000000',
        section_background_color: customization.sectionBackgroundColor || '#0a0a0a',
        section_surface_color: customization.sectionSurfaceColor || '#171717',
        cta_background_color: customization.ctaBackgroundColor || '#111111',
        logo: null,
        hero_image: null,
        remove_logo: false,
        remove_hero_image: false,
        complete_setup: false,
        silent_save: false,
    });

    useEffect(() => () => {
        if (logoPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        if (heroPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(heroPreview);
        }
    }, [logoPreview, heroPreview]);

    useEffect(() => {
        const matchedPalette = palettePresets.find((palette) => (
            Object.entries(palette.colors).every(([key, value]) => form.data[key] === value)
        ));

        setSelectedPalette(matchedPalette?.id || 'custom');
    }, [
        form.data.navbar_background_color,
        form.data.navbar_text_color,
        form.data.primary_button_color,
        form.data.primary_button_text_color,
        form.data.section_background_color,
        form.data.section_surface_color,
        form.data.cta_background_color,
    ]);

    useEffect(() => {
        setHasPendingMediaChanges(Boolean(form.data.logo || form.data.hero_image));
    }, [form.data.logo, form.data.hero_image]);

    useEffect(() => () => {
        if (autosaveTimeout.current) {
            clearTimeout(autosaveTimeout.current);
        }
    }, []);

    const applyPalette = (palette) => {
        Object.entries(palette.colors).forEach(([key, value]) => {
            form.setData(key, value);
        });
        setSelectedPalette(palette.id);
    };

    const buildDraftPayload = () => ({
        business_name: form.data.business_name,
        closed_message: form.data.closed_message,
        hero_badge: form.data.hero_badge,
        hero_title: form.data.hero_title,
        hero_description: form.data.hero_description,
        featured_categories_title: form.data.featured_categories_title,
        featured_products_title: form.data.featured_products_title,
        cta_title: form.data.cta_title,
        cta_description: form.data.cta_description,
        navbar_background_color: form.data.navbar_background_color,
        navbar_text_color: form.data.navbar_text_color,
        primary_button_color: form.data.primary_button_color,
        primary_button_text_color: form.data.primary_button_text_color,
        section_background_color: form.data.section_background_color,
        section_surface_color: form.data.section_surface_color,
        cta_background_color: form.data.cta_background_color,
        remove_logo: form.data.remove_logo,
        remove_hero_image: form.data.remove_hero_image,
        complete_setup: false,
        silent_save: true,
    });

    const autoSaveDraft = () => {
        if (isFinalSubmitInProgress.current || form.processing) {
            return;
        }

        setSaveState(hasPendingMediaChanges ? 'Guardando colores y textos. Las imagenes se publican al completar.' : 'Guardando borrador...');

        router.put(route('admin.customization.update'), buildDraftPayload(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                form.clearErrors();
                setSaveState(hasPendingMediaChanges ? 'Borrador guardado. Completa el setup para subir las imagenes.' : 'Borrador guardado automaticamente.');
            },
            onError: (errors) => {
                form.setError(errors);
                setSaveState('Hay datos pendientes por corregir antes de guardar.');
            },
        });
    };

    useEffect(() => {
        if (skipFirstAutosave.current) {
            skipFirstAutosave.current = false;
            return;
        }

        if (autosaveTimeout.current) {
            clearTimeout(autosaveTimeout.current);
        }

        autosaveTimeout.current = setTimeout(() => {
            autoSaveDraft();
        }, 700);

        return () => {
            if (autosaveTimeout.current) {
                clearTimeout(autosaveTimeout.current);
            }
        };
    }, [
        form.data.business_name,
        form.data.closed_message,
        form.data.hero_badge,
        form.data.hero_title,
        form.data.hero_description,
        form.data.featured_categories_title,
        form.data.featured_products_title,
        form.data.cta_title,
        form.data.cta_description,
        form.data.navbar_background_color,
        form.data.navbar_text_color,
        form.data.primary_button_color,
        form.data.primary_button_text_color,
        form.data.section_background_color,
        form.data.section_surface_color,
        form.data.cta_background_color,
        form.data.remove_logo,
        form.data.remove_hero_image,
        hasPendingMediaChanges,
    ]);

    const submit = (event) => {
        event.preventDefault();
        isFinalSubmitInProgress.current = true;
        setIsPublishing(true);
        setSaveState('Publicando personalizacion y redirigiendo al dashboard...');
        router.post(route('admin.customization.update'), {
            ...form.data,
            _method: 'put',
            complete_setup: 1,
            silent_save: false,
        }, {
            forceFormData: true,
            onFinish: () => {
                isFinalSubmitInProgress.current = false;
                setIsPublishing(false);
            },
        });
    };

    const previewTheme = {
        '--brand-navbar-bg': form.data.navbar_background_color,
        '--brand-navbar-text': form.data.navbar_text_color,
        '--brand-primary': form.data.primary_button_color,
        '--brand-primary-text': form.data.primary_button_text_color,
        '--brand-section-bg': form.data.section_background_color,
        '--brand-surface-bg': form.data.section_surface_color,
        '--brand-cta-bg': form.data.cta_background_color,
    };

    const currentStep = steps[activeStep];
    const businessName = form.data.business_name || 'Tu negocio';
    const heroTitle = form.data.hero_title || 'Titulo principal';
    const heroDescription = form.data.hero_description || 'Descripcion principal de la propuesta de valor.';
    const heroBadge = form.data.hero_badge || 'Badge del hero';
    const ctaTitle = form.data.cta_title || 'Titulo final';
    const ctaDescription = form.data.cta_description || 'Descripcion de cierre para empujar la accion principal.';

    return (
        <AuthenticatedLayout
            user={auth.user}
            themeOverride={{
                navbarBackgroundColor: form.data.navbar_background_color,
                navbarTextColor: form.data.navbar_text_color,
                primaryButtonColor: form.data.primary_button_color,
                primaryButtonTextColor: form.data.primary_button_text_color,
                sectionBackgroundColor: form.data.section_background_color,
                sectionSurfaceColor: form.data.section_surface_color,
                ctaBackgroundColor: form.data.cta_background_color,
            }}
            businessNameOverride={businessName}
            logoOverride={logoPreview || business.logo}
            header={(
                <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,#fde68a_0%,#fff8eb_18%,#ffffff_52%,#e0e7ff_100%)] px-6 py-7 shadow-[0_28px_80px_rgba(15,23,42,0.1)] sm:px-8">
                    <div className="pointer-events-none absolute -left-12 top-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
                    <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />
                    <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <span className="inline-flex rounded-full border border-amber-400 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700 shadow-sm backdrop-blur">
                                {customization.setupCompleted ? 'Customization Studio' : 'Setup Studio'}
                            </span>
                            <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-950 md:text-[3.35rem] md:leading-[1.02]">
                                {customization.setupCompleted ? 'Renueva el look de tu instalacion' : 'Configura tu marca con un wizard moderno'}
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-[1.05rem]">
                                Define branding, colores, hero y textos en un solo flujo. Al final veras un preview realista de las vistas publicas y del dashboard admin antes de guardar.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index === activeStep;
                                const isCompleted = index < activeStep;

                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        onClick={() => setActiveStep(index)}
                                        className={`min-h-[148px] rounded-[1.65rem] border px-4 py-4 text-left transition ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-950 text-white shadow-[0_22px_60px_rgba(15,23,42,0.24)]'
                                                : 'border-white/80 bg-white/85 text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                                                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                            </span>
                                            <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? 'text-white/55' : 'text-slate-400'}`}>
                                                0{index + 1}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-sm font-bold">{step.label}</p>
                                        <p className={`mt-1 text-xs leading-5 ${isActive ? 'text-white/65' : 'text-slate-500'}`}>{step.eyebrow}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title="Customization" />

            <div className="bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f8fafc_38%,#f6f2e9_100%)] pb-14 pt-2">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                        <currentStep.icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{currentStep.eyebrow}</p>
                                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{currentStep.title}</h2>
                                    </div>
                                </div>
                            </div>

                            {activeStep === 0 && (
                                <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                                        <Field label="Nombre del negocio" error={form.errors.business_name} hint="Este nombre aparecera en header, admin y metadatos base.">
                                            <TextInput value={form.data.business_name} onChange={(e) => form.setData('business_name', e.target.value)} />
                                        </Field>

                                        <Field label="Badge del hero" error={form.errors.hero_badge} hint="Una frase corta que da contexto visual al hero.">
                                            <TextInput value={form.data.hero_badge} onChange={(e) => form.setData('hero_badge', e.target.value)} />
                                        </Field>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <ImageUploadField
                                            label="Logo principal"
                                            layout="vertical"
                                            preview={logoPreview}
                                            fileName={form.data.logo?.name || null}
                                            error={form.errors.logo}
                                            currentText="Logo actual cargado."
                                            onFileChange={(file) => {
                                                if (logoPreview?.startsWith('blob:')) {
                                                    URL.revokeObjectURL(logoPreview);
                                                }

                                                form.setData('logo', file);
                                                form.setData('remove_logo', false);
                                                setHasPendingMediaChanges(Boolean(file));
                                                setSaveState(file ? 'Logo listo. Se subira al completar la personalizacion.' : 'Borrador actualizado.');
                                                setLogoPreview(file ? URL.createObjectURL(file) : customization.logoUrl);
                                            }}
                                            onClear={() => {
                                                if (logoPreview?.startsWith('blob:')) {
                                                    URL.revokeObjectURL(logoPreview);
                                                }

                                                form.setData('logo', null);
                                                form.setData('remove_logo', true);
                                                setHasPendingMediaChanges(false);
                                                setSaveState('La eliminacion del logo se guardara en el borrador.');
                                                setLogoPreview(null);
                                            }}
                                        />

                                        <ImageUploadField
                                            label="Hero principal"
                                            layout="vertical"
                                            preview={heroPreview}
                                            fileName={form.data.hero_image?.name || null}
                                            error={form.errors.hero_image}
                                            currentText="Hero actual cargado."
                                            onFileChange={(file) => {
                                                if (heroPreview?.startsWith('blob:')) {
                                                    URL.revokeObjectURL(heroPreview);
                                                }

                                                form.setData('hero_image', file);
                                                form.setData('remove_hero_image', false);
                                                setHasPendingMediaChanges(Boolean(file));
                                                setSaveState(file ? 'Hero listo. Se subira al completar la personalizacion.' : 'Borrador actualizado.');
                                                setHeroPreview(file ? URL.createObjectURL(file) : customization.heroImageUrl);
                                            }}
                                            onClear={() => {
                                                if (heroPreview?.startsWith('blob:')) {
                                                    URL.revokeObjectURL(heroPreview);
                                                }

                                                form.setData('hero_image', null);
                                                form.setData('remove_hero_image', true);
                                                setHasPendingMediaChanges(false);
                                                setSaveState('La eliminacion del hero se guardara en el borrador.');
                                                setHeroPreview(null);
                                            }}
                                        />
                                    </div>

                                    <Field label="Mensaje cuando el negocio esta cerrado" error={form.errors.closed_message}>
                                        <TextInput value={form.data.closed_message} onChange={(e) => form.setData('closed_message', e.target.value)} />
                                    </Field>
                                </div>
                            )}

                            {activeStep === 1 && (
                                <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                    <div className="grid gap-4 xl:grid-cols-3">
                                        {palettePresets.map((palette) => (
                                            <PaletteCard
                                                key={palette.id}
                                                palette={palette}
                                                active={selectedPalette === palette.id}
                                                onSelect={() => applyPalette(palette)}
                                            />
                                        ))}
                                    </div>

                                    <div className="rounded-[1.65rem] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                                                <PaintBucket className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Paleta customizable</p>
                                                <p className="text-sm text-slate-500">Si ajustas cualquier color manualmente, el wizard pasa a modo custom.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <ColorField label="Color navbar" value={form.data.navbar_background_color} onChange={(e) => form.setData('navbar_background_color', e.target.value)} error={form.errors.navbar_background_color} />
                                        <ColorField label="Texto navbar" value={form.data.navbar_text_color} onChange={(e) => form.setData('navbar_text_color', e.target.value)} error={form.errors.navbar_text_color} />
                                        <ColorField label="Boton principal" value={form.data.primary_button_color} onChange={(e) => form.setData('primary_button_color', e.target.value)} error={form.errors.primary_button_color} />
                                        <ColorField label="Texto boton principal" value={form.data.primary_button_text_color} onChange={(e) => form.setData('primary_button_text_color', e.target.value)} error={form.errors.primary_button_text_color} />
                                        <ColorField label="Fondo general de secciones" value={form.data.section_background_color} onChange={(e) => form.setData('section_background_color', e.target.value)} error={form.errors.section_background_color} />
                                        <ColorField label="Fondo de tarjetas o superficies" value={form.data.section_surface_color} onChange={(e) => form.setData('section_surface_color', e.target.value)} error={form.errors.section_surface_color} />
                                        <ColorField label="Fondo del cierre o CTA" value={form.data.cta_background_color} onChange={(e) => form.setData('cta_background_color', e.target.value)} error={form.errors.cta_background_color} />
                                    </div>
                                </div>
                            )}

                            {activeStep === 2 && (
                                <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                    <Field label="Titulo principal del hero" error={form.errors.hero_title}>
                                        <TextInput value={form.data.hero_title} onChange={(e) => form.setData('hero_title', e.target.value)} />
                                    </Field>

                                    <Field label="Descripcion del hero" error={form.errors.hero_description}>
                                        <TextArea rows="4" value={form.data.hero_description} onChange={(e) => form.setData('hero_description', e.target.value)} />
                                    </Field>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <Field label="Titulo seccion categorias" error={form.errors.featured_categories_title}>
                                            <TextInput value={form.data.featured_categories_title} onChange={(e) => form.setData('featured_categories_title', e.target.value)} />
                                        </Field>
                                        <Field label="Titulo seccion productos" error={form.errors.featured_products_title}>
                                            <TextInput value={form.data.featured_products_title} onChange={(e) => form.setData('featured_products_title', e.target.value)} />
                                        </Field>
                                    </div>

                                    <Field label="Titulo del CTA final" error={form.errors.cta_title}>
                                        <TextInput value={form.data.cta_title} onChange={(e) => form.setData('cta_title', e.target.value)} />
                                    </Field>

                                    <Field label="Descripcion del CTA final" error={form.errors.cta_description}>
                                        <TextArea rows="4" value={form.data.cta_description} onChange={(e) => form.setData('cta_description', e.target.value)} />
                                    </Field>
                                </div>
                            )}

                            {activeStep === 3 && (
                                <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                    <div className="rounded-[1.65rem] border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#d1fae5_100%)] px-5 py-4">
                                        <div className="flex items-start gap-3">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                                                <Sparkles className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-950">Todo listo para publicar</p>
                                                <p className="mt-1 text-sm leading-6 text-emerald-800">
                                                    Revisa la landing publica y el dashboard admin. Si algo no convence, puedes volver al paso anterior y ajustar antes de guardar.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen de branding</p>
                                            <p className="mt-3 text-xl font-black text-slate-950">{businessName}</p>
                                            <p className="mt-2 text-sm text-slate-600">{heroTitle}</p>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paleta activa</p>
                                            <p className="mt-3 text-xl font-black text-slate-950">
                                                {selectedPalette === 'custom'
                                                    ? 'Custom'
                                                    : palettePresets.find((palette) => palette.id === selectedPalette)?.name}
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                {[
                                                    form.data.navbar_background_color,
                                                    form.data.primary_button_color,
                                                    form.data.section_background_color,
                                                    form.data.section_surface_color,
                                                    form.data.cta_background_color,
                                                ].map((color) => (
                                                    <span key={color} className="h-9 w-9 rounded-2xl border border-black/5" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-800">{saveState}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {hasPendingMediaChanges
                                            ? 'Los cambios de color y textos se guardan solos. Las imagenes nuevas se suben cuando completas la personalizacion.'
                                            : customization.setupCompleted
                                                ? 'Al guardar los cambios volveras al dashboard con la nueva paleta aplicada.'
                                                : 'Cuando completes el setup te llevaremos al dashboard y se habilitaran las demas rutas del admin.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                {activeStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
                                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Volver
                                    </button>
                                )}

                                {activeStep < steps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
                                        className="brand-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold"
                                    >
                                        Continuar
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={form.processing || isPublishing} className="brand-button rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-60">
                                        {form.processing || isPublishing ? 'Guardando...' : customization.setupCompleted ? 'Guardar cambios e ir al dashboard' : 'Completar e ir al dashboard'}
                                    </button>
                                )}

                                {activeStep < steps.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={form.processing || isPublishing}
                                        className="brand-outline-button rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-60"
                                    >
                                        {form.processing || isPublishing ? 'Guardando...' : customization.setupCompleted ? 'Guardar e ir al dashboard' : 'Guardar y completar ahora'}
                                    </button>
                                )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 xl:sticky xl:top-6">
                            <div className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_22px_65px_rgba(15,23,42,0.1)] backdrop-blur">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview en vivo</p>
                                        <p className="mt-2 text-lg font-bold text-slate-950">
                                            {activeStep === 3 ? 'Revision final de vistas publicas y admin' : 'Tu personalizacion se actualiza mientras editas'}
                                        </p>
                                    </div>
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_32px_rgba(15,23,42,0.22)]">
                                        <Layers3 className="h-5 w-5" />
                                    </span>
                                </div>
                                <div className="mt-5 flex items-center gap-2">
                                    {[
                                        form.data.primary_button_color,
                                        form.data.navbar_background_color,
                                        form.data.section_surface_color,
                                    ].map((color) => (
                                        <span key={color} className="h-3.5 w-12 rounded-full" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(248,250,252,0.78)_100%)] p-4 shadow-[0_22px_65px_rgba(15,23,42,0.08)] backdrop-blur md:p-5" style={previewTheme}>
                                <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Publico + admin</p>
                                <p className="px-2 text-sm text-slate-600">
                                    {activeStep === 3 ? 'Revision final de vistas publicas y admin' : 'Tu personalizacion se actualiza mientras editas'}
                                </p>
                                <PreviewBrowser title="Vista publica">
                                    <div className="brand-navbar flex items-center justify-between px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={logoPreview || business.logo} alt="Logo preview" className="h-12 w-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold">{businessName}</p>
                                                <p className="text-sm opacity-70">Landing publica</p>
                                            </div>
                                        </div>
                                        <button type="button" className="brand-button rounded-2xl px-4 py-2 text-sm font-bold shadow-[0_16px_30px_rgba(15,23,42,0.12)]">Ordenar</button>
                                    </div>

                                    <div className="px-5 py-6 text-white" style={{ backgroundColor: form.data.section_background_color }}>
                                        <div className="overflow-hidden rounded-[1.75rem] border border-white/10" style={{ backgroundColor: form.data.section_surface_color }}>
                                            <img src={heroPreview || business.heroImage} alt="Hero preview" className="h-56 w-full object-cover" />
                                            <div className="space-y-4 p-6">
                                                <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: form.data.primary_button_color, color: form.data.primary_button_color }}>
                                                    {heroBadge}
                                                </span>
                                                <h2 className="text-3xl font-black tracking-tight">{heroTitle}</h2>
                                                <p className="text-sm leading-7 text-white/75">{heroDescription}</p>
                                                <div className="flex flex-wrap gap-3">
                                                    <button type="button" className="brand-button rounded-2xl px-5 py-3 text-sm font-bold">Ver menu</button>
                                                    <button type="button" className="rounded-2xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: form.data.primary_button_color, color: form.data.primary_button_color }}>
                                                        Reservar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 py-6 text-white" style={{ backgroundColor: form.data.cta_background_color }}>
                                        <p className="text-xs uppercase tracking-[0.18em] text-white/50">CTA final</p>
                                        <h3 className="mt-3 text-2xl font-black">{ctaTitle}</h3>
                                        <p className="mt-3 text-sm leading-7 text-white/70">{ctaDescription}</p>
                                    </div>
                                </PreviewBrowser>

                                <PreviewBrowser title="Dashboard admin">
                                    <div className="min-h-[420px] bg-[#f5f1ea] p-5">
                                        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                                            <aside className="rounded-[1.75rem] bg-[#171717] p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                                                <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
                                                    <img src={logoPreview || business.logo} alt="Logo sidebar" className="h-12 w-12 rounded-2xl object-cover" />
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.16em] text-white/50">Admin</p>
                                                        <p className="text-sm font-bold">{businessName}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-5 space-y-2">
                                                    {['Dashboard', 'Customization', 'Productos', 'Pedidos'].map((item, index) => (
                                                        <div
                                                            key={item}
                                                            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                                                                index === 1
                                                                    ? 'text-slate-950'
                                                                    : 'text-white/70'
                                                            }`}
                                                            style={index === 1 ? { backgroundColor: form.data.primary_button_color } : undefined}
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </aside>

                                            <div className="space-y-4">
                                                <div className="rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vista general</p>
                                                    <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                                                        <div>
                                                            <h3 className="text-3xl font-black text-slate-950">Dashboard de {businessName}</h3>
                                                            <p className="mt-2 text-sm text-slate-500">Un resumen rapido del negocio con branding consistente.</p>
                                                        </div>
                                                        <button type="button" className="brand-button rounded-2xl px-5 py-3 text-sm font-bold">
                                                            Gestionar productos
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    {[
                                                        { label: 'Productos', value: '24' },
                                                        { label: 'Pedidos', value: '8' },
                                                        { label: 'Momentos', value: '13' },
                                                    ].map((item) => (
                                                        <div key={item.label} className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                                                            <p className="mt-3 text-3xl font-black text-slate-950">{item.value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="rounded-[1.75rem] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]" style={{ backgroundColor: form.data.section_surface_color }}>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Ingresos</p>
                                                            <p className="mt-3 text-3xl font-black">$ 12.800.000</p>
                                                        </div>
                                                        <span
                                                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                                                            style={{ backgroundColor: form.data.primary_button_color, color: form.data.primary_button_text_color }}
                                                        >
                                                            <LayoutPanelTop className="h-5 w-5" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PreviewBrowser>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
