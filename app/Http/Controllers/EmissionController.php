<?php

namespace App\Http\Controllers;

use App\Models\Emission;
use App\Models\WebTvVideo;
use App\Services\MediaUploadService;
use App\Services\YouTubeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmissionController extends Controller
{
    public function __construct(
        private readonly MediaUploadService $mediaUploadService,
        private readonly YouTubeService $youTubeService,
    ) {
    }

    public function index()
    {
        $playlistThumbnailsById = collect($this->youTubeService->getPlaylists(50))
            ->mapWithKeys(function (array $playlist) {
                $id = (string) ($playlist['id'] ?? '');
                $thumbnail = isset($playlist['thumbnail']) ? trim((string) $playlist['thumbnail']) : '';

                if ($id === '' || $thumbnail === '') {
                    return [];
                }

                return [$id => $thumbnail];
            })
            ->all();

        $emissionVideoThumbnailsByLink = WebTvVideo::query()
            ->whereNotNull('emission_link')
            ->orderByDesc('published_at')
            ->get()
            ->mapWithKeys(function (WebTvVideo $video) {
                $link = trim((string) ($video->emission_link ?? ''));
                if ($link === '') {
                    return [];
                }

                $thumbnail = trim((string) ($video->thumbnail ?? ''));

                if ($thumbnail === '' && filled($video->youtube_id)) {
                    $thumbnail = 'https://img.youtube.com/vi/' . trim((string) $video->youtube_id) . '/hqdefault.jpg';
                }

                if ($thumbnail === '') {
                    return [];
                }

                return [$link => $thumbnail];
            })
            ->all();

        $emissions = Emission::orderBy('order')->get()->map(function (Emission $emission) use ($playlistThumbnailsById, $emissionVideoThumbnailsByLink) {
            $playlistId = $this->extractPlaylistId($emission->playlist_url);
            $playlistThumb = $playlistId !== '' ? ($playlistThumbnailsById[$playlistId] ?? null) : null;
            $playlistSeriesThumb = $playlistId !== '' ? $this->playlistSeriesThumbnail($playlistId) : null;
            $localVideoThumb = $emissionVideoThumbnailsByLink[trim((string) $emission->playlist_url)] ?? null;

            return [
                'id' => $emission->id,
                'name' => $emission->name,
                'description' => $emission->description,
                'image' => $emission->image ?: ($playlistThumb ?: ($playlistSeriesThumb ?: $localVideoThumb)),
                'playlist_url' => $emission->playlist_url,
                'is_active' => (bool) $emission->is_active,
                'order' => (int) $emission->order,
            ];
        })->values();

        return Inertia::render('Dashboard/Emissions/Index', [
            'emissions' => $emissions,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Emissions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
            'image_url' => 'nullable|url|max:2048',
            'playlist_url' => 'required|url',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        $validated['image'] = filled($validated['image_url'] ?? null) ? trim((string) $validated['image_url']) : null;

        if ($request->hasFile('image')) {
            $upload = $this->mediaUploadService->upload($request->file('image'), 'emissions', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['image'] = $upload['url'];
        }

        unset($validated['image_url']);

        Emission::create($validated);

        cache()->forget('shared_content:v1');

        return redirect()->route('dashboard.emissions.index')
            ->with('success', 'Emission creee avec succes.');
    }

    public function edit(Emission $emission)
    {
        return Inertia::render('Dashboard/Emissions/Edit', [
            'emission' => $emission,
        ]);
    }

    public function update(Request $request, Emission $emission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
            'image_url' => 'nullable|url|max:2048',
            'playlist_url' => 'required|url',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if (filled($validated['image_url'] ?? null)) {
            $validated['image'] = trim((string) $validated['image_url']);
        }

        if ($request->hasFile('image')) {
            $upload = $this->mediaUploadService->upload($request->file('image'), 'emissions', [
                'max_width' => 1800,
                'quality' => 84,
            ]);
            $validated['image'] = $upload['url'];
        }

        unset($validated['image_url']);

        $emission->update($validated);

        cache()->forget('shared_content:v1');

        return redirect()->route('dashboard.emissions.index')
            ->with('success', 'Emission mise a jour avec succes.');
    }

    public function destroy(Emission $emission)
    {
        $emission->delete();

        cache()->forget('shared_content:v1');

        return redirect()->back()->with('success', 'Emission supprimee.');
    }

    private function playlistSeriesThumbnail(?string $playlistId): ?string
    {
        if (!filled($playlistId)) {
            return null;
        }

        return 'https://i.ytimg.com/vi_webp/videoseries/hqdefault.webp?list=' . urlencode(trim((string) $playlistId));
    }

    private function extractPlaylistId(?string $playlistUrl): string
    {
        if (!filled($playlistUrl)) {
            return '';
        }

        $playlistUrl = trim((string) $playlistUrl);

        if (preg_match('/[?&]list=([^&]+)/', $playlistUrl, $matches) === 1) {
            return urldecode($matches[1]);
        }

        return '';
    }
}
