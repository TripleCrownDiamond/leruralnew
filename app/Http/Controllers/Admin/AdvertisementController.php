<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'location_id' => ['required', 'string', 'max:255', 'unique:advertisements,location_id'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'image_url' => ['required', 'url', 'max:2048'],
            'redirect_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        Advertisement::create([
            'location_id' => trim($data['location_id']),
            'title' => filled($data['title'] ?? null) ? trim($data['title']) : null,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'image_url' => trim($data['image_url']),
            'redirect_url' => filled($data['redirect_url'] ?? null) ? trim($data['redirect_url']) : null,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Espace pub ajoute.');
    }

    public function update(Request $request, Advertisement $advertisement)
    {
        $data = $request->validate([
            'location_id' => ['required', 'string', 'max:255', 'unique:advertisements,location_id,' . $advertisement->id],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'image_url' => ['required', 'url', 'max:2048'],
            'redirect_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        $advertisement->update([
            'location_id' => trim($data['location_id']),
            'title' => filled($data['title'] ?? null) ? trim($data['title']) : null,
            'description' => filled($data['description'] ?? null) ? trim($data['description']) : null,
            'image_url' => trim($data['image_url']),
            'redirect_url' => filled($data['redirect_url'] ?? null) ? trim($data['redirect_url']) : null,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Espace pub mis a jour.');
    }

    public function destroy(Advertisement $advertisement)
    {
        $advertisement->delete();

        return back()->with('success', 'Espace pub supprime.');
    }
}

