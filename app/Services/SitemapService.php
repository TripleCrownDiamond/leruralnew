<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use App\Models\PressPaper;
use Illuminate\Support\Carbon;

/**
 * Construction du sitemap.
 *
 * La logique vit ici plutot que dans la commande artisan : l'hebergement n'a
 * ni cron ni SSH, le fichier statique n'avait donc plus ete regenere depuis
 * des mois et les articles parus entre-temps n'etaient soumis a aucun moteur.
 * Le sitemap est desormais servi a la demande, a partir du contenu reel.
 */
class SitemapService
{
    public function build(): string
    {
        $urls = [];

        $add = function (string $loc, ?Carbon $lastmod = null, string $changefreq = 'weekly', string $priority = '0.5') use (&$urls): void {
            $urls[] = [
                'loc' => $loc,
                'lastmod' => $lastmod?->toDateString(),
                'changefreq' => $changefreq,
                'priority' => $priority,
            ];
        };

        $add(url('/'), now(), 'daily', '1.0');
        $add(url('/direct'), now(), 'hourly', '0.9');
        $add(url('/nos-journaux'), now(), 'daily', '0.8');
        $add(url('/safeb'), now(), 'weekly', '0.8');
        $add(url('/contact'), now(), 'monthly', '0.5');
        $add(url('/a-propos'), now(), 'monthly', '0.5');
        $add(url('/search'), now(), 'daily', '0.4');
        $add(url('/en'), now(), 'daily', '0.8');

        Category::published()
            ->orderBy('order')
            ->get()
            ->each(function (Category $category) use ($add): void {
                $add(route('category.show', $category->slug), $category->updated_at, 'daily', '0.7');
            });

        Article::published()
            ->orderByDesc('published_at')
            ->get()
            ->each(function (Article $article) use ($add): void {
                $add(
                    route('article.show', $article->slug),
                    $article->published_at ?? $article->updated_at,
                    'daily',
                    '0.8'
                );
            });

        $dernierJournal = PressPaper::published()->max('updated_at');
        $add(
            route('press-papers.index'),
            $dernierJournal ? Carbon::parse($dernierJournal) : now(),
            'weekly',
            '0.6'
        );

        PressPaper::published()
            ->orderByDesc('published_at')
            ->get()
            ->each(function (PressPaper $paper) use ($add): void {
                $add(
                    url('/nos-journaux/' . $paper->slug),
                    $paper->published_at ?? $paper->updated_at,
                    'weekly',
                    '0.6'
                );
            });

        return $this->buildXml($urls);
    }

    private function buildXml(array $urls): string
    {
        $items = array_map(function (array $url): string {
            $parts = [
                '    <url>',
                '      <loc>' . $this->escape($url['loc']) . '</loc>',
            ];

            if (! empty($url['lastmod'])) {
                $parts[] = '      <lastmod>' . $this->escape($url['lastmod']) . '</lastmod>';
            }

            $parts[] = '      <changefreq>' . $this->escape($url['changefreq']) . '</changefreq>';
            $parts[] = '      <priority>' . $this->escape($url['priority']) . '</priority>';
            $parts[] = '    </url>';

            return implode(PHP_EOL, $parts);
        }, $urls);

        return implode(PHP_EOL, [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            implode(PHP_EOL, $items),
            '</urlset>',
            '',
        ]);
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
