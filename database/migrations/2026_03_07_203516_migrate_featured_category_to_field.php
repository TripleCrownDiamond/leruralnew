<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find "A la une" category
        $featuredCategory = DB::table('categories')->where('slug', 'a-la-une')->orWhere('slug', 'featured')->first();

        if ($featuredCategory) {
            // Find articles attached to this category via pivot table
            $articleIds = DB::table('article_category')
                ->where('category_id', $featuredCategory->id)
                ->pluck('article_id');

            // Update articles to be featured
            DB::table('articles')
                ->whereIn('id', $articleIds)
                ->update(['is_featured' => true]);

            // Delete associations in pivot table
            DB::table('article_category')
                ->where('category_id', $featuredCategory->id)
                ->delete();

            // Delete the category
            DB::table('categories')
                ->where('id', $featuredCategory->id)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreating the category and restoring associations would be complex and data might be lost.
        // We generally assume this is a one-way migration for structural change.
        // But for safety, we could create the category back.
        
        $id = DB::table('categories')->insertGetId([
            'name_fr' => 'A la une',
            'slug' => 'a-la-une',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $featuredArticles = DB::table('articles')->where('is_featured', true)->pluck('id');
        
        foreach ($featuredArticles as $articleId) {
            DB::table('article_category')->insert([
                'article_id' => $articleId,
                'category_id' => $id,
            ]);
        }
    }
};
