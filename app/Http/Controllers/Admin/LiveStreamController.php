<?php

namespace App\Http\Controllers\Admin;

use App\Models\LiveStream;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LiveStreamController extends AdminController
{
    public function index(): Response
    {
        $query = LiveStream::query()->orderBy('sort_order');

        if (Schema::hasColumn('live_streams', 'starts_at')) {
            $query->orderByDesc('starts_at');
        }

        return Inertia::render('Dashboard/LiveStreams/Index', [
            'liveStreams' => $query
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        if ($error = $this->ensureScheduleColumnsExist($data)) {
            return back()->withInput()->with('error', $error);
        }

        try {
            LiveStream::create($this->filterExistingColumns($this->buildPayload($data)));
        } catch (\Throwable $e) {
            Log::error('LiveStream store failed', [
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()->with('error', 'Impossible d\'enregistrer ce live. Verifiez les migrations live_streams.');
        }

        return back()->with('success', 'Live ajoute.');
    }

    public function update(Request $request, LiveStream $liveStream)
    {
        $data = $this->validatePayload($request);

        if ($error = $this->ensureScheduleColumnsExist($data)) {
            return back()->withInput()->with('error', $error);
        }

        try {
            $liveStream->update($this->filterExistingColumns($this->buildPayload($data)));
        } catch (\Throwable $e) {
            Log::error('LiveStream update failed', [
                'live_stream_id' => $liveStream->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withInput()->with('error', 'Impossible de mettre a jour ce live. Verifiez les migrations live_streams.');
        }

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

    private function buildPayload(array $data): array
    {
        return [
            'platform' => $data['platform'],
            'title' => trim((string) $data['title']),
            'stream_url' => trim((string) $data['stream_url']),
            'embed_url' => filled($data['embed_url'] ?? null) ? trim((string) $data['embed_url']) : null,
            'replay_url' => filled($data['replay_url'] ?? null) ? trim((string) $data['replay_url']) : null,
            'thumbnail_url' => filled($data['thumbnail_url'] ?? null) ? trim((string) $data['thumbnail_url']) : null,
            'fallback_image_url' => filled($data['fallback_image_url'] ?? null) ? trim((string) $data['fallback_image_url']) : null,
            'starts_at' => $this->normalizeDateTime($data['starts_at'] ?? null),
            'ends_at' => $this->normalizeDateTime($data['ends_at'] ?? null),
            'is_active' => !empty($data['is_active']),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];
    }

    private function normalizeDateTime(mixed $value): ?string
    {
        if (!filled($value)) {
            return null;
        }

        try {
            return Carbon::parse((string) $value)->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }

    private function ensureScheduleColumnsExist(array $data): ?string
    {
        $wantsSchedule = filled($data['starts_at'] ?? null) || filled($data['ends_at'] ?? null);
        if (!$wantsSchedule) {
            return null;
        }

        if (!Schema::hasColumn('live_streams', 'starts_at') || !Schema::hasColumn('live_streams', 'ends_at')) {
            return 'Programmation indisponible: migration manquante. Executez php artisan migrate --force.';
        }

        return null;
    }

    private function filterExistingColumns(array $payload): array
    {
        $columns = array_flip(Schema::getColumnListing('live_streams'));
        $filtered = [];

        foreach ($payload as $key => $value) {
            if (isset($columns[$key])) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }
}
