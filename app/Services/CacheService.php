<?php

namespace App\Services;

use App\Models\Category;
use App\Models\PromoCode;
use App\Models\Setting;
use App\Models\StaticPage;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Cache;

class CacheService
{
    // Cache TTL constants (en secondes)
    public const TTL_SETTINGS = 3600;        // 1 heure
    public const TTL_CATEGORIES = 1800;      // 30 minutes
    public const TTL_FOOTER_PAGES = 3600;    // 1 heure
    public const TTL_PROMO = 900;            // 15 minutes
    public const TTL_SEO = 3600;             // 1 heure

    // Cache keys
    public const KEY_SETTINGS = 'global:settings';
    public const KEY_CATEGORIES = 'global:categories';
    public const KEY_FOOTER_PAGES = 'global:footer_pages';
    public const KEY_PROMO_FEATURED = 'global:promo_featured';
    public const KEY_SEO_DEFAULTS = 'global:seo_defaults';

    /**
     * Récupère tous les settings avec cache.
     */
    public static function settings(): array
    {
        return Cache::remember(self::KEY_SETTINGS, self::TTL_SETTINGS, function () {
            return Setting::pluck('value', 'key')->all();
        });
    }

    /**
     * Récupère un setting spécifique.
     */
    public static function setting(string $key, mixed $default = null): mixed
    {
        $settings = self::settings();
        return $settings[$key] ?? $default;
    }

