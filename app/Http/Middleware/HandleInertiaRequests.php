<?php

namespace App\Http\Middleware;

use App\Models\BusinessSetting;
use Illuminate\Http\Request;
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
                'logo' => '/images/logo_humo.jpg',
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'clearCart' => fn () => $request->session()->get('clear_cart', false),
            ],
        ];
    }
}
