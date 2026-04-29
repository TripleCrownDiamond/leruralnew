<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('agendas', 'time')) {
            Schema::table('agendas', function (Blueprint $table) {
                $table->string('time', 20)->nullable()->after('date');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('agendas', 'time')) {
            Schema::table('agendas', function (Blueprint $table) {
                $table->dropColumn('time');
            });
        }
    }
};