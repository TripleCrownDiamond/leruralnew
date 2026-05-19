<?php

namespace App\Http\Controllers\Admin;

use App\Models\LiveStream;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LiveStreamController extends AdminController
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/LiveStreams/Index', [
            'liveStreams' => LiveStream::query()
                ->orderBy('sort_order')
                ->orderByDesc('starts_at')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        LiveStream::create([
            'platform' => $data['platform'],
            'title' => trim($data['title']),
            'stream_url' => trim($data['stream_url']),
            'embed_url' => filled($data['embed_url'] ?? null) ? trim($data['embed_url']) : null,
            'replay_url' => filled($data['replay_url'] ?? null) ? trim($data['replay_url']) : null,
            'thumbnail_url' => filled($data['thumbnail_url'] ?? null) ? trim($data['thumbnail_url']) : null,
            'fallback_image_url' => filled($data['fallback_image_url'] ?? null) ? trim($data['fallback_image_url']) : null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => !empty($data['is_active']),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Live ajoute.');
    }

    public function update(Request $request, LiveStream $liveStream)
    {
        $data = $this->validatePayload($request);

        $liveStream->update([
            'platform' => $data['platform'],
            'title' => trim($data['title']),
            'stream_url' => trim($data['stream_url']),
            'embed_url' => filled($data['embed_url'] ?? null) ? trim($data['embed_url']) : null,
            'replay_url' => filled($data['replay_url'] ?? null) ? trim($data['replay_url']) : null,
            'thumbnail_url' => filled($data['thumbnail_url'] ?? null) ? trim($data['thumbnail_url']) : null,
            'fallback_image_url' => filled($data['fallback_image_url'] ?? null) ? trim($data['fallback_image_url']) : null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => !empty($data['is_active']),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Live mis a jour.');
    }

    public function destroy(LiveStream $liveStream)
    {
        $liveStream->delete();

        return back()->with('success', 'Live supprime.');
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'platform' => ['required', Rule::in(['youtube', 'facebook', 'tiktok', 'twitch', 'obs', 'streamyard', 'custom'])],
            'title' => ['required', 'string', 'max:255'],
            'stream_url' => ['required', 'url', 'max:2048'],
            'embed_url' => ['nullable', 'url', 'max:2048'],
            'replay_url' => ['nullable', 'url', 'max:2048'],
            'thumbnail_url' => ['nullable', 'url', 'max:2048'],
            'fallback_image_url' => ['nullable', 'url', 'max:2048'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
