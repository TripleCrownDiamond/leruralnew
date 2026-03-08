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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            
            // Content
            $table->string('title_fr');
            $table->string('title_en');
            $table->text('excerpt_fr');
            $table->text('excerpt_en');
            $table->longText('content_fr');
            $table->longText('content_en');
            
            // Media
            $table->string('featured_image')->nullable();
            
            // Status & Pricing
            $table->boolean('is_premium')->default(false);
            $table->decimal('price', 8, 2)->nullable();
            $table->timestamp('published_at')->nullable();
            
            // Metadata
            $table->string('author_name'); // Humanized author name
            $table->unsignedInteger('read_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            
            // Relationships
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
