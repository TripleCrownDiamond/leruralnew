<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            if (!Schema::hasColumn('static_pages', 'hero_image_url')) {
                $table->string('hero_image_url', 2048)->nullable()->after('meta_description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            if (Schema::hasColumn('static_pages', 'hero_image_url')) {
                $table->dropColumn('hero_image_url');
            }
        });
    }
};