    /**
     * Récupère les catégories publiées avec cache.
     */
    public static function categories(): array
    {
        return Cache::remember(self::KEY_CATEGORIES, self::TTL_CATEGORIES, function () {
            return Category::published()
                ->orderBy('order')
                ->get(['id', 'slug', 'name_fr', 'name_en', 'image'])
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'slug' => $category->slug,
                    'name' => $category->name_fr,
                    'name_en' => $category->name_en,
                    'image' => $category->image,
                ])
                ->all();
        });
    }

    /**
     * Récupère les pages footer avec cache.
     */
    public static function footerPages(): array
    {
        return Cache::remember(self::KEY_FOOTER_PAGES, self::TTL_FOOTER_PAGES, function () {
            StaticPage::ensureDefaultPages();

            return StaticPage::query()
                ->where('is_published', true)
                ->whereIn('category', ['legal', 'info'])
                ->where('slug', '!=', 'contact')
                ->orderBy('category')
                ->orderBy('order')
                ->get(['id', 'slug', 'title', 'category'])
                ->map(fn ($page) => [
                    'id' => $page->id,
                    'slug' => $page->slug,
                    'title' => $page->title,
                    'category' => $page->category,
                ])
                ->values()
                ->all();
        });
    }

    /**
     * Récupère les valeurs SEO par défaut avec cache.
     */
    public static function seoDefaults(): array
    {
        return Cache::remember(self::KEY_SEO_DEFAULTS, self::TTL_SEO, function () {
            $settings = self::settings();
            
            return [
                'slogan' => $settings['site_slogan'] ?? '1er groupe de presse agricole en Afrique de l\'Ouest',
                'description' => $settings['seo_default_description'] ?? 'LE RURAL - 1er groupe de presse agricole en Afrique de l\'Ouest. Actualités, analyses et informations sur l\'agriculture, l\'élevage et le monde rural.',
                'image' => $settings['seo_default_image'] ?? '/logos/logo.png',
            ];
        });
    }

    /**
     * Récupère la promo en vedette avec cache.
     */
    public static function featuredPromo(): ?array
    {
        return Cache::remember(self::KEY_PROMO_FEATURED, self::TTL_PROMO, function () {
            $promo = PromoCode::currentFeatured();
            
            if (!$promo) {
                return null;
            }

            $targetPlans = collect();

            if (method_exists($promo, 'targetedSubscriptionPlanIds')) {
                $targetIds = $promo->targetedSubscriptionPlanIds();
                if ($targetIds->isNotEmpty()) {
                    $targetPlans = SubscriptionPlan::query()
                        ->whereIn('id', $targetIds->all())
                        ->where('is_active', true)
                        ->get(['id', 'name', 'slug', 'price'])
                        ->sortBy(fn (SubscriptionPlan $plan) => $targetIds->search((int) $plan->id))
                        ->values();
                }
            }

            return [
                'code' => $promo->code,
                'name' => $promo->name,
                'description' => $promo->description,
                'discount_type' => $promo->discount_type,
                'discount_value' => (float) $promo->discount_value,
                'min_amount' => $promo->min_amount !== null ? (float) $promo->min_amount : null,
                'applies_to_all_subscriptions' => property_exists($promo, 'applies_to_all_subscriptions')
                    ? (bool) $promo->applies_to_all_subscriptions
                    : true,
                'target_subscription_plans' => $targetPlans->map(fn (SubscriptionPlan $plan) => [
                    'id' => $plan->id,
                    'slug' => $plan->slug,
                    'name' => $plan->name,
                    'price' => (float) $plan->price,
                ])->all(),
                'checkout_plan_id' => $targetPlans->first()?->slug ?? 'default',
            ];
        });
    }

    /**
     * Invalide le cache des settings.
     */
    public static function clearSettings(): void
    {
        Cache::forget(self::KEY_SETTINGS);
        Cache::forget(self::KEY_SEO_DEFAULTS);
    }

    /**
     * Invalide le cache des catégories.
     */
    public static function clearCategories(): void
    {
        Cache::forget(self::KEY_CATEGORIES);
    }

    /**
     * Invalide le cache des pages footer.
     */
    public static function clearFooterPages(): void
    {
        Cache::forget(self::KEY_FOOTER_PAGES);
    }

    /**
     * Invalide le cache de la promo.
     */
    public static function clearPromo(): void
    {
        Cache::forget(self::KEY_PROMO_FEATURED);
    }

    /**
     * Invalide tout le cache global.
     */
    public static function clearAll(): void
    {
        self::clearSettings();
        self::clearCategories();
        self::clearFooterPages();
        self::clearPromo();
        Cache::forget('shared_content:v1');
    }

    /**
     * Préchauffe le cache (utile après déploiement).
     */
    public static function warmUp(): void
    {
        self::settings();
        self::categories();
        self::footerPages();
        self::seoDefaults();
        self::featuredPromo();
        self::activePolls();
        self::randomQuote();
        self::randomDidYouKnow();
    }

    /**
     * Cache pour les sondages actifs (sans les votes utilisateur).
     */
    public static function activePolls(): array
    {
        return Cache::remember('global:active_polls', 300, function () { // 5 minutes
            return \App\Models\Poll::with('options')
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->get()
                ->map(fn ($poll) => [
                    'id' => $poll->id,
                    'question' => $poll->question,
                    'image' => $poll->image,
                    'options' => $poll->options->map(fn ($option) => [
                        'id' => $option->id,
                        'label' => $option->label,
                        'votes' => $option->votes,
                    ])->all(),
                ])
                ->all();
        });
    }

    /**
     * Cache pour une citation aléatoire (change toutes les heures).
     */
    public static function randomQuote(): ?array
    {
        $hourKey = 'global:quote:' . date('YmdH');
        
        return Cache::remember($hourKey, 3600, function () {
            $quote = \App\Models\Quote::where('is_active', true)->inRandomOrder()->first();
            
            if (!$quote) {
                return null;
            }
            
            return [
                'content' => $quote->content,
                'author' => $quote->author,
            ];
        });
    }

    /**
     * Cache pour "Le saviez-vous" aléatoire (change toutes les heures).
     */
    public static function randomDidYouKnow(): ?array
    {
        $hourKey = 'global:did_you_know:' . date('YmdH');
        
        return Cache::remember($hourKey, 3600, function () {
            $item = \App\Models\DidYouKnow::where('is_active', true)->inRandomOrder()->first();
            
            if (!$item) {
                return null;
            }
            
            return [
                'content' => $item->content,
            ];
        });
    }

    /**
     * Cache pour l'agenda (événements à venir).
     */
    public static function upcomingAgenda(int $limit = 6): array
    {
        return Cache::remember('global:agenda:' . $limit, 900, function () use ($limit) { // 15 minutes
            return \App\Models\Agenda::where('is_active', true)
                ->whereDate('date', '>=', now())
                ->orderBy('date')
                ->orderBy('time')
                ->take($limit)
                ->get()
                ->map(fn ($event) => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'date' => $event->date->format('d M'),
                    'time' => $event->time,
                    'location' => $event->location,
                ])
                ->all();
        });
    }

    /**
     * Invalide le cache des sondages.
     */
    public static function clearPolls(): void
    {
        Cache::forget('global:active_polls');
    }

    /**
     * Invalide le cache de l'agenda.
     */
    public static function clearAgenda(): void
    {
        Cache::forget('global:agenda:6');
        Cache::forget('global:agenda:10');
    }
}