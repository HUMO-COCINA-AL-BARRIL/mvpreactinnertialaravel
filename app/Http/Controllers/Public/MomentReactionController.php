<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\ToggleMomentReactionRequest;
use App\Http\Resources\MomentResource;
use App\Models\Moment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MomentReactionController extends Controller
{
    public function __invoke(ToggleMomentReactionRequest $request, Moment $moment): JsonResponse
    {
        $data = $request->validated();
        $request->session()->put('moment_feed_active', true);
        $sessionId = $request->session()->getId();

        $reaction = $moment->reactions()
            ->where('session_id', $sessionId)
            ->where('type', $data['type'])
            ->first();

        if ($reaction) {
            $reaction->delete();
        } else {
            $moment->reactions()->create([
                'session_id' => $sessionId,
                'type' => $data['type'],
            ]);
        }

        return response()->json([
            'message' => 'Reaccion actualizada.',
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
