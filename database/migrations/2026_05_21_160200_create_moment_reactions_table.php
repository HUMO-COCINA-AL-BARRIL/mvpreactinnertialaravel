<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->string('session_id');
            $table->string('type', 20);
            $table->timestamps();

            $table->unique(['moment_id', 'session_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_reactions');
    }
};
