<?php

namespace App\Http\Controllers\Admin;

use App\Models\MediaAsset;
use App\Models\StaticPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaticPageController extends AdminController
{
    public function index(Request $request)
    {
        StaticPage::ensureDefaultPages();

        $query = StaticPage::query()->where('slug', '!=', 'contact');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        $pages = $query->orderBy('category')->orderBy('order')->paginate(20)->withQueryString();

        return Inertia::render('Admin/StaticPages/Index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/StaticPages/Edit', [
            'page' => null,
            'mediaAssets' => $this->mediaAssetsForEditor(),
            'cdnStatus' => $this->cdnStatus(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);
        $validated['published_at'] = $validated['is_published'] ? now() : null;

        StaticPage::create($validated);

        return redirect()->route('dashboard.static-pages.index')->with('success', 'Page creee avec succes.');
    }

    public function edit(StaticPage $staticPage)
    {
        abort_if($staticPage->slug === 'contact', 404);

        return Inertia::render('Admin/StaticPages/Edit', [
            'page' => $staticPage,
            'mediaAssets' => $this->mediaAssetsForEditor(),
            'cdnStatus' => $this->cdnStatus(),
        ]);
    }

    public function update(Request $request, StaticPage $staticPage)
    {
        abort_if($staticPage->slug === 'contact', 404);

        $validated = $this->validatePayload($request, $staticPage);

        if ($validated['is_published'] && !$staticPage->published_at) {
            $validated['published_at'] = now();
        }

        $staticPage->update($validated);

        return redirect()->route('dashboard.static-pages.index')->with('success', 'Page mise a jour avec succes.');
    }

    public function destroy(StaticPage $staticPage)
    {
        abort_if($staticPage->slug === 'contact', 404);

        $staticPage->delete();

        return back()->with('success', 'Page supprimee avec succes.');
    }

    private function validatePayload(Request $request, ?StaticPage $existing = null): array
    {
        $slugRule = 'nullable|string|max:255|alpha_dash|unique:static_pages,slug';
        if ($existing) {
            $slugRule .= ',' . $existing->id;
        }

        return $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [$slugRule, 'not_in:contact'],
            'category' => 'required|in:legal,info,other',
            'content' => 'nullable|string',
            'meta_description' => 'nullable|string|max:500',
            'hero_image_url' => 'nullable|string|max:2048',
            'is_published' => 'boolean',
            'order' => 'integer|min:0',
        ]);
    }

        private function mediaAssetsForEditor(): array
    {
        return MediaAsset::query()
            ->select(['id', 'original_name', 'url', 'kind', 'mime_type', 'created_at'])
            ->where(function ($query) {
                $query
                    ->whereIn('kind', ['image', 'document'])
                    ->orWhere('mime_type', 'like', 'image/%')
                    ->orWhere('mime_type', 'like', 'application/%')
                    ->orWhere('url', 'like', '%.jpg%')
                    ->orWhere('url', 'like', '%.jpeg%')
                    ->orWhere('url', 'like', '%.png%')
                    ->orWhere('url', 'like', '%.webp%')
                    ->orWhere('url', 'like', '%.pdf%');
            })
            ->latest()
            ->limit(80)
            ->get()
            ->toArray();
    }
    private function cdnStatus(): array
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME') ?: env('VITE_CLOUDINARY_CLOUD_NAME');
        $uploadPreset = env('CLOUDINARY_UPLOAD_PRESET') ?: env('VITE_CLOUDINARY_UPLOAD_PRESET');
        $apiKey = env('CLOUDINARY_API_KEY') ?: env('VITE_CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');
        $imageKitPrivate = (string) env('IMAGEKIT_PRIVATE_KEY', '');

        $providerOrder = collect(explode(',', (string) env('MEDIA_UPLOAD_PROVIDERS', 'cloudinary,imagekit,storage')))
            ->map(fn ($provider) => strtolower(trim($provider)))
            ->filter()
            ->values()
            ->all();

        $activeProvider = 'Local storage';
        if (in_array('cloudinary', $providerOrder, true) && $cloudName && $uploadPreset) {
            $activeProvider = 'Cloudinary';
        } elseif (in_array('imagekit', $providerOrder, true) && $imageKitPrivate !== '') {
            $activeProvider = 'ImageKit';
        }

        return [
            'provider_order' => $providerOrder,
            'active_provider' => $activeProvider,
            'cloudinary' => [
                'configured_upload' => (bool) ($cloudName && $uploadPreset),
                'configured_destroy' => (bool) ($cloudName && $apiKey && $apiSecret),
                'missing' => array_values(array_filter([
                    $cloudName ? null : 'CLOUDINARY_CLOUD_NAME (ou VITE_CLOUDINARY_CLOUD_NAME)',
                    $uploadPreset ? null : 'CLOUDINARY_UPLOAD_PRESET (ou VITE_CLOUDINARY_UPLOAD_PRESET)',
                    $apiKey ? null : 'CLOUDINARY_API_KEY (ou VITE_CLOUDINARY_API_KEY) pour suppression',
                    $apiSecret ? null : 'CLOUDINARY_API_SECRET pour suppression',
                ])),
            ],
            'fallback' => 'storage/public',
            'supported_alternatives' => [
                'ImageKit',
                'Uploadcare',
                'Bunny CDN + Bunny Storage',
                'Cloudflare Images',
            ],
        ];
    }
}



