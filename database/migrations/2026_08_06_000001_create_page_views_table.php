<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('path', 500);
            $table->unsignedBigInteger('article_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_hash', 64)->nullable()->index();
            $table->string('user_agent', 500)->nullable();
            $table->string('referer', 500)->nullable();
            $table->timestamps();

            $table->index(['created_at', 'article_id']);
            $table->index(['created_at', 'path']);
            $table->index(['created_at', 'ip_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
