<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMomentRequest;
use App\Http\Resources\MomentResource;
use App\Models\Moment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MomentController extends Controller
{
    public function store(StoreMomentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $name = trim($data['name']);
        $caption = trim($data['caption']);

        $moment = DB::transaction(function () use ($request, $data, $name, $caption) {
            $moment = Moment::create([
                'name' => $name,
                'title' => str($name)->before(' ')->append(' en HUMO')->value(),
                'tag' => 'Momento compartido',
                'caption' => $caption,
                'rating' => (int) $data['rating'],
                'image_path' => '/images/humo_hero.png',
            ]);

            $moment->comments()->create([
                'name' => $name,
                'comment' => $caption,
            ]);

            foreach ($request->file('images', []) as $index => $image) {
                $moment->images()->create([
                    'path' => $image->store('moments', 'public'),
                    'sort_order' => $index,
                ]);
            }

            return $moment;
        });

        return response()->json([
            'message' => 'Tu momento ya aparece en el feed.',
            'moment' => new MomentResource($this->loadMomentForResponse($moment, $request)),
        ], 201);
    }

    private function loadMomentForResponse(Moment $moment, Request $request): Moment
    {
        $request->session()->put('moment_feed_active', true);
        $sessionId = $request->session()->getId();

        $moment->load([
            'comments' => fn ($query) => $query->latest(),
            'images',
        ])->loadCount([
            'comments',
            'likeReactions as likes_count',
        ]);

        $moment->liked = $moment->reactions()
            ->where('session_id', $sessionId)
            ->where('type', 'like')
            ->exists();

        return $moment;
    }
}
