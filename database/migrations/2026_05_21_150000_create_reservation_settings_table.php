<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('capacity_total')->default(40);
            $table->unsignedInteger('reservation_duration_minutes')->default(120);
            $table->unsignedInteger('slot_interval_minutes')->default(30);
            $table->time('open_time')->default('12:00:00');
            $table->time('close_time')->default('22:00:00');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_settings');
    }
};
