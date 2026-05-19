<?php

namespace App\Observers;

use App\Services\CacheService;

/**
 * Observer générique pour invalider le cache lors des modifications.
 * À attacher aux modèles Setting, Category, StaticPage, PromoCode.
 */
class CacheInvalidationObserver
{
    /**
     * Handle the "saved" event (create or update).
     */
    public function saved(object $model): void
    {
        $this->invalidateCache($model);
    }

    /**
     * Handle the "deleted" event.
     */
    public function deleted(object $model): void
    {
        $this->invalidateCache($model);
    }

    /**
     * Invalide le cache approprié selon le type de modèle.
     */
    protected function invalidateCache(object $model): void
    {
        $className = class_basename($model);

        match ($className) {
            'Setting' => CacheService::clearSettings(),
            'Category' => CacheService::clearCategories(),
            'StaticPage' => CacheService::clearFooterPages(),
            'PromoCode' => CacheService::clearPromo(),
            'Poll', 'PollOption' => CacheService::clearPolls(),
            'Agenda' => CacheService::clearAgenda(),
            default => null,
        };
    }
}