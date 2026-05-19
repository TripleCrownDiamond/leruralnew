<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_streams', function (Blueprint $table) {
            $table->string('thumbnail_url')->nullable()->after('embed_url');
            $table->string('fallback_image_url')->nullable()->after('thumbnail_url');
            $table->dateTime('starts_at')->nullable()->after('fallback_image_url');
            $table->dateTime('ends_at')->nullable()->after('starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('live_streams', function (Blueprint $table) {
            $table->dropColumn(['thumbnail_url', 'fallback_image_url', 'starts_at', 'ends_at']);
        });
    }
};
