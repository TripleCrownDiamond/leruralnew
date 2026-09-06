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
        Schema::create('safeb_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // panel | partner | stand
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('organization')->nullable();
            $table->string('option_label')->nullable(); // pack sponsoring / taille de stand / theme de panel
            $table->text('message')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('safeb_registrations');
    }
};
