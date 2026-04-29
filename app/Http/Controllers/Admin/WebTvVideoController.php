<?php

namespace App\Http\Controllers\Admin;

use App\Models\WebTvVideo;
use App\Services\MediaUploadService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WebTvVideoController extends AdminController
{
    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        parent::__construct();
    }

    public function index(Request $request)
    {
        $query = WebTvVideo::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('emission_name', 'like', "%{$search}%")
                    ->orWhere('section_name', 'like', "%{$search}%");
            });
        }

        if ($filter = $request->get('featured')) {
            $query->where('is_featured', $filter === 'yes');
        }

        $videos = $query->orderByDesc('published_at')->paginate(20)->withQueryString();

        return Inertia::render('Admin/WebTv/Index', [
            'videos' => $videos,
            'filters' => $request->only(['search', 'featured']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        if ($request->hasFile('thumbnail')) {
            $upload = $this->mediaUploadService->upload($request->file('thumbnail'), 'webtv', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['thumbnail'] = $upload['url'];
        }

        if ($request->hasFile('emission_image_upload')) {
            $upload = $this->mediaUploadService->upload($request->file('emission_image_upload'), 'webtv', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['emission_image'] = $upload['url'];
        }

        if (empty($validated['thumbnail']) && !empty($validated['youtube_id'])) {
            $validated['thumbnail'] = "https://i.ytimg.com/vi/{$validated['youtube_id']}/hqdefault.jpg";
        }

        WebTvVideo::create($validated);
        cache()->forget('shared_content:v1');

        return back()->with('success', 'Video ajoutee.');
    }

    public function update(Request $request, WebTvVideo $webTvVideo)
    {
        $validated = $this->validatePayload($request, $webTvVideo);

        if ($request->hasFile('thumbnail')) {
            $upload = $this->mediaUploadService->upload($request->file('thumbnail'), 'webtv', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['thumbnail'] = $upload['url'];
        }

        if ($request->hasFile('emission_image_upload')) {
            $upload = $this->mediaUploadService->upload($request->file('emission_image_upload'), 'webtv', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['emission_image'] = $upload['url'];
        }

        if (empty($validated['thumbnail']) && !empty($validated['youtube_id'])) {
            $validated['thumbnail'] = "https://i.ytimg.com/vi/{$validated['youtube_id']}/hqdefault.jpg";
        }

        $webTvVideo->update($validated);
        cache()->forget('shared_content:v1');

        return back()->with('success', 'Video mise a jour.');
    }

    public function destroy(WebTvVideo $webTvVideo)
    {
        $webTvVideo->delete();
        cache()->forget('shared_content:v1');

        return back()->with('success', 'Video supprimee.');
    }

    private function validatePayload(Request $request, ?WebTvVideo $existing = null): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'youtube_id' => 'nullable|string|max:64',
            'youtube_url' => 'nullable|url|max:500',
            'thumbnail' => 'nullable|image|max:4096',
            'thumbnail_url' => 'nullable|url|max:2048',
            'emission_name' => 'nullable|string|max:255',
            'emission_image_upload' => 'nullable|image|max:4096',
            'emission_image' => 'nullable|url|max:2048',
            'emission_link' => 'nullable|url|max:500',
            'section_name' => 'nullable|string|max:120',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
        ];

        $validated = $request->validate($rules);

        if (!empty($validated['thumbnail_url'])) {
            $validated['thumbnail'] = $validated['thumbnail_url'];
        }

        $providedYoutubeId = trim((string) ($validated['youtube_id'] ?? ''));
        $providedYoutubeUrl = trim((string) ($validated['youtube_url'] ?? ''));
        $resolvedYoutubeId = $providedYoutubeId !== ''
            ? $providedYoutubeId
            : $this->extractYoutubeIdFromUrl($providedYoutubeUrl);

        if ($resolvedYoutubeId === '') {
            throw ValidationException::withMessages([
                'youtube_id' => 'Renseignez un ID YouTube valide ou une URL YouTube valide.',
            ]);
        }

        $validated['youtube_id'] = $resolvedYoutubeId;

        unset($validated['thumbnail_url'], $validated['youtube_url'], $validated['emission_image_upload']);
        $validated['is_featured'] = (bool) $request->boolean('is_featured');

        return $validated;
    }

    private function extractYoutubeIdFromUrl(string $url): string
    {
        if ($url === '') {
            return '';
        }

        $parts = parse_url($url);
        if (!is_array($parts)) {
            return '';
        }

        $host = strtolower((string) ($parts['host'] ?? ''));
        $path = trim((string) ($parts['path'] ?? ''), '/');

        if ($host === 'youtu.be' && $path !== '') {
            return $path;
        }

        if (str_contains($host, 'youtube.com')) {
            parse_str((string) ($parts['query'] ?? ''), $query);
            $videoId = trim((string) ($query['v'] ?? ''));
            if ($videoId !== '') {
                return $videoId;
            }

            if (str_starts_with($path, 'shorts/')) {
                return trim(substr($path, strlen('shorts/')));
            }

            if (str_starts_with($path, 'embed/')) {
                return trim(substr($path, strlen('embed/')));
            }
        }

        return '';
    }
}
