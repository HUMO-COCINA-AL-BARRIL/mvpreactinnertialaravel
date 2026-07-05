<?php

namespace App\Http\Middleware;

use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $business = BusinessSetting::current();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'business' => [
                'name' => $business->business_name,
                'rating' => 5.0,
                'isOpen' => $business->is_open,
                'closedMessage' => $business->closed_message ?: 'El local esta cerrado en este momento. Vuelve pronto.',
                'logo' => $business->logo_path ? Storage::url($business->logo_path) : '/images/logo_humo.jpg',
                'heroBadge' => $business->hero_badge ?: 'Cocina al barril en tu ciudad',
                'heroTitle' => $business->hero_title ?: 'La mejor experiencia en asados al barril',
                'heroDescription' => $business->hero_description ?: 'Personaliza este espacio con la propuesta de valor principal de tu negocio.',
                'heroImage' => $business->hero_image_path ? Storage::url($business->hero_image_path) : '/images/humo_hero.png',
                'sectionTitles' => [
                    'featuredCategories' => $business->featured_categories_title ?: 'Categorias destacadas',
                    'featuredProducts' => $business->featured_products_title ?: 'Productos mas pedidos',
                    'cta' => $business->cta_title ?: 'Listo para hacer tu pedido?',
                ],
                'ctaDescription' => $business->cta_description ?: 'Consulta el menu, arma tu pedido y finaliza por WhatsApp con los datos de la orden.',
                'theme' => [
                    'navbarBackgroundColor' => $business->navbar_background_color ?: '#ffffff',
                    'navbarTextColor' => $business->navbar_text_color ?: '#111827',
                    'primaryButtonColor' => $business->primary_button_color ?: '#f59e0b',
                    'primaryButtonTextColor' => $business->primary_button_text_color ?: '#000000',
                    'sectionBackgroundColor' => $business->section_background_color ?: '#0a0a0a',
                    'sectionSurfaceColor' => $business->section_surface_color ?: '#171717',
                    'ctaBackgroundColor' => $business->cta_background_color ?: '#111111',
                ],
                'setupCompleted' => (bool) $business->setup_completed_at,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'clearCart' => fn () => $request->session()->get('clear_cart', false),
            ],
        ];
    }
}
