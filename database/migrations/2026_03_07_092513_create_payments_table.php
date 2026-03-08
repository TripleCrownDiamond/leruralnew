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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('payment_method'); // manual, kkiapay, fedapay, qosic
            $table->string('transaction_id')->nullable(); // ID from gateway
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('XOF');
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->string('type'); // subscription, article_purchase
            $table->unsignedBigInteger('related_id')->nullable(); // subscription_plan_id or article_id
            $table->json('meta_data')->nullable(); // Store extra info like proof of payment image
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
