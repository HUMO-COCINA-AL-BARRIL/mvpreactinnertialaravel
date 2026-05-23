<?php

namespace Tests\Feature;

use App\Models\Moment;
use App\Models\MomentImage;
use App\Models\MomentReaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicMomentFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_create_a_moment_with_an_initial_comment(): void
    {
        Storage::fake('public');

        $response = $this->postJson(route('moments.store'), [
            'name' => 'Laura G.',
            'caption' => 'Una experiencia deliciosa para compartir.',
            'rating' => 5,
            'images' => [
                UploadedFile::fake()->image('momento-1.jpg'),
                UploadedFile::fake()->image('momento-2.jpg'),
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('moment.name', 'Laura G.')
            ->assertJsonPath('moment.comments_count', 1)
            ->assertJsonCount(2, 'moment.images');

        $this->assertDatabaseHas('moments', [
            'name' => 'Laura G.',
            'rating' => 5,
        ]);

        $this->assertDatabaseHas('moment_comments', [
            'name' => 'Laura G.',
            'comment' => 'Una experiencia deliciosa para compartir.',
        ]);

        $storedImages = \App\Models\MomentImage::all();
        $this->assertCount(2, $storedImages);
        foreach ($storedImages as $image) {
            Storage::disk('public')->assertExists($image->path);
        }
    }

    public function test_a_guest_can_comment_on_a_moment(): void
    {
        $moment = Moment::create([
            'name' => 'Maria C.',
            'title' => 'Mesa principal',
            'tag' => 'Hoy en HUMO',
            'caption' => 'Probamos la costilla y estuvo brutal.',
            'rating' => 5,
            'image_path' => '/images/humo_hero.png',
        ]);

        $response = $this->postJson(route('moments.comments.store', $moment), [
            'name' => 'Invitado feliz',
            'comment' => 'Quiero volver el fin de semana.',
        ]);

        $response->assertOk()
            ->assertJsonPath('moment.comments_count', 1);

        $this->assertDatabaseHas('moment_comments', [
            'moment_id' => $moment->id,
            'name' => 'Invitado feliz',
            'comment' => 'Quiero volver el fin de semana.',
        ]);
    }

    public function test_a_guest_can_toggle_like_reactions_by_session(): void
    {
        $this->get(route('landing'))->assertOk();

        $moment = Moment::create([
            'name' => 'Maria C.',
            'title' => 'Mesa principal',
            'tag' => 'Hoy en HUMO',
            'caption' => 'Probamos la costilla y estuvo brutal.',
            'rating' => 5,
            'image_path' => '/images/humo_hero.png',
        ]);

        $likeRoute = route('moments.reactions.toggle', $moment);

        $this->postJson($likeRoute, ['type' => MomentReaction::TYPE_LIKE])
            ->assertOk()
            ->assertJsonPath('moment.liked', true)
            ->assertJsonPath('moment.likes_count', 1);

        $this->assertDatabaseHas('moment_reactions', [
            'moment_id' => $moment->id,
            'type' => MomentReaction::TYPE_LIKE,
        ]);
    }

    public function test_a_shared_moment_page_exposes_social_metadata_and_image(): void
    {
        $moment = Moment::create([
            'name' => 'Maria C.',
            'title' => 'Mesa principal',
            'tag' => 'Hoy en HUMO',
            'caption' => 'Probamos la costilla y estuvo brutal.',
            'rating' => 5,
            'image_path' => '/images/humo_hero.png',
        ]);

        MomentImage::create([
            'moment_id' => $moment->id,
            'path' => '/images/humo_hero.png',
            'sort_order' => 0,
        ]);

        $response = $this->get(route('moments.show', $moment));

        $response->assertOk()
            ->assertSee('og:title', false)
            ->assertSee('twitter:card', false)
            ->assertSee(route('moments.show', $moment), false)
            ->assertSee('/images/humo_hero.png', false)
            ->assertSee('Mesa principal');
    }
}
