<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('fr_FR');
        $fakerEn = Faker::create('en_US');
        $categories = Category::all();

        if ($categories->isEmpty()) {
            return;
        }

        // African agriculture image URLs (Unsplash)
        $imageUrls = [
            'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=1200&q=80', // Farmer in field
            'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80', // Farming
            'https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&w=1200&q=80', // African woman farmer
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80', // Market
            'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&w=1200&q=80', // Cocoa
            'https://images.unsplash.com/photo-1600354587397-681c16c584b1?auto=format&fit=crop&w=1200&q=80', // Rice field
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80', // Agriculture tech
            'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=1200&q=80', // Tractor
        ];

        $aLaUneCategory = Category::where('slug', 'a-la-une')->first();

        // Add 20 specific articles for "A la une" to test pagination
        if ($aLaUneCategory) {
            for ($i = 0; $i < 20; $i++) {
                $isPremium = $faker->boolean(30);
                $titleFr = $faker->sentence(6);
                $titleEn = $fakerEn->sentence(6);
                
                $contentImages = [];
                for($j=0; $j<2; $j++) {
                    $contentImages[] = $imageUrls[array_rand($imageUrls)];
                }
                
                $contentFr = '<p>' . implode('</p><p>', $faker->paragraphs(3)) . '</p>';
                $contentFr .= '<img src="' . $contentImages[0] . '" alt="Image 1" class="w-full h-auto rounded-lg my-4" />';
                $contentFr .= '<p>' . implode('</p><p>', $faker->paragraphs(3)) . '</p>';
                
                $contentEn = '<p>' . implode('</p><p>', $fakerEn->paragraphs(3)) . '</p>';
                $contentEn .= '<img src="' . $contentImages[1] . '" alt="Image 1" class="w-full h-auto rounded-lg my-4" />';
                $contentEn .= '<p>' . implode('</p><p>', $fakerEn->paragraphs(3)) . '</p>';

                Article::create([
                    'category_id' => $aLaUneCategory->id,
                    'slug' => Str::slug($titleFr) . '-alu-' . $i,
                    'title_fr' => $titleFr,
                    'title_en' => $titleEn,
                    'excerpt_fr' => $faker->paragraph(),
                    'excerpt_en' => $fakerEn->paragraph(),
                    'content_fr' => $contentFr,
                    'content_en' => $contentEn,
                    'featured_image' => $imageUrls[array_rand($imageUrls)],
                    'is_premium' => $isPremium,
                    'price' => $isPremium ? $faker->randomFloat(2, 5, 50) : null,
                    'published_at' => $faker->dateTimeBetween('-1 month', 'now'),
                    'author_name' => $faker->name(),
                    'read_count' => $faker->numberBetween(100, 10000),
                    'likes_count' => $faker->numberBetween(10, 1000),
                    'comments_count' => $faker->numberBetween(0, 100),
                ]);
            }
        }

        for ($i = 0; $i < 50; $i++) {
            $isPremium = $faker->boolean(30); // 30% premium
            $titleFr = $faker->sentence(6);
            $titleEn = $fakerEn->sentence(6);
            
            // Randomly select images for content
            $contentImages = [];
            for($j=0; $j<2; $j++) {
                $contentImages[] = $imageUrls[array_rand($imageUrls)];
            }
            
            $contentFr = '<p>' . implode('</p><p>', $faker->paragraphs(3)) . '</p>';
            $contentFr .= '<img src="' . $contentImages[0] . '" alt="Image 1" class="w-full h-auto rounded-lg my-4" />';
            $contentFr .= '<p>' . implode('</p><p>', $faker->paragraphs(3)) . '</p>';
            
            $contentEn = '<p>' . implode('</p><p>', $fakerEn->paragraphs(3)) . '</p>';
            $contentEn .= '<img src="' . $contentImages[1] . '" alt="Image 1" class="w-full h-auto rounded-lg my-4" />';
            $contentEn .= '<p>' . implode('</p><p>', $fakerEn->paragraphs(3)) . '</p>';

            Article::create([
                'category_id' => $categories->random()->id,
                'slug' => Str::slug($titleFr) . '-' . $i, // Ensure unique
                'title_fr' => $titleFr,
                'title_en' => $titleEn,
                'excerpt_fr' => $faker->paragraph(),
                'excerpt_en' => $fakerEn->paragraph(),
                'content_fr' => $contentFr,
                'content_en' => $contentEn,
                'featured_image' => $imageUrls[array_rand($imageUrls)],
                'is_premium' => $isPremium,
                'price' => $isPremium ? $faker->randomFloat(2, 5, 50) : null,
                'published_at' => $faker->dateTimeBetween('-1 year', 'now'),
                'author_name' => $faker->name(),
                'read_count' => $faker->numberBetween(100, 10000),
                'likes_count' => $faker->numberBetween(10, 1000),
                'comments_count' => $faker->numberBetween(0, 100),
            ]);
        }
    }
}
