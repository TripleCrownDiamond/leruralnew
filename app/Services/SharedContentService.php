<?php

namespace App\Services;

use App\Models\Advertisement;
use App\Models\Announcement;
use App\Models\Comment;
use App\Models\CommodityPrice;
use App\Models\Emission;
use App\Models\LiveStream;
use App\Models\Partner;
use App\Models\PressPaper;
use App\Models\WebTvVideo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SharedContentService
{
    public function __construct(
        protected YouTubeService $youtube,
    ) {
    }

    public function get(): array
    {
        $youtubeChannel = $this->youtube->getChannelStats();
        $youtubeVideos = $this->youtube->getLatestVideos(12);
        $youtubePlaylistsForLookup = $this->youtube->getPlaylists(50);
        $playlistThumbnailsById = $this->playlistThumbnailsById($youtubePlaylistsForLookup);
        $youtubePlaylistIds = collect($youtubePlaylistsForLookup)
            ->pluck('id')
            ->map(fn ($id) => trim((string) $id))
            ->filter()
            ->unique()
            ->values()
            ->all();
        $youtubePlaylistPrimaryThumbnailsById = $this->youtube->getPlaylistsPrimaryVideoThumbnails($youtubePlaylistIds);
        $youtubePlaylistOembedThumbnailsById = $this->youtube->getPlaylistsOembedThumbnails($youtubePlaylistIds);
        $youtubePlaylists = collect($youtubePlaylistsForLookup)
            ->take(10)
            ->map(function (array $playlist) use ($playlistThumbnailsById, $youtubePlaylistPrimaryThumbnailsById, $youtubePlaylistOembedThumbnailsById) {
                $id = (string) ($playlist['id'] ?? '');
                $thumbnail = $playlist['thumbnail'] ?? null;

                if (!$thumbnail && $id !== '') {
                    $thumbnail = $playlistThumbnailsById[$id] ?? null;
                }

                if (!$thumbnail && $id !== '') {
                    $thumbnail = $youtubePlaylistPrimaryThumbnailsById[$id] ?? null;
                }

                if (!$thumbnail && $id !== '') {
                    $thumbnail = $youtubePlaylistOembedThumbnailsById[$id] ?? null;
                }

                return [
                    'id' => $id,
                    'title' => $playlist['title'] ?? '',
                    'description' => $playlist['description'] ?? '',
                    'thumbnail' => $thumbnail,
                    'item_count' => (int) ($playlist['item_count'] ?? 0),
                    'published_at' => $playlist['published_at'] ?? null,
                    'url' => $playlist['url'] ?? '',
                ];
            })
            ->values()
            ->all();

        $emissions = Emission::where('is_active', true)
            ->orderBy('order')
            ->get();

        $emissionPlaylistIds = $emissions
            ->map(fn (Emission $emission) => $this->extractPlaylistId($emission->playlist_url))
            ->filter()
            ->values()
            ->all();

        $playlistVideoThumbnailsById = $this->youtube->getPlaylistsPrimaryVideoThumbnails($emissionPlaylistIds);
        $playlistOembedThumbnailsById = $this->youtube->getPlaylistsOembedThumbnails($emissionPlaylistIds);
        $localEmissionThumbnailsByLink = $this->localEmissionThumbnailsByLink();
        $localWebTvVideos = WebTvVideo::orderByDesc('published_at')->take(4)->get();

        return [
            'market_prices' => CommodityPrice::where('active', true)
                ->get()
                ->map(fn ($price) => [
                    'name' => $price->name . ($price->country ? " ({$price->country})" : ''),
                    'price' => $price->price,
                    'unit' => $price->unit,
                    'note' => $price->note,
                ])
                ->values()
                ->all(),
            'webtv_videos' => $this->mapSidebarVideos($youtubeVideos, $localWebTvVideos->all()),
            'youtube_channel' => $youtubeChannel,
            'youtube_videos' => $youtubeVideos,
            'youtube_playlists' => $youtubePlaylists,
            'emissions' => $emissions
                ->map(fn ($emission) => [
                    'id' => $emission->id,
                    'name' => $emission->name,
                    'description' => $emission->description,
                    'image' => $this->resolveEmissionImage(
                        $emission->image,
                        $emission->playlist_url,
                        $playlistThumbnailsById,
                        $localEmissionThumbnailsByLink,
                        $playlistVideoThumbnailsById,
                        $playlistOembedThumbnailsById,
                    ),
                    'playlist_url' => $emission->playlist_url,
                ])
                ->values()
                ->all(),
            'partners' => Partner::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->map(fn ($partner) => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'logo' => $partner->logo,
                    'url' => $partner->url,
                ])
                ->values()
                ->all(),
            'announcements' => Announcement::where('is_active', true)
                ->orderBy('sort_order')
                ->orderByDesc('created_at')
                ->take(8)
                ->get()
                ->map(fn ($announcement) => [
                    'id' => $announcement->id,
                    'label' => $announcement->label,
                    'message' => $announcement->message,
                    'link_url' => $announcement->link_url,
                ])
                ->values()
                ->all(),
            'press_papers' => PressPaper::query()
                ->published()
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->take(6)
                ->get()
                ->map(fn (PressPaper $paper) => [
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'cover_url' => $this->toPublicUrl($paper->cover_image),
                    'published_human' => optional($paper->published_at)->diffForHumans(),
                    'price_label' => (float) $paper->price > 0
                        ? number_format((float) $paper->price, 0, ',', ' ') . ' FCFA'
                        : 'Gratuit',
                    'action_url' => route('press-papers.index'),
                    'action_label' => 'Voir les journaux',
                    'badge' => 'Premiere page',
                ])
                ->values()
                ->all(),
            'advertisements' => Advertisement::where('is_active', true)
                ->orderBy('location_id')
                ->get()
                ->mapWithKeys(fn ($advertisement) => [
                    $advertisement->location_id => [
                        'id' => $advertisement->id,
                        'location_id' => $advertisement->location_id,
                        'title' => $advertisement->title,
                        'description' => $advertisement->description,
                        'image_url' => $advertisement->image_url,
                        'redirect_url' => $advertisement->redirect_url,
                        'is_active' => (bool) $advertisement->is_active,
                    ],
                ])
                ->all(),
            'latest_comments' => Comment::where('is_approved', true)
                ->with('article')
                ->latest()
                ->take(30)
                ->get()
                ->map(fn ($comment) => [
                    'author_name' => $comment->author_name,
                    'content' => Str::limit($comment->content, 100),
                    'article_title' => $comment->article ? Str::limit($comment->article->title_fr, 40) : 'Article supprime',
                ])
                ->values()
                ->all(),
            'live_streams' => LiveStream::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get()
                ->map(fn (LiveStream $stream) => [
                    'id' => $stream->id,
                    'platform' => $stream->platform,
                    'title' => $stream->title,
                    'stream_url' => $stream->stream_url,
                    'embed_url' => $stream->embed_url,
                ])
                ->values()
                ->all(),
        ];
    }

    protected function mapSidebarVideos(array $youtubeVideos, array $localVideos): array
    {
        $items = collect($youtubeVideos)
            ->take(6)
            ->map(function (array $video) {
                $youtubeId = trim((string) ($video['youtube_id'] ?? ($video['id'] ?? '')));
                $title = trim((string) ($video['title'] ?? ''));
                $link = trim((string) ($video['url'] ?? ''));

                return [
                    'title' => $title,
                    'youtube_id' => $youtubeId,
                    'thumbnail' => $video['thumbnail'] ?? null,
                    'emission_name' => 'LE RURAL TV',
                    'emission_image' => null,
                    'emission_link' => $link !== '' ? $link : null,
                    'section_name' => null,
                    'published_at' => $video['published_at'] ?? now()->toIso8601String(),
                    'is_featured' => false,
                ];
            })
            ->merge(collect($localVideos)
                ->map(function (WebTvVideo $video) {
                    return [
                        'title' => $video->title,
                        'youtube_id' => trim((string) $video->youtube_id),
                        'thumbnail' => $video->thumbnail,
                        'emission_name' => $video->emission_name,
                        'emission_image' => $video->emission_image,
                        'emission_link' => $video->emission_link,
                        'section_name' => $video->section_name,
                        'published_at' => optional($video->published_at)->toIso8601String() ?? now()->toIso8601String(),
                        'is_featured' => (bool) $video->is_featured,
                    ];
                }));

        $deduped = [];
        $seen = [];

        foreach ($items as $item) {
            $youtubeId = strtolower(trim((string) ($item['youtube_id'] ?? '')));
            $link = strtolower(trim((string) ($item['emission_link'] ?? '')));
            $title = strtolower(trim((string) ($item['title'] ?? '')));
            $key = $youtubeId !== '' ? 'id:' . $youtubeId : ($link !== '' ? 'link:' . $link : 'title:' . $title);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $deduped[] = $item;
        }

        usort($deduped, static fn (array $left, array $right): int => strcmp(
            (string) ($right['published_at'] ?? ''),
            (string) ($left['published_at'] ?? '')
        ));

        return array_slice($deduped, 0, 4);
    }

    /**
     * @param array<int, array<string, mixed>> $youtubePlaylists
     * @return array<string, string>
     */
    private function playlistThumbnailsById(array $youtubePlaylists): array
    {
        return collect($youtubePlaylists)
            ->mapWithKeys(function (array $playlist) {
                $id = (string) ($playlist['id'] ?? '');
                $thumbnail = isset($playlist['thumbnail']) ? trim((string) $playlist['thumbnail']) : '';

                if ($id === '' || $thumbnail === '') {
                    return [];
                }

                return [$id => $thumbnail];
            })
            ->all();
    }

    /**
     * @return array<string, string>
     */
    private function localEmissionThumbnailsByLink(): array
    {
        return WebTvVideo::query()
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

                $playlistId = $this->extractPlaylistId($link);
                $map = [$link => $thumbnail];

                if ($playlistId) {
                    $map['playlist:' . $playlistId] = $thumbnail;
                }

                return $map;
            })
            ->all();
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * @param array<string, string> 
     * @param array<string, string> $playlistThumbnailsById
     * @param array<string, string> 
     * @param array<string, string> $localEmissionThumbnailsByLink
     * @param array<string, string> 
     * @param array<string, string> $playlistVideoThumbnailsById
     */
    private function resolveEmissionImage(
        ?string $image,
        ?string $playlistUrl,
        array $playlistThumbnailsById,
        array $localEmissionThumbnailsByLink,
        array $playlistVideoThumbnailsById,
        array $playlistOembedThumbnailsById,
    ): ?string {
        $image = filled($image) ? trim((string) $image) : null;

        if ($image) {
            return $image;
        }

        $playlistUrl = filled($playlistUrl) ? trim((string) $playlistUrl) : null;
        $playlistId = $this->extractPlaylistId($playlistUrl);

        return ($playlistId ? ($playlistThumbnailsById[$playlistId] ?? null) : null)
            ?: ($playlistId ? ($playlistVideoThumbnailsById[$playlistId] ?? null) : null)
            ?: ($playlistId ? ($playlistOembedThumbnailsById[$playlistId] ?? null) : null)
            ?: ($playlistUrl ? ($localEmissionThumbnailsByLink[$playlistUrl] ?? null) : null)
            ?: ($playlistId ? ($localEmissionThumbnailsByLink['playlist:' . $playlistId] ?? null) : null);
    }

    private function extractPlaylistId(?string $playlistUrl): ?string
    {
        if (!filled($playlistUrl)) {
            return null;
        }

        $playlistUrl = trim((string) $playlistUrl);

        if (preg_match('/[?&]list=([^&]+)/', $playlistUrl, $matches) === 1) {
            return urldecode($matches[1]);
        }

        return null;
    }
}
