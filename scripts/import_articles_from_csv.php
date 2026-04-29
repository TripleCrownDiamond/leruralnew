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

$articlesCsv = 'C:/Users/takac/OneDrive/Desktop/lerural/articles_categories_standardises_clean.csv';
$categoriesCsv = 'C:/Users/takac/OneDrive/Desktop/lerural/categories_cibles_clean.csv';

if (!file_exists($articlesCsv) || !file_exists($categoriesCsv)) {
    fwrite(STDERR, "CSV introuvable.\n");
    exit(1);
}

function readCsvAssoc(string $path): Generator
{
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        throw new RuntimeException("Impossible d'ouvrir le CSV: {$path}");
    }

    $headers = fgetcsv($handle);
    if ($headers === false) {
        fclose($handle);
        return;
    }

    if (isset($headers[0])) {
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
    }

    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) === 1 && trim((string) $row[0]) === '') {
            continue;
        }

        $assoc = [];
        foreach ($headers as $index => $header) {
            $assoc[(string) $header] = $row[$index] ?? null;
        }

        yield $assoc;
    }

    fclose($handle);
}

function cleanText(?string $text): string
{
    $text = trim((string) $text);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

    return trim($text);
}

function normalizeTitle(?string $title): string
{
    $title = cleanText($title);
    if ($title === '') {
        return '';
    }

    $title = preg_replace('/\s+/u', ' ', $title) ?? $title;
    $lower = mb_strtolower($title, 'UTF-8');

    return mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8')
        . mb_substr($lower, 1, null, 'UTF-8');
}

function normalizeSentenceStart(string $text): string
{
    $text = cleanText($text);
    if ($text === '') {
        return '';
    }

    return (string) preg_replace_callback(
        '/^([\s"“«\'\(\[]*)(\p{L})/u',
        static fn (array $m): string => ($m[1] ?? '') . mb_strtoupper($m[2] ?? '', 'UTF-8'),
        $text,
        1
    );
}

function formatContentHtml(?string $content): string
{
    $content = trim((string) $content);
    if ($content === '') {
        return '';
    }

    $content = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $content = str_replace(["\r\n", "\r"], "\n", $content);

    if (!preg_match('/\n\n+/', $content)) {
        $content = preg_replace('/(?<=[.!?])\s+(?=[\p{Lu}])/u', "\n\n", $content) ?? $content;
    }

    $paragraphs = preg_split('/\n{2,}/u', $content) ?: [];
    $paragraphs = array_values(array_filter(array_map(static function ($paragraph) {
        return preg_replace('/\s+/u', ' ', trim((string) $paragraph)) ?? '';
    }, $paragraphs), static fn ($p) => $p !== ''));

    if ($paragraphs === []) {
        return '';
    }

    return implode("\n", array_map(static fn ($p) => '<p>' . e($p) . '</p>', $paragraphs));
}

function buildExcerpt(array $row, string $contentHtml): string
{
    $preferred = cleanText($row['Extrait'] ?? null);
    if ($preferred === '') {
        $preferred = cleanText((string) strip_tags($contentHtml));
    }

    $preferred = (string) Str::limit($preferred, 220);

    return normalizeSentenceStart($preferred);
}

function parsePublishedAt(?string $value): ?Carbon
{
    $value = trim((string) $value);
    if ($value === '') {
        return null;
    }

    try {
        return Carbon::parse($value);
    } catch (Throwable) {
        return null;
    }
}

function isYearAllowed(?Carbon $date): bool
{
    if ($date === null) {
        return false;
    }

    $year = (int) $date->format('Y');

    return $year === 2025 || $year === 2026;
}

function isReachableImage(string $url): bool
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_NOBODY => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);

    curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    return $code >= 200 && $code < 300 && str_starts_with(strtolower($contentType), 'image/');
}

$adminId = User::where('role', 'admin')->value('id');

$categoryMap = [];
foreach (readCsvAssoc($categoriesCsv) as $row) {
    $nameFr = cleanText($row['Categorie'] ?? null);
    $nameEn = cleanText($row['Traduction'] ?? null);
    $slug = cleanText($row['Slug'] ?? null);
    $order = (int) ($row['Ordre'] ?? 0);
    $status = mb_strtolower(cleanText($row['Statut'] ?? null), 'UTF-8');
    $published = str_contains($status, 'publie');

    if ($slug === '') {
        $slug = Str::slug($nameFr !== '' ? $nameFr : $nameEn);
    }

    if ($slug === '' || $nameFr === '') {
        continue;
    }

    $category = Category::updateOrCreate(
        ['slug' => $slug],
        [
            'name_fr' => $nameFr,
            'name_en' => $nameEn,
            'order' => $order,
            'published' => $published,
        ]
    );

    $categoryMap[$slug] = $category->id;
}

