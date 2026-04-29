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
        Schema::create('red_flags', function (Blueprint $table) {
            $table->id();
            $table->string('word')->unique(); // Le mot ou phrase à signaler
            $table->boolean('active')->default(true); // Si le mot est actif
            $table->timestamps();
            
            // Index pour optimiser les recherches
            $table->index('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('red_flags');
    }
};
