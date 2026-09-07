<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            // Temps passe sur la page, renseigne a posteriori par le navigateur.
            // Nullable : une visite dont l'onglet est ferme brutalement, ou un
            // navigateur sans sendBeacon, n'en aura jamais.
            $table->unsignedInteger('duration_seconds')->nullable()->after('referer');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropColumn('duration_seconds');
        });
    }
};
