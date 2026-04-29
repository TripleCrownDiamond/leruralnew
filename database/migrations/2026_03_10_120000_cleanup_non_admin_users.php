<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        DB::table('users')
            ->where('role', '!=', 'admin')
            ->delete();

        if (!Schema::hasTable('user_permissions')) {
            return;
        }

        DB::table('user_permissions')
            ->whereNotIn('user_id', function ($query) {
                $query->select('id')->from('users')->where('role', 'admin');
            })
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('Cette migration ne peut pas etre inversee.');
    }
};