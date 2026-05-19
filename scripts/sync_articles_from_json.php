<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$options = parseArgs($argv);

$file = $options['file'] ?? ($argv[1] ?? null);
if (!$file) {
    fwrite(STDERR, "Usage: php scripts/sync_articles_from_json.php --file=storage/app/import/articles.json [--dry-run=1]\n");
    exit(1);
}

$filePath = resolvePath((string) $file);
if (!is_file($filePath)) {
    fwrite(STDERR, "File not found: {$filePath}\n");
    exit(1);
}

$dryRun = ($options['dry-run'] ?? '0') === '1';
$defaultAuthorId = (int) ($options['author-id'] ?? User::query()->where('role', 'admin')->value('id') ?? 1);
$defaultAuthorName = (string) ($options['author-name'] ?? User::query()->where('id', $defaultAuthorId)->value('name') ?? 'LE RURAL');

$payload = json_decode((string) file_get_contents($filePath), true);
if (!is_array($payload)) {
    fwrite(STDERR, "Invalid JSON payload\n");
    exit(1);
}

$articles = $payload['articles'] ?? $payload;
if (!is_array($articles)) {
    fwrite(STDERR, "No articles array found in JSON\n");
    exit(1);
}

$stats = [
    'processed' => 0,
    'created' => 0,
    'updated' => 0,
    'skipped' => 0,
    'errors' => 0,
];

foreach ($articles as $item) {
    $stats['processed']++;

    if (!is_array($item)) {
        $stats['skipped']++;
        continue;
    }

    $title = trim((string) ($item['title_fr'] ?? $item['title'] ?? ''));
    $content = (string) ($item['content_fr'] ?? $item['content'] ?? '');

    if ($title === '' || trim($content) === '') {
        $stats['skipped']++;
        continue;
    }

    $slug = trim((string) ($item['slug'] ?? ''));
    if ($slug === '') {
        $slug = Str::slug($title);
    }
    if ($slug === '') {
        $stats['skipped']++;
        continue;
    }

    $publishedAt = normalizeDate($item['published_at'] ?? null);
    $featuredUntil = normalizeDate($item['featured_until'] ?? null);

    $data = [
        'title_fr' => $title,
        'title_en' => (string) ($item['title_en'] ?? ''),
        'excerpt_fr' => excerpt((string) ($item['excerpt_fr'] ?? $item['excerpt'] ?? ''), $content),
        'excerpt_en' => (string) ($item['excerpt_en'] ?? ''),
        'content_fr' => $content,
        'content_en' => (string) ($item['content_en'] ?? ''),
        'featured_image' => trim((string) ($item['featured_image'] ?? '')),
        'is_premium' => (bool) ($item['is_premium'] ?? false),
        'price' => normalizeFloat($item['price'] ?? null),
        'published_at' => $publishedAt,
        'author_name' => trim((string) ($item['author_name'] ?? $item['author'] ?? $defaultAuthorName)) ?: $defaultAuthorName,
        'author_id' => $defaultAuthorId,
        'read_count' => (int) ($item['read_count'] ?? 0),
        'likes_count' => (int) ($item['likes_count'] ?? 0),
        'comments_count' => (int) ($item['comments_count'] ?? 0),
        'is_featured' => (bool) ($item['is_featured'] ?? false),
        'featured_until' => $featuredUntil,
        'meta_description' => excerpt((string) ($item['meta_description'] ?? ''), $content),
    ];

    try {
        $article = Article::query()->where('slug', $slug)->first();
        $wasExisting = $article !== null;

        if ($dryRun) {
            echo ($wasExisting ? '[UPDATE] ' : '[CREATE] ') . $slug . PHP_EOL;
            continue;
        }

        if (!$article) {
            $article = new Article();
            $article->slug = uniqueSlug($slug);
        }

        $article->fill($data);
        $article->save();

        $categoryIds = resolveCategoryIds($item['categories'] ?? []);
        if ($categoryIds !== []) {
            $article->categories()->sync($categoryIds);
            $article->category_id = $categoryIds[0];
            $article->save();
        }

        if ($wasExisting) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }
    } catch (Throwable $e) {
        $stats['errors']++;
        fwrite(STDERR, "Error for {$slug}: {$e->getMessage()}\n");
    }
}

