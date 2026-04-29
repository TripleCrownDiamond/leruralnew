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
        if (Schema::hasTable('advertisements')) {
            return;
        }

        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('location_id')->unique(); // ID unique de l'emplacement (ex: 'sidebar_top')
            $table->string('image_url')->nullable(); // URL de l'image uploadee
            $table->string('redirect_url')->nullable(); // Lien optionnel vers lequel l'utilisateur est redirige
            $table->string('title')->nullable(); // Titre de la publicite
            $table->text('description')->nullable(); // Description
            $table->boolean('is_active')->default(true); // Si la publicite est active
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
