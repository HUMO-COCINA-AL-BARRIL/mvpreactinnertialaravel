<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\MomentResource;
use App\Models\Category;
use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $request->session()->put('moment_feed_active', true);
        $sessionId = $request->session()->getId();
        $moments = Moment::query()
            ->with([
                'comments' => fn ($query) => $query->latest(),
                'images',
                'reactions',
            ])
            ->withCount([
                'comments',
                'likeReactions as likes_count',
            ])
            ->latest()
            ->limit(2)
            ->get()
            ->each(function (Moment $moment) use ($sessionId) {
                $moment->liked = $moment->reactions->contains(
                    fn (MomentReaction $reaction) => $reaction->session_id === $sessionId && $reaction->type === MomentReaction::TYPE_LIKE
                );
            });

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
            'moments' => MomentResource::collection($moments)->resolve(),
        ]);
    }
}
