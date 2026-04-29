<?php

namespace App\Http\Controllers\Admin;

use App\Models\MediaAsset;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaLibraryController extends AdminController
{
    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        parent::__construct();
    }

    public function index(Request $request): Response
    {
        $query = $this->baseQuery($request)->latest();

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('original_name', 'like', "%{$search}%")
                    ->orWhere('mime_type', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $kind = trim((string) $request->string('kind'));
        if ($kind !== '' && $kind !== 'all') {
            $this->applyKindFilter($query, $kind);
        }

        $assets = $query->paginate(30)->withQueryString();

        return Inertia::render('Admin/Media/Index', [
            'assets' => $assets,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'kind' => $request->string('kind')->toString() ?: 'all',
            ],
            'cdnRecommendations' => [
                'Cloudinary',
                'ImageKit',
                'Uploadcare',
                'Bunny CDN + Bunny Storage',
                'Cloudflare Images',
            ],
        ]);
    }

    public function library(Request $request): JsonResponse
    {
        $query = $this->baseQuery($request)->latest();

        $search = trim((string) $request->string('search'));
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('original_name', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $kind = trim((string) $request->string('kind'));
        if ($kind !== '' && $kind !== 'all') {
            $this->applyKindFilter($query, $kind);
        }

        $items = $query
            ->limit(60)
            ->get(['id', 'original_name', 'url', 'kind', 'mime_type', 'created_at']);

        return response()->json([
            'data' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:25600'],
        ]);

        $file = $validated['file'];
        $result = $this->mediaUploadService->upload($file, 'media-library', [
            'max_width' => 1800,
            'quality' => 84,
            'user_id' => $request->user()?->id,
        ]);

        $asset = null;
        if (!empty($result['asset_id'])) {
            $asset = MediaAsset::query()->find($result['asset_id']);
        }

        if (!$asset && !empty($result['url'])) {
            $asset = MediaAsset::query()->where('url', (string) $result['url'])->latest('id')->first();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'asset' => $asset,
                'url' => $result['url'] ?? null,
            ], 201);
        }

        return back()->with('success', 'Media charge avec succes.');
    }

    public function destroy(Request $request, MediaAsset $media)
    {
        if (!$this->canAccessAsset($request, $media)) {
            abort(403);
        }

        $this->mediaUploadService->delete($media->disk, $media->path, $media->meta ?? []);
        $media->delete();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('success', 'Media supprime.');
    }

    private function baseQuery(Request $request)
    {
        $query = MediaAsset::query();

        if (($request->user()?->role ?? null) !== 'admin') {
            $query->where('user_id', $request->user()?->id);
        }

        return $query;
    }

    private function canAccessAsset(Request $request, MediaAsset $asset): bool
    {
        if (($request->user()?->role ?? null) === 'admin') {
            return true;
        }

        return (int) $asset->user_id === (int) ($request->user()?->id ?? 0);
    }

    private function applyKindFilter($query, string $kind): void
    {
        if ($kind === 'image') {
            $query->where(function ($builder) {
                $builder
                    ->where('kind', 'image')
                    ->orWhere('mime_type', 'like', 'image/%')
                    ->orWhere('url', 'like', '%.jpg%')
                    ->orWhere('url', 'like', '%.jpeg%')
                    ->orWhere('url', 'like', '%.png%')
                    ->orWhere('url', 'like', '%.webp%')
                    ->orWhere('url', 'like', '%.gif%')
                    ->orWhere('url', 'like', '%.avif%')
                    ->orWhere('url', 'like', '%.svg%');
            });

            return;
        }

        if ($kind === 'video') {
            $query->where(function ($builder) {
                $builder
                    ->where('kind', 'video')
                    ->orWhere('mime_type', 'like', 'video/%')
                    ->orWhere('url', 'like', '%.mp4%')
                    ->orWhere('url', 'like', '%.mov%')
                    ->orWhere('url', 'like', '%.webm%')
                    ->orWhere('url', 'like', '%.m3u8%');
            });

            return;
        }

        if ($kind === 'document') {
            $query->where(function ($builder) {
                $builder
                    ->where('kind', 'document')
                    ->orWhere('mime_type', 'like', 'application/%')
                    ->orWhere('url', 'like', '%.pdf%')
                    ->orWhere('url', 'like', '%.doc%')
                    ->orWhere('url', 'like', '%.docx%');
            });

            return;
        }

        $query->where('kind', $kind);
    }
}
