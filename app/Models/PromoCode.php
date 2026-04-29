<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class PromoCode extends Model
{
    public const DEFAULT_CODE = 'LERURAL10';

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_amount',
        'max_discount',
        'starts_at',
        'ends_at',
        'is_active',
        'usage_limit',
        'used_count',
        'is_featured',
        'applies_to_all_subscriptions',
        'subscription_plan_ids',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'applies_to_all_subscriptions' => 'boolean',
        'subscription_plan_ids' => 'array',
    ];

    public static function normalizeCode(?string $code): ?string
    {
        if ($code === null) {
            return null;
        }

        $normalized = strtoupper(trim($code));

        return $normalized !== '' ? $normalized : null;
    }

    public static function ensureDefaultCode(): void
    {
        if (!Schema::hasTable('promo_codes')) {
            return;
        }

        $payload = [
            'name' => 'Bienvenue LE RURAL',
            'description' => 'Reduction de bienvenue sur vos achats LE RURAL.',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'min_amount' => 500,
            'max_discount' => 5000,
            'is_active' => true,
            'is_featured' => true,
        ];

        if (Schema::hasColumn('promo_codes', 'applies_to_all_subscriptions')) {
            $payload['applies_to_all_subscriptions'] = true;
        }

        static::query()->firstOrCreate(
            ['code' => static::DEFAULT_CODE],
            $payload,
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $q): void {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $q): void {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public static function findActiveByCode(?string $code): ?self
    {
        if (!Schema::hasTable('promo_codes')) {
            return null;
        }

        $normalized = static::normalizeCode($code);
        if (!$normalized) {
            return null;
        }

        return static::query()
            ->active()
            ->whereRaw('UPPER(code) = ?', [$normalized])
            ->first();
    }

    public static function currentFeatured(): ?self
    {
        if (!Schema::hasTable('promo_codes')) {
            return null;
        }

        return static::query()
            ->where('is_featured', true)
            ->active()
            ->orderByDesc('updated_at')
            ->first();
    }

    public function canBeUsedForAmount(float $amount): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($this->min_amount !== null && $amount < (float) $this->min_amount) {
            return false;
        }

        return true;
    }

    public function supportsCheckout(string $type, ?int $relatedId = null): bool
    {
        if ($type !== 'subscription') {
            return true;
        }

        if (!Schema::hasColumn('promo_codes', 'applies_to_all_subscriptions') || !Schema::hasColumn('promo_codes', 'subscription_plan_ids')) {
            return true;
        }

        if ((bool) $this->applies_to_all_subscriptions) {
            return true;
        }

        $ids = collect($this->subscription_plan_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values();

        if ($ids->isEmpty()) {
            return false;
        }

        return $relatedId !== null && $ids->contains((int) $relatedId);
    }

    public function targetedSubscriptionPlanIds(): Collection
    {
        if (!Schema::hasColumn('promo_codes', 'subscription_plan_ids')) {
            return collect();
        }

        return collect($this->subscription_plan_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values();
    }

    public function computeDiscount(float $amount): float
    {
        if ($amount <= 0) {
            return 0.0;
        }

        $discount = 0.0;

        if ($this->discount_type === 'percent') {
            $discount = $amount * ((float) $this->discount_value / 100);
        } else {
            $discount = (float) $this->discount_value;
        }

        if ($this->max_discount !== null) {
            $discount = min($discount, (float) $this->max_discount);
        }

        $discount = max(0.0, min($discount, $amount));

        return round($discount, 2);
    }
}
