<?php

namespace Database\Seeders;

use App\Models\Moment;
use App\Models\MomentReaction;
use Illuminate\Database\Seeder;

class MomentSeeder extends Seeder
{
    public function run(): void
    {
        $moments = [
            [
                'name' => 'Maria C.',
                'title' => 'Mesa principal',
                'tag' => 'Hoy en HUMO',
                'caption' => 'El barril habla primero: corte intenso, calor preciso y una mesa lista para compartir.',
                'rating' => 5,
                'comments' => [
                    ['name' => 'Maria C.', 'comment' => 'Volveria por el sabor de la carne y por lo bien que se siente compartir aqui.'],
                    ['name' => 'Camila R.', 'comment' => 'Muy recomendado para pedir varios cortes y compartir.'],
                ],
                'like_sessions' => ['seed-like-1', 'seed-like-2', 'seed-like-3'],
            ],
            [
                'name' => 'Andres G.',
                'title' => 'Reserva especial',
                'tag' => 'Reserva',
                'caption' => 'Cumpleanos, aniversarios y grupos que quieren una noche con sabor, fuego y un ambiente bien cuidado.',
                'rating' => 5,
                'comments' => [
                    ['name' => 'Andres G.', 'comment' => 'Reservamos para celebrar y todo se sintio cuidado, agil y con muy buena atencion.'],
                ],
                'like_sessions' => ['seed-like-4', 'seed-like-5'],
            ],
        ];

        foreach ($moments as $item) {
            $moment = Moment::firstOrCreate(
                [
                    'name' => $item['name'],
                    'title' => $item['title'],
                ],
                [
                    'tag' => $item['tag'],
                    'caption' => $item['caption'],
                    'rating' => $item['rating'],
                    'image_path' => '/images/humo_hero.png',
                ]
            );

            if ($moment->comments()->count() === 0) {
                $moment->comments()->createMany($item['comments']);
            }

            foreach ($item['like_sessions'] as $sessionId) {
                $moment->reactions()->firstOrCreate([
                    'session_id' => $sessionId,
                    'type' => MomentReaction::TYPE_LIKE,
                ]);
            }
        }
    }
}
