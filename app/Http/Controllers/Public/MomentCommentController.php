<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMomentCommentRequest;
use App\Http\Resources\MomentResource;
use App\Models\Moment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MomentCommentController extends Controller
{
    public function store(StoreMomentCommentRequest $request, Moment $moment): JsonResponse
    {
        $data = $request->validated();

        $moment->comments()->create([
            'name' => trim($data['name'] ?? '') ?: 'Invitado',
            'comment' => trim($data['comment']),
        ]);

        return response()->json([
            'message' => 'Comentario publicado en el feed.',
            'moment' => new MomentResource($this->loadMomentForResponse($moment, $request)),
        ]);
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
