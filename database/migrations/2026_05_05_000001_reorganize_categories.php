<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private array $targets = [
        [
            'slug' => 'politiques-agricoles',
            'name_fr' => 'Politiques agricoles',
            'name_en' => 'Agricultural policies',
            'keywords' => ['politique', 'politiques', 'gouvernance', 'reforme', 'strategie', 'programme', 'loi', 'decret'],
        ],
        [
            'slug' => 'filieres-agricoles-elevage',
            'name_fr' => 'Filières agricoles & élevage',
            'name_en' => 'Agricultural value chains & livestock',
            'keywords' => ['filiere', 'filieres', 'elevage', 'agricole', 'agriculture', 'production', 'animale', 'volaille', 'bovin', 'ovin', 'caprin', 'porcin', 'peche'],
        ],
        [
            'slug' => 'genre-developpement',
            'name_fr' => 'Genre & développement',
            'name_en' => 'Gender & development',
            'keywords' => ['genre', 'femme', 'femmes', 'developpement', 'jeunesse', 'autonomisation'],
        ],
        [
            'slug' => 'economie',
            'name_fr' => 'Économie',
            'name_en' => 'Economy',
            'keywords' => ['economie', 'marche', 'prix', 'commerce', 'finance', 'budget', 'investissement', 'valeur'],
        ],
        [
            'slug' => 'sante-nutrition-securite-alimentaire',
            'name_fr' => 'Santé, nutrition & sécurité alimentaire',
            'name_en' => 'Health, nutrition & food security',
            'keywords' => ['sante', 'nutrition', 'securite', 'alimentaire', 'malnutrition', 'nutritionnel'],
        ],
        [
            'slug' => 'recherche-et-innovation',
            'name_fr' => 'Recherche et innovation',
            'name_en' => 'Research and innovation',
            'keywords' => ['recherche', 'innovation', 'technologie', 'science', 'laboratoire', 'semence', 'variete', 'essai'],
        ],
        [
            'slug' => 'environnement-et-durabilite',
            'name_fr' => 'Environnement et durabilité',
            'name_en' => 'Environment and sustainability',
            'keywords' => ['environnement', 'durabilite', 'climat', 'biodiversite', 'agroecologie', 'sol', 'eau', 'foret'],
        ],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('categories') || ! Schema::hasTable('articles')) {
            return;
        }

        DB::transaction(function (): void {
            $now = now();
            $targetIds = [];

            foreach ($this->targets as $index => $target) {
                $payload = [
                    'slug' => $target['slug'],
                    'name_fr' => $target['name_fr'],
                    'updated_at' => $now,
                ];

                if (Schema::hasColumn('categories', 'name_en')) {
                    $payload['name_en'] = $target['name_en'];
                }

                if (Schema::hasColumn('categories', 'description_fr')) {
                    $payload['description_fr'] = null;
                }

                if (Schema::hasColumn('categories', 'description_en')) {
                    $payload['description_en'] = null;
                }

                if (Schema::hasColumn('categories', 'order')) {
                    $payload['order'] = $index + 1;
                }

                if (Schema::hasColumn('categories', 'published')) {
                    $payload['published'] = true;
                }

                if (Schema::hasColumn('categories', 'image')) {
                    $payload['image'] = null;
                }

                if (Schema::hasColumn('categories', 'image_position_x')) {
                    $payload['image_position_x'] = 50;
                }

                if (Schema::hasColumn('categories', 'image_position_y')) {
                    $payload['image_position_y'] = 50;
                }

                $existing = DB::table('categories')->where('slug', $target['slug'])->first();

                if ($existing) {
                    DB::table('categories')->where('id', $existing->id)->update($payload);
                    $targetIds[$target['slug']] = (int) $existing->id;
                    continue;
                }

                $payload['created_at'] = $now;
                $targetIds[$target['slug']] = (int) DB::table('categories')->insertGetId($payload);
            }

            $oldCategories = DB::table('categories')->get(['id', 'slug', 'name_fr']);
            $hasPivot = Schema::hasTable('article_category');
            $articles = DB::table('articles')->get(['id', 'title_fr', 'excerpt_fr', 'content_fr', 'category_id']);

            foreach ($articles as $article) {
                $currentCategoryIds = [];

                if ($hasPivot) {
                    $currentCategoryIds = DB::table('article_category')
                        ->where('article_id', $article->id)
                        ->pluck('category_id')
                        ->map(fn ($id) => (int) $id)
                        ->all();
                }

                if (empty($currentCategoryIds) && ! empty($article->category_id)) {
                    $currentCategoryIds = [(int) $article->category_id];
                }

                $resolvedSlugs = [];

                foreach ($currentCategoryIds as $oldCategoryId) {
                    $oldCategory = $oldCategories->firstWhere('id', $oldCategoryId);

                    if (! $oldCategory) {
                        continue;
                    }

                    $resolvedSlugs[] = $this->resolveTargetSlug($oldCategory->slug . ' ' . $oldCategory->name_fr);
                }

                if (empty($resolvedSlugs)) {
                    $resolvedSlugs[] = $this->resolveTargetSlug(implode(' ', array_filter([
                        (string) $article->title_fr,
                        (string) $article->excerpt_fr,
                        (string) $article->content_fr,
                    ])));
                }

                $resolvedSlugs = array_values(array_unique(array_filter($resolvedSlugs)));
                $resolvedIds = array_values(array_filter(array_map(fn (string $slug) => $targetIds[$slug] ?? null, $resolvedSlugs)));

                if (empty($resolvedIds)) {
                    $resolvedIds = [$targetIds['politiques-agricoles']];
                }

                DB::table('articles')
                    ->where('id', $article->id)
                    ->update([
                        'category_id' => $resolvedIds[0],
                        'updated_at' => $now,
                    ]);

                if ($hasPivot) {
                    DB::table('article_category')->where('article_id', $article->id)->delete();

                    foreach ($resolvedIds as $categoryId) {
                        DB::table('article_category')->insert([
                            'article_id' => $article->id,
                            'category_id' => $categoryId,
                        ]);
                    }
                }
            }

            DB::table('categories')
                ->whereNotIn('id', array_values($targetIds))
                ->delete();
        });
    }

    public function down(): void
    {
        // One-way taxonomy migration.
    }

    private function resolveTargetSlug(string $value): string
    {
        $normalized = Str::lower(Str::ascii($value));

        foreach ($this->targets as $target) {
            foreach ($target['keywords'] as $keyword) {
                $needle = Str::lower(Str::ascii($keyword));

                if ($needle !== '' && str_contains($normalized, $needle)) {
                    return $target['slug'];
                }
            }
        }

        return 'politiques-agricoles';
    }
};
