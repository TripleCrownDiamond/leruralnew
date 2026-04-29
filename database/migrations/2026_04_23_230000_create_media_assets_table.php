<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('original_name');
            $table->string('file_name');
            $table->string('mime_type', 191);
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('extension', 30)->nullable();
            $table->string('kind', 40)->default('other');
            $table->string('disk', 40)->default('public');
            $table->string('path')->nullable();
            $table->text('url');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['kind', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
