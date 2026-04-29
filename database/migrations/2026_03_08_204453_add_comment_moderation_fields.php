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
            // Vérifier si les colonnes existent avant de les ajouter
            if (!Schema::hasColumn('comments', 'auto_flagged')) {
                $table->boolean('auto_flagged')->default(false);
                $table->index('auto_flagged');
            }
            
            if (!Schema::hasColumn('comments', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }
            
            if (!Schema::hasColumn('comments', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable();
            }
            
            if (!Schema::hasColumn('comments', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable();
                $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('comments', 'rejected_by')) {
                $table->unsignedBigInteger('rejected_by')->nullable();
                $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Supprimer les foreign keys d'abord
            if (Schema::hasColumn('comments', 'approved_by')) {
                $table->dropForeign(['approved_by']);
            }
            if (Schema::hasColumn('comments', 'rejected_by')) {
                $table->dropForeign(['rejected_by']);
            }
            
            // Supprimer les colonnes
            $table->dropColumn(['auto_flagged', 'approved_at', 'rejected_at', 'approved_by', 'rejected_by']);
        });
    }
};
