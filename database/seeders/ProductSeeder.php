<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(
            ['slug' => 'especiales-de-cerdo'],
            [
                'name' => 'Especiales de Cerdo',
                'description' => 'Cortes y preparaciones al barril.',
                'sort_order' => 1,
                'is_featured' => true,
                'is_active' => true,
            ]
        );

        $products = [
            [
                'name' => 'CHUZARRON',
                'short_description' => '400 gramos de pancarta de cerdo al barril a fuego lento.',
                'price' => 45000,
            ],
            [
                'name' => 'COSTICHI',
                'short_description' => 'Corte de 400 gramos de carne costilla y chicharron.',
                'price' => 45000,
            ],
            [
                'name' => 'BONDIOLA DE CERDO',
                'short_description' => '400 gramos de carne de cerdo premium mas acompanamiento.',
                'price' => 40000,
            ],
            [
                'name' => 'Sandwich de Bondiola',
                'short_description' => 'Sandwich artesanal de bondiola de cerdo al barril.',
                'price' => 30000,
            ],
            [
                'name' => 'HAMBURGUESA DE BONDIOLA DE CERDO',
                'short_description' => 'Puedes pedirla con el corte que desees.',
                'price' => 25000,
            ],
            [
                'name' => 'Frijolada del dia',
                'short_description' => 'Frijolada del dia: semana 25.000, fin de semana 30.000.',
                'price' => 25000,
            ],
        ];

        foreach ($products as $item) {
            Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'category_id' => $category->id,
                    'name' => $item['name'],
                    'short_description' => $item['short_description'],
                    'description' => $item['short_description'],
                    'price' => $item['price'],
                    'stock' => 0,
                    'is_available' => true,
                    'is_featured' => true,
                    'image' => null,
                ]
            );
        }
    }
}
