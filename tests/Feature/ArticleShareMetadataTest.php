<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleShareMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_page_exposes_share_metadata_and_copy_link(): void
    {
        $article = Article::create([
            'slug' => 'article-partage-test',
            'title_fr' => 'Article partage test',
            'title_en' => 'Share test article',
            'excerpt_fr' => 'Extrait court pour le partage social.',
            'excerpt_en' => 'Short social share excerpt.',
            'content_fr' => '<p>Contenu de test pour la page article.</p>',
            'content_en' => '<p>Test content for the article page.</p>',
            'featured_image' => 'https://example.com/article-share.jpg',
            'is_premium' => false,
            'published_at' => now(),
            'author_name' => 'Redaction LE RURAL',
            'read_count' => 0,
            'likes_count' => 0,
            'comments_count' => 0,
        ]);

        $response = $this->get(route('article.show', $article->slug));

        $response->assertOk();

        $content = $response->getContent();
        $page = $this->extractInertiaPage($content);
        $articlePage = $page['props']['article'];

        $this->assertSame('Extrait court pour le partage social.', $articlePage['share_description']);
        $this->assertSame('https://example.com/article-share.jpg', $articlePage['share_image']);
        $this->assertSame(route('article.show', $article->slug), $articlePage['share_url']);
        $this->assertSame('Extrait court pour le partage social.', $articlePage['excerpt']);

        $this->assertStringContainsString('property="og:title" content="Article partage test"', $content);
        $this->assertStringContainsString('property="og:description" content="Extrait court pour le partage social."', $content);
        $this->assertStringContainsString('property="og:image" content="https://example.com/article-share.jpg"', $content);
        $this->assertStringContainsString('property="og:url" content="' . route('article.show', $article->slug) . '"', $content);
        $this->assertStringContainsString('name="twitter:card" content="summary_large_image"', $content);
    }

    private function extractInertiaPage(string $content): array
    {
        if (!preg_match('/data-page=(?:"|\")(.*?)(?:"|\")/s', $content, $matches)) {
            $this->fail('Inertia page payload not found in the response.');
        }

        $decoded = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $page = json_decode($decoded, true);

        $this->assertIsArray($page, 'Unable to decode the Inertia page payload.');

        return $page;
    }
}
