<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AdvertisementController extends AdminController
{
    private const LOCATION_PRESETS = [
        'sidebar_top',
        'sidebar_middle_skyscraper',
        'paywall_sponsor',
        'footer_banner',
        'home_inline_feature',
        'article_single_bottom',
        'checkout_article_sidebar',
        'checkout_subscription_sidebar',
    ];

    public function index(): Response
    {
        return Inertia::render('Dashboard/Advertisements/Index', [
            'advertisements' => Advertisement::orderBy('location_id')->get(),
            'locationPresets' => self::LOCATION_PRESETS,
        ]);
    }

    private function flushSharedContentCache(): void
    {
        Cache::forget('shared_content:v1');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'location_id' => ['required', 'string', 'max:255', 'unique:advertisements,location_id'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'image_url' => ['required', 'string', 'max:2048'],
            'redirect_url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        Advertisement::create([
            'location_id' => trim($data['location_id']),
            'title' => filled($data['title'] ?? null) ? trim($data['title']) : null,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'image_url' => $this->normalizeMediaUrl($data['image_url']),
            'redirect_url' => $this->normalizeRedirectUrl($data['redirect_url'] ?? null),
            'is_active' => !empty($data['is_active']),
        ]);

        $this->flushSharedContentCache();

        return back()->with('success', 'Espace pub ajoute.');
    }

    public function update(Request $request, Advertisement $advertisement)
    {
        $data = $request->validate([
            'location_id' => ['required', 'string', 'max:255', 'unique:advertisements,location_id,' . $advertisement->id],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'image_url' => ['required', 'string', 'max:2048'],
            'redirect_url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        $advertisement->update([
            'location_id' => trim($data['location_id']),
            'title' => filled($data['title'] ?? null) ? trim($data['title']) : null,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'image_url' => $this->normalizeMediaUrl($data['image_url']),
            'redirect_url' => $this->normalizeRedirectUrl($data['redirect_url'] ?? null),
            'is_active' => !empty($data['is_active']),
        ]);

        $this->flushSharedContentCache();

        return back()->with('success', 'Espace pub mis a jour.');
    }

    public function destroy(Advertisement $advertisement)
    {
        $advertisement->delete();

        $this->flushSharedContentCache();

        return back()->with('success', 'Espace pub supprime.');
    }

    /**
     * Accepte les chemins relatifs (ex: /public-media/...) et les URLs absolues.
     */
    private function normalizeMediaUrl(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return $value;
        }

        if (str_starts_with($value, '//')) {
            return 'https:' . $value;
        }

        return $value;
    }

    private function normalizeRedirectUrl(?string $value): ?string
    {
        $value = filled($value) ? trim($value) : null;

        if ($value === null) {
            return null;
        }

        if (preg_match('#^https?://#i', $value) === 1 || str_starts_with($value, '/')) {
            return $value;
        }

        return 'https://' . $value;
    }
}

