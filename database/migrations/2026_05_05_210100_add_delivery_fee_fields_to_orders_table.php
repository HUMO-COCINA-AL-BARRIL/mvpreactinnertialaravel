<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivery_fee_id')->nullable()->after('delivery_address')->constrained('delivery_fees')->nullOnDelete();
            $table->unsignedBigInteger('delivery_fee')->default(0)->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('delivery_fee_id');
            $table->dropColumn('delivery_fee');
        });
    }
};
