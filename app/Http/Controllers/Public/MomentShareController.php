<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use App\Models\Moment;
use Illuminate\Contracts\View\View;

class MomentShareController extends Controller
{
    public function __invoke(Moment $moment): View
    {
        $moment->load([
            'comments' => fn ($query) => $query->latest()->limit(4),
            'images',
        ])->loadCount([
            'comments',
            'likeReactions as likes_count',
        ]);

        $business = BusinessSetting::current();
        $imageUrl = $moment->images->first()?->url ?: ($moment->image_path ?: '/images/humo_hero.png');
        $absoluteImageUrl = str_starts_with($imageUrl, 'http')
            ? $imageUrl
            : url($imageUrl);
        $shareUrl = route('moments.show', $moment);
        $pageTitle = "{$moment->title} | {$business->business_name}";
        $description = $moment->caption;

        return view('moments.show', [
            'business' => $business,
            'moment' => $moment,
            'shareUrl' => $shareUrl,
            'pageTitle' => $pageTitle,
            'description' => $description,
            'imageUrl' => $absoluteImageUrl,
        ]);
    }
}
