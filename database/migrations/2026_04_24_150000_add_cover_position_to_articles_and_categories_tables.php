<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'featured_image_position_x')) {
                $table->unsignedTinyInteger('featured_image_position_x')->default(50)->after('featured_image');
            }

            if (!Schema::hasColumn('articles', 'featured_image_position_y')) {
                $table->unsignedTinyInteger('featured_image_position_y')->default(50)->after('featured_image_position_x');
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'image_position_x')) {
                $table->unsignedTinyInteger('image_position_x')->default(50)->after('image');
            }

            if (!Schema::hasColumn('categories', 'image_position_y')) {
                $table->unsignedTinyInteger('image_position_y')->default(50)->after('image_position_x');
            }
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (Schema::hasColumn('articles', 'featured_image_position_x')) {
                $table->dropColumn('featured_image_position_x');
            }

            if (Schema::hasColumn('articles', 'featured_image_position_y')) {
                $table->dropColumn('featured_image_position_y');
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'image_position_x')) {
                $table->dropColumn('image_position_x');
            }

            if (Schema::hasColumn('categories', 'image_position_y')) {
                $table->dropColumn('image_position_y');
            }
        });
    }
};