<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Moment;
use App\Models\MomentComment;
use App\Models\MomentReaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminMomentController extends Controller
{
    public function index(): Response
    {
        $moments = Moment::query()
            ->with([
                'comments' => fn ($query) => $query->latest(),
                'images',
            ])
            ->withCount([
                'comments',
                'likeReactions as likes_count',
            ])
            ->latest()
            ->limit(50)
            ->get()
            ->map(function (Moment $moment) {
                $imageUrl = $moment->images->first()?->url ?: ($moment->image_path ?: '/images/humo_hero.png');

                return [
                    'id' => $moment->id,
                    'name' => $moment->name,
                    'title' => $moment->title,
                    'tag' => $moment->tag,
                    'caption' => $moment->caption,
                    'rating' => (int) $moment->rating,
                    'image_url' => $imageUrl,
                    'images_count' => $moment->images->count(),
                    'comments_count' => (int) $moment->comments_count,
                    'likes_count' => (int) $moment->likes_count,
                    'share_url' => route('moments.show', $moment),
                    'created_at' => optional($moment->created_at)?->toISOString(),
                    'created_at_label' => optional($moment->created_at)?->diffForHumans(),
                    'comments_preview' => $moment->comments->take(3)->map(fn ($comment) => [
                        'id' => $comment->id,
                        'name' => $comment->name,
                        'comment' => $comment->comment,
                        'created_at' => optional($comment->created_at)?->toISOString(),
                    ])->values(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Moments/Index', [
            'stats' => [
                'moments' => Moment::count(),
                'comments' => MomentComment::count(),
                'likes' => MomentReaction::query()->where('type', MomentReaction::TYPE_LIKE)->count(),
                'averageRating' => round((float) (Moment::avg('rating') ?? 0), 1),
            ],
            'moments' => $moments,
        ]);
    }

    public function destroy(Moment $moment): RedirectResponse
    {
        foreach ($moment->images as $image) {
            if ($this->shouldDeleteStoredPath($image->path)) {
                Storage::disk('public')->delete($image->path);
            }
        }

        if ($this->shouldDeleteStoredPath($moment->image_path)) {
            Storage::disk('public')->delete($moment->image_path);
        }

        $moment->delete();

        return back()->with('success', 'Momento eliminado correctamente.');
    }

    private function shouldDeleteStoredPath(?string $path): bool
    {
        return filled($path)
            && ! str_starts_with($path, '/')
            && ! str_starts_with($path, 'http://')
            && ! str_starts_with($path, 'https://');
    }
}
