<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('safeb_registrations', function (Blueprint $table) {
            $table->text('specialty')->nullable()->after('option_label'); // Specialite culinaire ou titre du film
            $table->json('files')->nullable()->after('specialty'); // Chemins des fichiers uploades (JSON array)
        });
    }

    public function down(): void
    {
        Schema::table('safeb_registrations', function (Blueprint $table) {
            $table->dropColumn(['specialty', 'files']);
        });
    }
};
