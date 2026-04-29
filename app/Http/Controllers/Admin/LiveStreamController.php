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
            'platform' => ['required', Rule::in(['tiktok', 'youtube', 'twitch'])],
            'title' => ['required', 'string', 'max:255'],
            'stream_url' => ['required', 'url', 'max:2048'],
            'embed_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}

