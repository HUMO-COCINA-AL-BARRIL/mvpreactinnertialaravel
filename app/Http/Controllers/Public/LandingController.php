<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Public/Landing', [
            'featuredCategories' => Category::query()
                ->where('is_featured', true)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->limit(6)
                ->get(),
            'featuredProducts' => Product::query()
                ->where('is_available', true)
                ->with('category:id,name')
                ->orderByDesc('is_featured')
                ->orderBy('name')
                ->limit(8)
                ->get(),
            'testimonials' => [
                ['name' => 'Maria C.', 'text' => 'La costilla al barril es brutal. Volveremos cada mes.'],
                ['name' => 'Andres G.', 'text' => 'Excelente servicio y pedidos rapidos por WhatsApp.'],
                ['name' => 'Luisa P.', 'text' => 'Ambiente premium y comida espectacular en Manizales.'],
            ],
        ]);
    }
}