$rows = iterator_to_array(readCsvAssoc($articlesCsv), false);
usort($rows, static function (array $a, array $b): int {
    return strcmp((string) ($b['DatePublication'] ?? ''), (string) ($a['DatePublication'] ?? ''));
});

$processed = 0;
$imported = 0;
$skippedNoImage = 0;
$skippedNoData = 0;
$imageInvalid = 0;

foreach ($rows as $row) {
    $processed++;

    $publishedAt = parsePublishedAt($row['DatePublication'] ?? null);
    if (!isYearAllowed($publishedAt)) {
        continue;
    }

    $title = normalizeTitle($row['TitreOriginal'] ?? $row['TitreCamelCase'] ?? null);
    $contentHtml = formatContentHtml((cleanText($row['ContenuDeveloppe'] ?? null) !== '') ? (string) $row['ContenuDeveloppe'] : (string) ($row['ContenuOriginal'] ?? ''));
    $excerpt = buildExcerpt($row, $contentHtml);

    if ($title === '' || $contentHtml === '' || $excerpt === '') {
        $skippedNoData++;
        continue;
    }

    $imageUrl = trim((string) ($row['ImageURL'] ?? ''));
    if ($imageUrl === '') {
        $skippedNoImage++;
        continue;
    }

    if (!isReachableImage($imageUrl)) {
        $imageInvalid++;
        continue;
    }

    $slug = cleanText($row['SlugArticle'] ?? null);
    if ($slug === '') {
        $slug = Str::slug($title);
    }
    if ($slug === '') {
        $skippedNoData++;
        continue;
    }

    $catSlug = cleanText($row['CategorieSlug'] ?? null);
    if ($catSlug === '') {
        $catSlug = Str::slug((string) ($row['Categorie'] ?? ''));
    }

    if ($catSlug !== '' && !isset($categoryMap[$catSlug])) {
        $category = Category::updateOrCreate(
            ['slug' => $catSlug],
            [
                'name_fr' => cleanText($row['Categorie'] ?? null) ?: Str::title($catSlug),
                'name_en' => '',
                'order' => (int) ($row['OrdreCategorie'] ?? 99),
                'published' => true,
            ]
        );

        $categoryMap[$catSlug] = $category->id;
    }

    $categoryId = $categoryMap[$catSlug] ?? null;

    $article = Article::updateOrCreate(
        ['slug' => $slug],
        [
            'title_fr' => $title,
            'title_en' => '',
            'excerpt_fr' => $excerpt,
            'excerpt_en' => '',
            'content_fr' => $contentHtml,
            'content_en' => '',
            'featured_image' => $imageUrl,
            'is_premium' => false,
            'price' => null,
            'published_at' => $publishedAt,
            'author_name' => 'LE RURAL',
            'author_id' => $adminId,
            'read_count' => (int) ($row['NombreVues'] ?? 0),
            'likes_count' => 0,
            'comments_count' => (int) ($row['NombreCommentaires'] ?? 0),
            'category_id' => $categoryId,
            'meta_title' => $title,
            'meta_description' => (string) Str::limit($excerpt, 160),
            'focus_keyword' => cleanText($row['Categorie'] ?? ''),
            'reading_time' => max(1, (int) ceil(str_word_count(cleanText(strip_tags($contentHtml))) / 200)),
            'is_featured' => false,
            'featured_until' => null,
        ]
    );

    if ($categoryId !== null) {
        $article->categories()->sync([$categoryId]);
    }

    $imported++;

    if ($processed % 100 === 0) {
        echo "Traites={$processed} Importes={$imported} SkipNoImage={$skippedNoImage} SkipNoData={$skippedNoData} ImageKO={$imageInvalid}" . PHP_EOL;
    }
}

Article::query()->update([
    'is_featured' => false,
    'featured_until' => null,
]);

$featuredIds = Article::query()
    ->whereNotNull('published_at')
    ->whereNotNull('featured_image')
    ->orderByDesc('published_at')
    ->orderByDesc('id')
    ->limit(5)
    ->pluck('id')
    ->all();

if ($featuredIds !== []) {
    Article::whereIn('id', $featuredIds)->update([
        'is_featured' => true,
        'is_premium' => true,
        'price' => 500,
        'featured_until' => now()->addMonth(),
    ]);
}

echo PHP_EOL;
echo "Import termine" . PHP_EOL;
echo "Articles traites: {$processed}" . PHP_EOL;
echo "Articles importes: {$imported}" . PHP_EOL;
echo "Ignores sans image: {$skippedNoImage}" . PHP_EOL;
echo "Ignores donnees vides: {$skippedNoData}" . PHP_EOL;
echo "Images invalides: {$imageInvalid}" . PHP_EOL;
echo "A la une payants: " . count($featuredIds) . PHP_EOL;