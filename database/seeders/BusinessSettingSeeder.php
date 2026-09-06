<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingSeeder extends Seeder
{
    public function run(): void
    {
        BusinessSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
                'hero_badge' => 'Cocina al barril en tu ciudad',
                'hero_title' => 'La mejor experiencia en asados al barril',
                'hero_description' => 'El sabor del barril, el calor de una buena mesa. Disfruta nuestros asados en HUMO, reserva para compartir o pide tus favoritos a domicilio en Manizales.',
                'navbar_background_color' => '#ffffff',
                'navbar_text_color' => '#111827',
                'primary_button_color' => '#f59e0b',
                'primary_button_text_color' => '#000000',
                'section_background_color' => '#0a0a0a',
                'section_surface_color' => '#171717',
                'cta_background_color' => '#111111',
                'featured_categories_title' => 'Categorias destacadas',
                'featured_products_title' => 'Productos mas pedidos',
                'cta_title' => 'Listo para hacer tu pedido?',
                'cta_description' => 'Consulta el menu, arma tu pedido y finaliza por WhatsApp con los datos de la orden.',
                'setup_completed_at' => null,
            ]
        );
    }
}
