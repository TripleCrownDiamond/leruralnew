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
        Schema::table('users', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive', 'invited', 'suspended'])->default('active')->after('role');
            }
            
            if (!Schema::hasColumn('users', 'permissions')) {
                $table->json('permissions')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('users', 'invitation_token')) {
                $table->string('invitation_token')->nullable()->after('permissions');
            }
            
            if (!Schema::hasColumn('users', 'invitation_expires_at')) {
                $table->timestamp('invitation_expires_at')->nullable()->after('invitation_token');
            }
            
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('invitation_expires_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove columns if they exist
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            
            if (Schema::hasColumn('users', 'permissions')) {
                $table->dropColumn('permissions');
            }
            
            if (Schema::hasColumn('users', 'invitation_token')) {
                $table->dropColumn('invitation_token');
            }
            
            if (Schema::hasColumn('users', 'invitation_expires_at')) {
                $table->dropColumn('invitation_expires_at');
            }
            
            if (Schema::hasColumn('users', 'last_login_at')) {
                $table->dropColumn('last_login_at');
            }
        });
    }
};
