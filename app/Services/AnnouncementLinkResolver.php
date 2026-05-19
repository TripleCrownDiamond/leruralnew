<?php

namespace App\Services;

class AnnouncementLinkResolver
{
    public function normalize(?string $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^(javascript|data):/i', $value)) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|mailto:|tel:)/i', $value)) {
            return $value;
        }

        if (str_starts_with($value, '//')) {
            return 'https:' . $value;
        }

        if ($alias = $this->resolveKnownAlias($value)) {
            return $alias;
        }

        if (str_starts_with($value, '#') || str_starts_with($value, '/')) {
            return $value;
        }

        if (str_contains($value, '.') && !str_contains($value, ' ')) {
            return 'https://' . ltrim($value, '/');
        }

        if (str_contains($value, '/')) {
            return '/' . ltrim($value, '/');
        }

        return '#' . ltrim($value, '#');
    }

    private function resolveKnownAlias(string $value): ?string
    {
        $normalized = strtolower(trim($value));
        $path = $this->extractPath($normalized);

        return match ($path) {
            '/actualites', '/news' => '/#actualites',
            '/subscription-plans', '/abonnement' => '/#abonnement',
            '/nos-journaux', '/presse-ecrite', '/presse-papier', '/nos-parutions', '/parutions' => route('press-papers.index'),
            default => null,
        };
    }

    private function extractPath(string $value): string
    {
        $parsed = parse_url($value);

        if (is_array($parsed) && isset($parsed['path'])) {
            return '/' . ltrim((string) $parsed['path'], '/');
        }

        return '/' . ltrim($value, '/');
    }
}