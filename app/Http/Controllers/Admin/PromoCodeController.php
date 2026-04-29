<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PromoCodeController extends AdminController
{
    public function index(Request $request)
    {
        $subscriptionPlans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price']);

        if (!Schema::hasTable('promo_codes')) {
            return Inertia::render('Admin/PromoCodes/Index', [
                'promoCodes' => [
                    'data' => [],
                    'links' => [],
                    'total' => 0,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                ],
                'subscriptionPlans' => $subscriptionPlans,
                'filters' => $request->only(['search', 'status']),
            ]);
        }

        PromoCode::ensureDefaultCode();

        $query = PromoCode::query();

        if ($search = trim((string) $request->get('search', ''))) {
            $query->where(function ($q) use ($search): void {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            }
            if ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $promoCodes = $query->orderByDesc('is_featured')->orderByDesc('updated_at')->paginate(20)->withQueryString();

        return Inertia::render('Admin/PromoCodes/Index', [
            'promoCodes' => $promoCodes,
            'subscriptionPlans' => $subscriptionPlans,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);
        $validated['code'] = PromoCode::normalizeCode($validated['code']) ?? PromoCode::DEFAULT_CODE;
        $validated = $this->normalizeTargeting($validated);

        PromoCode::create($validated);

        return back()->with('success', 'Code promo ajoute.');
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $validated = $this->validatePayload($request, $promoCode->id);
        $validated['code'] = PromoCode::normalizeCode($validated['code']) ?? $promoCode->code;
        $validated = $this->normalizeTargeting($validated);

        $promoCode->update($validated);

        return back()->with('success', 'Code promo mis a jour.');
    }

    public function toggleActive(PromoCode $promoCode)
    {
        $next = ! $promoCode->is_active;

        $promoCode->update([
            'is_active' => $next,
            'is_featured' => $next ? $promoCode->is_featured : false,
        ]);

        return back()->with('success', $next ? 'Code promo active.' : 'Code promo desactive et retire de Welcome.');
    }

    public function toggleFeatured(PromoCode $promoCode)
    {
        $next = ! $promoCode->is_featured;

        if ($next) {
            PromoCode::query()->where('id', '!=', $promoCode->id)->update(['is_featured' => false]);
        }

        $promoCode->update([
            'is_featured' => $next,
        ]);

        return back()->with('success', $next ? 'Code promo affiche sur Welcome.' : 'Code promo retire de Welcome.');
    }

    public function destroy(PromoCode $promoCode)
    {
        $promoCode->delete();

        return back()->with('success', 'Code promo supprime.');
    }

    private function supportsSubscriptionTargeting(): bool
    {
        return Schema::hasColumn('promo_codes', 'applies_to_all_subscriptions')
            && Schema::hasColumn('promo_codes', 'subscription_plan_ids');
    }

    private function normalizeTargeting(array $validated): array
    {
        if (! $this->supportsSubscriptionTargeting()) {
            return $validated;
        }

        $appliesToAll = (bool) ($validated['applies_to_all_subscriptions'] ?? true);
        $planIds = collect($validated['subscription_plan_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (! $appliesToAll && empty($planIds)) {
            throw ValidationException::withMessages([
                'subscription_plan_ids' => "Selectionnez au moins une offre d'abonnement.",
            ]);
        }

        $validated['applies_to_all_subscriptions'] = $appliesToAll;
        $validated['subscription_plan_ids'] = $appliesToAll ? null : $planIds;

        return $validated;
    }

    private function validatePayload(Request $request, ?int $id = null): array
    {
        $rules = [
            'code' => ['required', 'string', 'max:64', 'unique:promo_codes,code' . ($id ? ',' . $id : '')],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['required', 'in:percent,fixed'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'min_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ];

        if ($this->supportsSubscriptionTargeting()) {
            $rules['applies_to_all_subscriptions'] = ['boolean'];
            $rules['subscription_plan_ids'] = ['nullable', 'array'];
            $rules['subscription_plan_ids.*'] = ['integer', 'exists:subscription_plans,id'];
        }

        return $request->validate($rules);
    }
}
