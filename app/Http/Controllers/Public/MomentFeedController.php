<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\MomentResource;
use App\Models\Moment;
use App\Models\MomentReaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MomentFeedController extends Controller
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
            ->get()
            ->each(function (Moment $moment) use ($sessionId) {
                $moment->liked = $moment->reactions->contains(
                    fn (MomentReaction $reaction) => $reaction->session_id === $sessionId && $reaction->type === MomentReaction::TYPE_LIKE
                );
            });

        return Inertia::render('Public/Feed', [
            'moments' => MomentResource::collection($moments)->resolve(),
        ]);
    }
}
