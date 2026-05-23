<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE orders MODIFY whatsapp_link TEXT NULL');
        DB::statement('ALTER TABLE reservations MODIFY whatsapp_link TEXT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE orders MODIFY whatsapp_link VARCHAR(255) NULL');
        DB::statement('ALTER TABLE reservations MODIFY whatsapp_link VARCHAR(255) NULL');
    }
};
