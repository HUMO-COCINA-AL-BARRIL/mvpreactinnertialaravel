<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $category = $request->string('category')->toString();
        $search = $request->string('search')->toString();

        $products = Product::query()
            ->with('category:id,name,slug')
            ->where('is_available', true)
            ->when($category, fn ($query) => $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category)))
            ->when($search, fn ($query) => $query
                ->where(fn ($inner) => $inner
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')))
            ->orderByDesc('is_featured')
            ->orderBy('name')
            ->get();

        return Inertia::render('Public/Menu', [
            'categories' => Category::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'products' => $products,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
            'featuredProduct' => $products->firstWhere('is_featured', true),
        ]);
    }
}
