<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_settings', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('closed_message');
            $table->string('hero_badge')->nullable()->after('logo_path');
            $table->string('hero_title')->nullable()->after('hero_badge');
            $table->text('hero_description')->nullable()->after('hero_title');
            $table->string('hero_image_path')->nullable()->after('hero_description');
            $table->string('navbar_background_color', 7)->default('#ffffff')->after('hero_image_path');
            $table->string('navbar_text_color', 7)->default('#111827')->after('navbar_background_color');
            $table->string('primary_button_color', 7)->default('#f59e0b')->after('navbar_text_color');
            $table->string('primary_button_text_color', 7)->default('#000000')->after('primary_button_color');
            $table->string('section_background_color', 7)->default('#0a0a0a')->after('primary_button_text_color');
            $table->string('section_surface_color', 7)->default('#171717')->after('section_background_color');
            $table->string('cta_background_color', 7)->default('#111111')->after('section_surface_color');
            $table->string('featured_categories_title')->nullable()->after('cta_background_color');
            $table->string('featured_products_title')->nullable()->after('featured_categories_title');
            $table->string('cta_title')->nullable()->after('featured_products_title');
            $table->text('cta_description')->nullable()->after('cta_title');
            $table->timestamp('setup_completed_at')->nullable()->after('cta_description');
        });
    }

    public function down(): void
    {
        Schema::table('business_settings', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