echo PHP_EOL;
echo "Processed: {$stats['processed']}\n";
echo "Created: {$stats['created']}\n";
echo "Updated: {$stats['updated']}\n";
echo "Skipped: {$stats['skipped']}\n";
echo "Errors: {$stats['errors']}\n";

function parseArgs(array $argv): array
{
    $opts = [];

    foreach ($argv as $arg) {
        if (!str_starts_with((string) $arg, '--')) {
            continue;
        }

        $parts = explode('=', substr((string) $arg, 2), 2);
        $key = $parts[0] ?? '';
        $val = $parts[1] ?? '1';

        if ($key !== '') {
            $opts[$key] = $val;
        }
    }

    return $opts;
}

function resolvePath(string $path): string
{
    if (preg_match('/^[A-Za-z]:\\\\/', $path) || str_starts_with($path, '/')) {
        return $path;
    }

    return base_path($path);
}

function normalizeDate(mixed $value): ?Carbon
{
    if ($value === null || $value === '') {
        return null;
    }

    try {
        return Carbon::parse((string) $value);
    } catch (Throwable) {
        return null;
    }
}

function normalizeFloat(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    return (float) $value;
}

function excerpt(string $provided, string $content): string
{
    $text = trim($provided);
    if ($text !== '') {
        return Str::limit($text, 220, '...');
    }

    return Str::limit(trim(strip_tags($content)), 220, '...');
}

function resolveCategoryIds(array $categories): array
{
    return collect($categories)
        ->map(function ($category) {
            if (is_string($category)) {
                return resolveCategory($category, Str::slug($category))?->id;
            }

            if (!is_array($category)) {
                return null;
            }

            $slug = trim((string) ($category['slug'] ?? ''));
            $name = trim((string) ($category['name_fr'] ?? $category['name'] ?? ''));

            return resolveCategory($name, $slug !== '' ? $slug : Str::slug($name))?->id;
        })
        ->filter()
        ->unique()
        ->values()
        ->all();
}

function resolveCategory(string $name, string $slug): ?Category
{
    $name = trim($name);
    $slug = trim($slug);

    if ($name === '' && $slug === '') {
        return null;
    }

    $category = null;

    if ($slug !== '') {
        $category = Category::query()->where('slug', $slug)->first();
    }

    if (!$category && $name !== '') {
        $category = Category::query()->where('name_fr', $name)->first();
    }

    if ($category) {
        return $category;
    }

    $finalName = $name !== '' ? $name : Str::headline(str_replace('-', ' ', $slug));
    $finalSlug = $slug !== '' ? $slug : Str::slug($finalName);

    if ($finalSlug === '') {
        return null;
    }

    return Category::query()->create([
        'name_fr' => $finalName,
        'name_en' => '',
        'slug' => uniqueCategorySlug($finalSlug),
        'published' => true,
        'order' => 0,
    ]);
}

function uniqueSlug(string $slug): string
{
    $base = trim($slug) !== '' ? trim($slug) : 'article';
    $candidate = $base;
    $i = 2;

    while (Article::query()->where('slug', $candidate)->exists()) {
        $candidate = $base . '-' . $i;
        $i++;
    }

    return $candidate;
}

function uniqueCategorySlug(string $slug): string
{
    $base = trim($slug) !== '' ? trim($slug) : 'categorie';
    $candidate = $base;
    $i = 2;

    while (Category::query()->where('slug', $candidate)->exists()) {
        $candidate = $base . '-' . $i;
        $i++;
    }

    return $candidate;
}
