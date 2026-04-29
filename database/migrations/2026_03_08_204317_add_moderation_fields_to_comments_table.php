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
        Schema::table('comments', function (Blueprint $table) {
            // Champs pour la modération
            $table->boolean('auto_flagged')->default(false)->after('is_approved'); // Si signalé automatiquement
            $table->timestamp('approved_at')->nullable()->after('auto_flagged'); // Date d'approbation
            $table->timestamp('rejected_at')->nullable()->after('approved_at'); // Date de rejet
            $table->unsignedBigInteger('approved_by')->nullable()->after('rejected_at'); // ID de l'admin qui a approuvé
            $table->unsignedBigInteger('rejected_by')->nullable()->after('approved_by'); // ID de l'admin qui a rejeté
            
            // Index pour optimiser les recherches
            $table->index('auto_flagged');
            $table->index(['approved_by', 'approved_at']);
            $table->index(['rejected_by', 'rejected_at']);
            
            // Foreign keys
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropColumn(['auto_flagged', 'approved_at', 'rejected_at', 'approved_by', 'rejected_by']);
        });
    }
};
