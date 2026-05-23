<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MomentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'title' => $this->title,
            'tag' => $this->tag,
            'caption' => $this->caption,
            'rating' => (int) $this->rating,
            'share_url' => route('moments.show', $this->resource),
            'image_url' => $this->images->first()?->url ?: $this->image_path ?: '/images/humo_hero.png',
            'images' => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
            ])->values(),
            'likes_count' => (int) ($this->likes_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'liked' => (bool) ($this->liked ?? false),
            'comments' => $this->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'name' => $comment->name,
                'text' => $comment->comment,
                'created_at' => optional($comment->created_at)?->toISOString(),
            ])->values(),
            'created_at' => optional($this->created_at)?->toISOString(),
        ];
    }
}
