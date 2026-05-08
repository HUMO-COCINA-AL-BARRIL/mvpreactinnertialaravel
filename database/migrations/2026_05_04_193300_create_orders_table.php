<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('delivery_method');
            $table->string('delivery_address')->nullable();
            $table->text('notes')->nullable();
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('total');
            $table->string('whatsapp_link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
