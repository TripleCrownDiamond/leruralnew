<?php

namespace App\Services;

use Illuminate\Support\Str;

class ArticleContentService
{
    public const MARKDOWN_PREFIX = '<!--ARTICLE_CONTENT:MARKDOWN-->';

    public function isMarkdown(?string $content): bool
    {
        return Str::startsWith((string) $content, self::MARKDOWN_PREFIX);
    }

    public function render(?string $content): string
    {
        $content = (string) $content;

        if (!$this->isMarkdown($content)) {
            return $content;
        }

        $markdown = ltrim(Str::after($content, self::MARKDOWN_PREFIX));

        return (string) Str::markdown($markdown, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
    }

    public function plainText(?string $content): string
    {
        return $this->normalizeText($this->render($content));
    }

    public function cleanText(?string $text): string
    {
        return $this->normalizeText((string) $text);
    }

    public function excerpt(?string $excerpt, ?string $content, ?int $limit = 220): string
    {
        $base = $this->cleanText($excerpt);

        if ($base === '') {
            $base = $this->plainText($content);
        }

        if ($limit === null) {
            return $base;
        }

        return (string) Str::limit($base, $limit);
    }

    public function readingTime(?string $content, int $wordsPerMinute = 200): int
    {
        $wordCount = str_word_count($this->plainText($content));

        return max(1, (int) ceil(max($wordCount, 1) / $wordsPerMinute));
    }

    protected function normalizeText(string $value): string
    {
        $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

        return trim($value);
    }
}