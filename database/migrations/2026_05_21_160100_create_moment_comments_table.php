<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moment_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('comment');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_comments');
    }
};
