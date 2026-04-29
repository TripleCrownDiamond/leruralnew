<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YouTubeService
{
    protected ?string $apiKey;
    protected ?string $channelId;
    protected string $channelHandle;
    protected ?string $channelUrl;
    protected int $cacheTtl;

    public function __construct()
    {
        $this->apiKey = config('services.youtube.api_key');
        $this->channelId = config('services.youtube.channel_id');
        $this->channelHandle = (string) config('services.youtube.channel_handle');
        $this->channelUrl = config('services.youtube.channel_url');
        $this->cacheTtl = (int) config('services.youtube.cache_ttl', 3600);
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    public function resolveChannelId(): ?string
    {
        if ($this->channelId) {
            return $this->channelId;
        }

        if (! $this->isConfigured()) {
            return null;
        }

        $cacheKey = 'youtube:channel_id:' . md5(trim($this->channelHandle . '|' . (string) $this->channelUrl));
        $cached = Cache::get($cacheKey);
        if (is_string($cached) && trim($cached) !== '') {
            return trim($cached);
        }

        $channelId = $this->resolveChannelIdFromHandle($this->channelHandle)
            ?? $this->resolveChannelIdFromUrl($this->channelUrl)
            ?? $this->resolveChannelIdFromUrl($this->channelHandle);

        if (is_string($channelId) && trim($channelId) !== '') {
            Cache::put($cacheKey, trim($channelId), now()->addDays(30));
            return trim($channelId);
        }

        return null;
    }

    public function getChannelStats(): ?array
    {
        $lookup = $this->buildChannelLookup();
        $cacheKey = 'youtube:stats:' . md5(json_encode($lookup ?: [$this->channelUrl, $this->channelHandle]));
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return $cached;
        }

        if ($this->isConfigured() && $lookup !== []) {
            try {
                $response = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/channels', array_merge([
                    'part' => 'snippet,statistics,brandingSettings',
                    'key' => $this->apiKey,
                ], $lookup));

                if ($response->successful() && $response->json('items.0')) {
                    $item = $response->json('items.0');

                    $resolvedId = (string) ($item['id'] ?? $this->channelId ?? '');
                    if ($resolvedId === '' && ! empty($lookup['forHandle'])) {
                        $resolvedId = trim((string) ($this->resolveChannelIdFromHandle($lookup['forHandle']) ?? ''));
                    }

                    $stats = [
                        'id' => $resolvedId,
                        'title' => $item['snippet']['title'] ?? null,
                        'description' => $item['snippet']['description'] ?? null,
                        'custom_url' => $item['snippet']['customUrl'] ?? null,
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url']
                            ?? $item['snippet']['thumbnails']['default']['url']
                            ?? null,
                        'banner' => $item['brandingSettings']['image']['bannerExternalUrl'] ?? null,
                        'subscriber_count' => (int) ($item['statistics']['subscriberCount'] ?? 0),
                        'hidden_subscriber_count' => (bool) ($item['statistics']['hiddenSubscriberCount'] ?? false),
                        'view_count' => (int) ($item['statistics']['viewCount'] ?? 0),
                        'video_count' => (int) ($item['statistics']['videoCount'] ?? 0),
                        'url' => $resolvedId !== ''
                            ? 'https://www.youtube.com/channel/' . $resolvedId
                            : ($this->channelUrl ?: 'https://www.youtube.com'),
                    ];

                    Cache::put($cacheKey, $stats, $this->cacheTtl);

                    return $stats;
                }
            } catch (\Throwable $e) {
                Log::warning('YouTube getChannelStats failed', ['error' => $e->getMessage()]);
            }
        }

        $fallback = $this->getChannelStatsFromOembed();
        if ($fallback !== null) {
            Cache::put($cacheKey, $fallback, $this->cacheTtl);
        }

        return $fallback;
    }

    private function getChannelStatsFromOembed(): ?array
    {
        $candidate = $this->buildChannelOembedUrl();
        if ($candidate === null) {
            return null;
        }

        $cacheKey = 'youtube:stats:oembed:' . md5($candidate);
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $response = Http::connectTimeout(3)->timeout(5)->get('https://www.youtube.com/oembed', [
                'url' => $candidate,
                'format' => 'json',
            ]);

            if (! $response->successful()) {
                return null;
            }

            $stats = [
                'id' => '',
                'title' => $response->json('title') ?? null,
                'description' => $response->json('author_name') ?? null,
                'custom_url' => null,
                'thumbnail' => $response->json('thumbnail_url') ?? null,
                'banner' => null,
                'subscriber_count' => 0,
                'hidden_subscriber_count' => true,
                'view_count' => 0,
                'video_count' => 0,
                'url' => $response->json('author_url') ?: $candidate,
            ];

            Cache::put($cacheKey, $stats, $this->cacheTtl);

            return $stats;
        } catch (\Throwable $e) {
            Log::warning('YouTube getChannelStats oEmbed failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function buildChannelOembedUrl(): ?string
    {
        $candidate = trim((string) ($this->channelUrl ?: $this->channelHandle));
        if ($candidate === '') {
            return null;
        }

        if (str_starts_with($candidate, 'http://') || str_starts_with($candidate, 'https://')) {
            return $candidate;
        }

        if (str_starts_with($candidate, '@')) {
            return 'https://www.youtube.com/' . $candidate;
        }

        if (preg_match('/^[A-Za-z0-9_-]{20,}$/', $candidate) === 1) {
            return 'https://www.youtube.com/channel/' . $candidate;
        }

        return 'https://www.youtube.com/@' . ltrim($candidate, '@');
    }

    public function getLatestVideos(int $maxResults = 12): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        $channelId = $this->resolveChannelId();
        if (! $channelId) {
            return [];
        }

        return Cache::remember("youtube:videos:{$channelId}:{$maxResults}", $this->cacheTtl, function () use ($channelId, $maxResults) {
            try {
                $search = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/search', [
                    'part' => 'snippet',
                    'channelId' => $channelId,
                    'order' => 'date',
                    'type' => 'video',
                    'maxResults' => min($maxResults, 50),
                    'key' => $this->apiKey,
                ]);

                if (! $search->successful()) {
                    return [];
                }

                $items = $search->json('items') ?? [];
                $videoIds = array_filter(array_map(fn ($v) => $v['id']['videoId'] ?? null, $items));

                if (empty($videoIds)) {
                    return [];
                }

                $details = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/videos', [
                    'part' => 'snippet,statistics,contentDetails',
                    'id' => implode(',', $videoIds),
                    'key' => $this->apiKey,
                ]);

                if (! $details->successful()) {
                    return [];
                }

                return collect($details->json('items') ?? [])->map(function ($item) {
                    return [
                        'id' => $item['id'],
                        'youtube_id' => $item['id'],
                        'title' => $item['snippet']['title'] ?? '',
                        'description' => $item['snippet']['description'] ?? '',
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url']
                            ?? $item['snippet']['thumbnails']['medium']['url']
                            ?? "https://img.youtube.com/vi/{$item['id']}/hqdefault.jpg",
                        'published_at' => $item['snippet']['publishedAt'] ?? null,
                        'duration_iso' => $item['contentDetails']['duration'] ?? null,
                        'duration' => self::parseDuration($item['contentDetails']['duration'] ?? null),
                        'view_count' => (int) ($item['statistics']['viewCount'] ?? 0),
                        'like_count' => (int) ($item['statistics']['likeCount'] ?? 0),
                        'comment_count' => (int) ($item['statistics']['commentCount'] ?? 0),
                        'url' => 'https://www.youtube.com/watch?v=' . $item['id'],
                    ];
                })->values()->all();
            } catch (\Throwable $e) {
                Log::warning('YouTube getLatestVideos failed', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    public function getPlaylists(int $maxResults = 10): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        $channelId = $this->resolveChannelId();
        if (! $channelId) {
            return [];
        }

        return Cache::remember("youtube:playlists:{$channelId}:{$maxResults}", $this->cacheTtl, function () use ($channelId, $maxResults) {
            try {
                $response = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/playlists', [
                    'part' => 'snippet,contentDetails',
                    'channelId' => $channelId,
                    'maxResults' => min($maxResults, 50),
                    'key' => $this->apiKey,
                ]);

                if (! $response->successful()) {
                    return [];
                }

                return collect($response->json('items') ?? [])->map(function ($item) {
                    return [
                        'id' => $item['id'],
                        'title' => $item['snippet']['title'] ?? '',
                        'description' => $item['snippet']['description'] ?? '',
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url']
                            ?? $item['snippet']['thumbnails']['medium']['url']
                            ?? null,
                        'item_count' => (int) ($item['contentDetails']['itemCount'] ?? 0),
                        'published_at' => $item['snippet']['publishedAt'] ?? null,
                        'url' => 'https://www.youtube.com/playlist?list=' . $item['id'],
                    ];
                })->values()->all();
            } catch (\Throwable $e) {
                Log::warning('YouTube getPlaylists failed', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    protected static function parseDuration(?string $iso): ?string
    {
        if (! $iso) {
            return null;
        }

        try {
            preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $iso, $m);
            $h = (int) ($m[1] ?? 0);
            $mi = (int) ($m[2] ?? 0);
            $s = (int) ($m[3] ?? 0);

            if ($h > 0) {
                return sprintf('%d:%02d:%02d', $h, $mi, $s);
            }

            return sprintf('%d:%02d', $mi, $s);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Resolve playlist thumbnails via YouTube oEmbed endpoint (no API key needed).
     *
     * @param array<int, string> $playlistIds
     * @return array<string, string>
     */
    public function getPlaylistsPrimaryVideoThumbnails(array $playlistIds): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        $ids = collect($playlistIds)->take(10)
            ->map(fn ($id) => trim((string) $id))
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return Cache::remember(
            'youtube:playlist-items-thumbnails:' . md5($ids->implode(',')),
            $this->cacheTtl,
            function () use ($ids) {
                $thumbnails = [];

                foreach ($ids as $playlistId) {
                    try {
                        $response = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/playlistItems', [
                            'part' => 'snippet',
                            'playlistId' => $playlistId,
                            'maxResults' => 1,
                            'key' => $this->apiKey,
                        ]);

                        if (! $response->successful()) {
                            continue;
                        }

                        $snippet = $response->json('items.0.snippet');
                        if (! is_array($snippet)) {
                            continue;
                        }

                        $thumbnail = $snippet['thumbnails']['high']['url']
                            ?? $snippet['thumbnails']['medium']['url']
                            ?? $snippet['thumbnails']['default']['url']
                            ?? null;

                        if (is_string($thumbnail) && trim($thumbnail) !== '') {
                            $thumbnails[$playlistId] = trim($thumbnail);
                        }
                    } catch (\Throwable $e) {
                        Log::warning('YouTube getPlaylistsPrimaryVideoThumbnails failed', [
                            'playlist_id' => $playlistId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                return $thumbnails;
            }
        );
    }

    /**
     * Resolve playlist thumbnails via YouTube oEmbed endpoint (no API key needed).
     *
     * @param array<int, string> $playlistIds
     * @return array<string, string>
     */
    public function getPlaylistsOembedThumbnails(array $playlistIds): array
    {
        $ids = collect($playlistIds)->take(10)
            ->map(fn ($id) => trim((string) $id))
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return Cache::remember(
            'youtube:playlist-oembed-thumbnails:' . md5($ids->implode(',')),
            $this->cacheTtl,
            function () use ($ids) {
                $thumbnails = [];

                foreach ($ids as $playlistId) {
                    try {
                        $playlistUrl = 'https://www.youtube.com/playlist?list=' . urlencode($playlistId);
                        $response = Http::connectTimeout(3)->timeout(5)->get('https://www.youtube.com/oembed', [
                            'url' => $playlistUrl,
                            'format' => 'json',
                        ]);

                        if (! $response->successful()) {
                            continue;
                        }

                        $thumbnail = trim((string) ($response->json('thumbnail_url') ?? ''));
                        if ($thumbnail !== '') {
                            $thumbnails[$playlistId] = $thumbnail;
                        }
                    } catch (\Throwable $e) {
                        Log::warning('YouTube getPlaylistsOembedThumbnails failed', [
                            'playlist_id' => $playlistId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                return $thumbnails;
            }
        );
    }

    public function flushCache(): void
    {
        $channelId = $this->resolveChannelId();
        if ($channelId) {
            Cache::forget("youtube:stats:{$channelId}");
            foreach ([6, 8, 12, 20, 50] as $n) {
                Cache::forget("youtube:videos:{$channelId}:{$n}");
                Cache::forget("youtube:playlists:{$channelId}:{$n}");
            }
        }
    }

    private function buildChannelLookup(): array
    {
        if ($this->channelId) {
            return ['id' => $this->channelId];
        }

        $channelIdFromHandle = $this->extractChannelIdFromUrl($this->channelHandle);
        if ($channelIdFromHandle !== null) {
            return ['id' => $channelIdFromHandle];
        }

        $handleFromHandle = $this->normalizeHandle($this->extractHandleFromUrl($this->channelHandle) ?? $this->channelHandle);
        if ($handleFromHandle !== null) {
            return ['forHandle' => $handleFromHandle];
        }

        $channelIdFromUrl = $this->extractChannelIdFromUrl($this->channelUrl);
        if ($channelIdFromUrl !== null) {
            return ['id' => $channelIdFromUrl];
        }

        $handleFromUrl = $this->normalizeHandle($this->extractHandleFromUrl($this->channelUrl));
        if ($handleFromUrl !== null) {
            return ['forHandle' => $handleFromUrl];
        }

        return [];
    }

    private function resolveChannelIdFromHandle(?string $handle): ?string
    {
        $channelId = $this->extractChannelIdFromUrl($handle);
        if ($channelId !== null) {
            return $channelId;
        }

        $handle = $this->normalizeHandle($this->extractHandleFromUrl($handle) ?? $handle);
        if ($handle === null) {
            return null;
        }

        return $this->lookupChannelId(['forHandle' => $handle])
            ?? $this->lookupChannelId(['forUsername' => ltrim($handle, '@')]);
    }

    private function resolveChannelIdFromUrl(?string $url): ?string
    {
        $urlChannelId = $this->extractChannelIdFromUrl($url);
        if ($urlChannelId !== null) {
            return $urlChannelId;
        }

        $handle = $this->normalizeHandle($this->extractHandleFromUrl($url));
        if ($handle === null) {
            return null;
        }

        return $this->lookupChannelId(['forHandle' => $handle]);
    }

    private function lookupChannelId(array $query): ?string
    {
        if (! $this->isConfigured() || $query === []) {
            return null;
        }

        try {
            $response = Http::connectTimeout(3)->timeout(5)->get('https://www.googleapis.com/youtube/v3/channels', array_merge([
                'part' => 'id',
                'key' => $this->apiKey,
            ], $query));

            if ($response->successful() && $response->json('items.0.id')) {
                return (string) $response->json('items.0.id');
            }
        } catch (\Throwable $e) {
            Log::warning('YouTube resolveChannelId failed', ['error' => $e->getMessage(), 'query' => $query]);
        }

        return null;
    }

    private function normalizeHandle(?string $handle): ?string
    {
        $handle = trim((string) $handle);

        if ($handle === '') {
            return null;
        }

        if (str_contains($handle, 'youtube.com/')) {
            $handle = $this->extractHandleFromUrl($handle) ?? $handle;
        }

        $handle = ltrim($handle, '@');

        return $handle !== '' ? '@' . $handle : null;
    }

    private function extractHandleFromUrl(?string $url): ?string
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        if (preg_match('~youtube\.com/@([^/?#]+)~i', $url, $matches) === 1) {
            return '@' . $matches[1];
        }

        return null;
    }

    private function extractChannelIdFromUrl(?string $url): ?string
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        if (preg_match('~youtube\.com/channel/([^/?#]+)~i', $url, $matches) === 1) {
            return $matches[1] !== '' ? $matches[1] : null;
        }

        return null;
    }
}
