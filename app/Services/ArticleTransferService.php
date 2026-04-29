<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;

class ArticleTransferService
{
    public function __construct(
        protected ArticleContentService $contentService,
    ) {
    }

    public function buildSiteExportPayload(iterable $articles): array
    {
        return [
            'format' => 'le-rural-articles',
            'version' => 1,
            'exported_at' => now()->toIso8601String(),
            'articles' => collect($articles)->map(fn (Article $article) => [
                'slug' => $article->slug,
                'title_fr' => $article->title_fr,
                'excerpt_fr' => $article->excerpt_fr,
                'content_fr' => $article->content_fr,
                'content_mode' => $this->contentService->isMarkdown($article->content_fr) ? 'markdown' : 'wysiwyg',
                'featured_image' => $article->featured_image,
                'is_premium' => (bool) $article->is_premium,
                'price' => $article->price,
                'published_at' => optional($article->published_at)->toIso8601String(),
                'author_name' => $article->author_name,
                'read_count' => $article->read_count,
                'likes_count' => $article->likes_count,
                'comments_count' => $article->comments_count,
                'is_featured' => (bool) $article->is_featured,
                'featured_until' => optional($article->featured_until)->toIso8601String(),
                'categories' => $article->categories->map(fn (Category $category) => [
                    'slug' => $category->slug,
                    'name_fr' => $category->name_fr,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }

    public function importSiteJson(string $json, string $publicationMode, int $authorId, string $fallbackAuthorName): array
    {
        $payload = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Le fichier JSON fourni est invalide.');
        }

        $articles = collect($payload['articles'] ?? $payload);

        if ($articles->isEmpty()) {
            throw new RuntimeException('Aucun article exploitable n\'a ete trouve dans le fichier JSON.');
        }

        $summary = ['imported' => 0, 'skipped' => 0, 'errors' => []];

        foreach ($articles as $record) {
            if (!is_array($record)) {
                $summary['skipped']++;
                $summary['errors'][] = 'Un enregistrement JSON a ete ignore car son format est invalide.';
                continue;
            }

            $title = trim((string) ($record['title_fr'] ?? $record['title'] ?? ''));
            $content = (string) ($record['content_fr'] ?? $record['content'] ?? '');

            if ($title === '' || trim($content) === '') {
                $summary['skipped']++;
                $summary['errors'][] = 'Un article JSON a ete ignore car le titre ou le contenu est vide.';
                continue;
            }

            $article = Article::create([
                'slug' => $this->generateUniqueArticleSlug((string) ($record['slug'] ?? $title)),
                'title_fr' => $title,
                'title_en' => '',
                'excerpt_fr' => $this->contentService->excerpt(
                    (string) ($record['excerpt_fr'] ?? $record['excerpt'] ?? ''),
                    $content,
                    null,
                ),
                'excerpt_en' => '',
                'content_fr' => $content,
                'content_en' => '',
                'featured_image' => (string) ($record['featured_image'] ?? ''),
                'is_premium' => (bool) ($record['is_premium'] ?? false),
                'price' => !empty($record['is_premium']) ? $this->normalizeNumeric($record['price'] ?? null) : null,
                'published_at' => $this->resolvePublishedAt(
                    $publicationMode,
                    $record['published_at'] ?? null,
                    !empty($record['published_at']),
                ),
                'author_name' => trim((string) ($record['author_name'] ?? $record['author'] ?? $fallbackAuthorName)) ?: $fallbackAuthorName,
                'author_id' => $authorId,
                'read_count' => (int) ($record['read_count'] ?? 0),
                'likes_count' => (int) ($record['likes_count'] ?? 0),
                'comments_count' => (int) ($record['comments_count'] ?? 0),
                'is_featured' => (bool) ($record['is_featured'] ?? false),
                'featured_until' => $this->normalizeDateValue($record['featured_until'] ?? null),
            ]);

            $categoryIds = $this->resolveCategoryIds($record['categories'] ?? []);
            if (!empty($categoryIds)) {
                $article->categories()->sync($categoryIds);
                $article->category_id = $categoryIds[0];
                $article->save();
            }

            $summary['imported']++;
        }

        return $summary;
    }

    public function importWordPressXml(string $xmlContent, string $publicationMode, int $authorId, string $fallbackAuthorName): array
    {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlContent, SimpleXMLElement::class, LIBXML_NOCDATA);

        if (!$xml) {
            throw new RuntimeException('Le fichier WordPress XML est invalide.');
        }

        $namespaces = $xml->getNamespaces(true);
        $wpNs = $namespaces['wp'] ?? null;
        $contentNs = $namespaces['content'] ?? null;
        $excerptNs = $namespaces['excerpt'] ?? null;
        $dcNs = $namespaces['dc'] ?? null;

        $items = $xml->channel?->item;
        if (!$items) {
            throw new RuntimeException('Le fichier WordPress ne contient aucun article importable.');
        }

        $summary = ['imported' => 0, 'skipped' => 0, 'errors' => []];

        foreach ($items as $item) {
            $wp = $wpNs ? $item->children($wpNs) : null;
            $contentNode = $contentNs ? $item->children($contentNs) : null;
            $excerptNode = $excerptNs ? $item->children($excerptNs) : null;
            $dcNode = $dcNs ? $item->children($dcNs) : null;

            $postType = trim((string) ($wp?->post_type ?? 'post'));
            $sourceStatus = trim((string) ($wp?->status ?? 'publish'));

            if (!in_array($postType, ['post', 'article'], true) || in_array($sourceStatus, ['trash', 'auto-draft', 'inherit'], true)) {
                $summary['skipped']++;
                continue;
            }

            $title = trim((string) $item->title);
            $content = (string) ($contentNode?->encoded ?? '');
            $excerpt = (string) ($excerptNode?->encoded ?? '');
            $authorName = trim((string) ($dcNode?->creator ?? $fallbackAuthorName)) ?: $fallbackAuthorName;

            if ($title === '' || trim($content) === '') {
                $summary['skipped']++;
                $summary['errors'][] = 'Un article WordPress a ete ignore car le titre ou le contenu est vide.';
                continue;
            }

            $featuredImage = $this->extractFirstImageFromHtml($content);
            $publishedSource = in_array($sourceStatus, ['publish', 'future'], true);
            $publishedAt = $item->pubDate ? Carbon::parse((string) $item->pubDate)->toIso8601String() : null;

            $article = Article::create([
                'slug' => $this->generateUniqueArticleSlug((string) ($wp?->post_name ?? $title)),
                'title_fr' => $title,
                'title_en' => '',
                'excerpt_fr' => $this->contentService->excerpt($excerpt, $content, null),
                'excerpt_en' => '',
                'content_fr' => $content,
                'content_en' => '',
                'featured_image' => $featuredImage,
                'is_premium' => false,
                'price' => null,
                'published_at' => $this->resolvePublishedAt($publicationMode, $publishedAt, $publishedSource),
                'author_name' => $authorName,
                'author_id' => $authorId,
                'read_count' => 0,
                'likes_count' => 0,
                'comments_count' => 0,
                'is_featured' => false,
                'featured_until' => null,
            ]);

            $categoryIds = $this->resolveWordPressCategoryIds($item);
            if (!empty($categoryIds)) {
                $article->categories()->sync($categoryIds);
                $article->category_id = $categoryIds[0];
                $article->save();
            }

            $summary['imported']++;
        }

        return $summary;
    }

    protected function resolvePublishedAt(string $mode, mixed $sourcePublishedAt, bool $sourceIsPublished): ?Carbon
    {
        if ($mode === 'draft') {
            return null;
        }

        if ($mode === 'published') {
            $sourceDate = $this->normalizeDateValue($sourcePublishedAt);

            return $sourceDate && $sourceDate->lte(now()) ? $sourceDate : now();
        }

        if (!$sourceIsPublished) {
            return null;
        }

        return $this->normalizeDateValue($sourcePublishedAt) ?? now();
    }

    protected function normalizeDateValue(mixed $value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        try {
            return Carbon::parse((string) $value);
        } catch (\Throwable) {
            return null;
        }
    }

    protected function normalizeNumeric(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    protected function resolveCategoryIds(array $categories): array
    {
        return collect($categories)
            ->map(function ($category) {
                if (is_string($category)) {
                    return $this->resolveCategory($category, $category)?->id;
                }

                if (!is_array($category)) {
                    return null;
                }

                return $this->resolveCategory(
                    (string) ($category['name_fr'] ?? $category['name'] ?? $category['slug'] ?? ''),
                    (string) ($category['slug'] ?? ''),
                )?->id;
            })
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    protected function resolveWordPressCategoryIds(SimpleXMLElement $item): array
    {
        $ids = [];

        foreach ($item->category as $category) {
            $attributes = $category->attributes();
            $domain = (string) ($attributes['domain'] ?? '');

            if ($domain !== 'category') {
                continue;
            }

            $name = trim((string) $category);
            $slug = trim((string) ($attributes['nicename'] ?? ''));
            $resolved = $this->resolveCategory($name, $slug);

            if ($resolved) {
                $ids[] = $resolved->id;
            }
        }

        return collect($ids)->unique()->values()->all();
    }

    protected function resolveCategory(string $name, string $slug = ''): ?Category
    {
        $name = trim($name);
        $slug = trim($slug) !== '' ? trim($slug) : Str::slug($name);

        if ($name === '' && $slug === '') {
            return null;
        }

        $category = null;

        if ($slug !== '') {
            $category = Category::where('slug', $slug)->first();
        }

        if (!$category && $name !== '') {
            $category = Category::where('name_fr', $name)->first();
        }

        if ($category) {
            return $category;
        }

        $finalName = $name !== '' ? $name : Str::headline(str_replace('-', ' ', $slug));

        return Category::create([
            'slug' => $this->generateUniqueCategorySlug($slug !== '' ? $slug : $finalName),
            'name_fr' => $finalName,
            'name_en' => '',
            'description_fr' => '',
            'description_en' => '',
            'order' => 0,
            'published' => true,
        ]);
    }

    protected function generateUniqueArticleSlug(string $seed): string
    {
        $baseSlug = Str::slug($seed);
        $slug = $baseSlug !== '' ? $baseSlug : 'article';
        $counter = 2;

        while (Article::where('slug', $slug)->exists()) {
            $slug = $baseSlug !== '' ? "{$baseSlug}-{$counter}" : "article-{$counter}";
            $counter++;
        }

        return $slug;
    }

    protected function generateUniqueCategorySlug(string $seed): string
    {
        $baseSlug = Str::slug($seed);
        $slug = $baseSlug !== '' ? $baseSlug : 'categorie';
        $counter = 2;

        while (Category::where('slug', $slug)->exists()) {
            $slug = $baseSlug !== '' ? "{$baseSlug}-{$counter}" : "categorie-{$counter}";
            $counter++;
        }

        return $slug;
    }

    protected function extractFirstImageFromHtml(string $html): string
    {
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $html, $matches) === 1) {
            return trim($matches[1]);
        }

        return '';
    }
}