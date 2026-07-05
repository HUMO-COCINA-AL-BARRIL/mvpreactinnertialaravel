<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class BusinessSetting extends Model
{
    protected $fillable = [
        'business_name',
        'is_open',
        'closed_message',
        'logo_path',
        'hero_badge',
        'hero_title',
        'hero_description',
        'hero_image_path',
        'navbar_background_color',
        'navbar_text_color',
        'primary_button_color',
        'primary_button_text_color',
        'section_background_color',
        'section_surface_color',
        'cta_background_color',
        'featured_categories_title',
        'featured_products_title',
        'cta_title',
        'cta_description',
        'setup_completed_at',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'setup_completed_at' => 'datetime',
    ];

    public static function current(): self
    {
        if (! Schema::hasTable('business_settings')) {
            return new static([
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
                'hero_badge' => 'Cocina al barril en tu ciudad',
                'hero_title' => 'La mejor experiencia en asados al barril',
                'hero_description' => 'Personaliza este espacio con la propuesta de valor principal de tu negocio.',
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
            ]);
        }

        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
                'hero_badge' => 'Cocina al barril en tu ciudad',
                'hero_title' => 'La mejor experiencia en asados al barril',
                'hero_description' => 'Personaliza este espacio con la propuesta de valor principal de tu negocio.',
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
            ]
        );
    }
}
