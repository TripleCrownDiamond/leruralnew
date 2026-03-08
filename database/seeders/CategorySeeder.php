<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['slug' => 'a-la-une', 'name_fr' => "À la une", 'name_en' => "Top Stories", 'order' => 1],
            ['slug' => 'economie', 'name_fr' => "Économie", 'name_en' => "Economy", 'order' => 2],
            ['slug' => 'environnement', 'name_fr' => "Environnement", 'name_en' => "Environment", 'order' => 3],
            ['slug' => 'filieres', 'name_fr' => "Filières", 'name_en' => "Value Chains", 'order' => 4],
            ['slug' => 'nutrition', 'name_fr' => "Nutrition", 'name_en' => "Nutrition", 'order' => 5],
            ['slug' => 'politiques', 'name_fr' => "Politiques", 'name_en' => "Policies", 'order' => 6],
        ];

        foreach ($items as $item) {
            Category::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name_fr' => $item['name_fr'],
                    'name_en' => $item['name_en'],
                    'order' => $item['order'],
                    'published' => true,
                ]
            );
        }
    }
}
