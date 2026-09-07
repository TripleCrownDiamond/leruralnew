<?php

namespace App\Http\Middleware;

use App\Models\Article;
use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackPageViews
{
    /**
     * Le suivi a lieu AVANT la reponse : l'identifiant de la visite doit etre
     * disponible au moment ou Inertia assemble ses props, pour que le navigateur
     * puisse ensuite y rattacher le temps passe sur la page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $this->track($request);
        } catch (\Throwable $e) {
            // Tracking must never break the page.
            report($e);
        }

        return $next($request);
    }

    private const BOT_PATTERN = '/(bot|crawl|spider|slurp|curl|wget|python-requests|headless|googlebot|bingbot|duckduckbot|yandex|baiduspider|facebookexternalhit|twitterbot|whatsapp|telegrambot|semrush|ahrefs|mj12|petalbot)/i';

    private function track(Request $request): void
    {
        if (!$request->isMethod('GET') || $request->expectsJson()) {
            return;
        }

        // Ignore known crawlers so stats reflect real readers.
        if (preg_match(self::BOT_PATTERN, (string) $request->userAgent()) === 1) {
            return;
        }

        $path = $request->path();

        // Ignore static assets, admin/dashboard, auth pages and internal routes.
        if ($path === 'up'
            || Str::startsWith($path, ['build/', 'storage/', 'public-media/', 'api/', 'dashboard', 'login', 'register', 'verify-email', 'forgot-password', 'reset-password', 'profile', 'checkout', 'payment'])
            || Str::endsWith($path, ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.pdf'])
        ) {
            return;
        }

        $ip = $request->ip();
        $user = $request->user();

        // Derive article id from the article.show route (article/{slug}).
        $articleId = null;
        $slug = $request->route('slug');
        if ($slug && $request->routeIs('article.show')) {
            $articleId = Article::query()
                ->where('slug', (string) $slug)
                ->value('id');
        }

        $view = PageView::create([
            'path' => '/' . ltrim($path, '/'),
            'article_id' => $articleId,
            'user_id' => $user?->id,
            'ip_hash' => $ip ? hash('sha256', $ip . config('app.key')) : null,
            'user_agent' => Str::limit((string) $request->userAgent(), 480),
            'referer' => $request->headers->get('referer') ? Str::limit((string) $request->headers->get('referer'), 480) : null,
        ]);

        // Repris par HandleInertiaRequests : le navigateur renverra le temps
        // passe sur cette visite precise.
        $request->attributes->set('page_view_id', $view->id);
    }
}
