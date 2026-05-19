<?php

namespace Database\Seeders;

use App\Models\LiveStream;
use App\Services\YouTubeService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;

class LiveStreamSeeder extends Seeder
{
    public function run(): void
    {
        $videos = app(YouTubeService::class)->getLatestVideos(10);
        $videoPool = $this->buildVideoPool($videos);
        $startDate = now()->startOfDay();
        $endDate = now()->copy()->startOfDay()->addDays((Carbon::MONDAY - now()->dayOfWeek + 7) % 7)->endOfDay();
        $days = iterator_to_array(CarbonPeriod::create($startDate, '1 day', $endDate));
        $slots = [
            ['hour' => 7, 'minute' => 30],
            ['hour' => 15, 'minute' => 30],
        ];

        foreach ($days as $dayIndex => $day) {
            foreach ($slots as $slotIndex => $slot) {
                $video = $videoPool[($dayIndex * count($slots) + $slotIndex) % count($videoPool)];
                $startsAt = $day->copy()->setTime($slot['hour'], $slot['minute']);
                $endsAt = $startsAt->copy()->addHours(1);

                LiveStream::updateOrCreate(
                    ['starts_at' => $startsAt->toDateTimeString()],
                    [
                        'platform' => 'youtube',
                        'title' => $video['title'],
                        'stream_url' => $video['url'],
                        'embed_url' => 'https://www.youtube.com/embed/' . $video['youtube_id'] . '?autoplay=1&rel=0',
                        'thumbnail_url' => $video['thumbnail'],
                        'fallback_image_url' => $video['thumbnail'],
                        'starts_at' => $startsAt,
                        'ends_at' => $endsAt,
                        'is_active' => true,
                        'sort_order' => $dayIndex * 10 + $slotIndex,
                    ]
                );
            }
        }
    }

    /**
     * @param array<int, array<string, mixed>> $videos
     * @return array<int, array{title: string, youtube_id: string, url: string, thumbnail: string}>
     */
    private function buildVideoPool(array $videos): array
    {
        $pool = collect($videos)
            ->map(function (array $video): ?array {
                $youtubeId = trim((string) ($video['youtube_id'] ?? $video['id'] ?? ''));
                $title = trim((string) ($video['title'] ?? ''));
                $url = trim((string) ($video['url'] ?? ''));
                $thumbnail = trim((string) ($video['thumbnail'] ?? ''));

                if ($youtubeId === '' || $title === '') {
                    return null;
                }

                return [
                    'title' => $title,
                    'youtube_id' => $youtubeId,
                    'url' => $url !== '' ? $url : 'https://www.youtube.com/watch?v=' . $youtubeId,
                    'thumbnail' => $thumbnail !== '' ? $thumbnail : 'https://img.youtube.com/vi/' . $youtubeId . '/hqdefault.jpg',
                ];
            })
            ->filter()
            ->values()
            ->all();

        if (!empty($pool)) {
            return $pool;
        }

        return [
            [
                'title' => 'Emission Web TV - Edition du jour',
                'youtube_id' => 'GZjXQAl_SiI',
                'url' => 'https://www.youtube.com/watch?v=GZjXQAl_SiI',
                'thumbnail' => 'https://img.youtube.com/vi/GZjXQAl_SiI/hqdefault.jpg',
            ],
            [
                'title' => 'Lexique Agricole - Edition test',
                'youtube_id' => 'SV4kUpPuMCg',
                'url' => 'https://www.youtube.com/watch?v=SV4kUpPuMCg',
                'thumbnail' => 'https://img.youtube.com/vi/SV4kUpPuMCg/hqdefault.jpg',
            ],
            [
                'title' => 'Elles comptent - Edition test',
                'youtube_id' => '7nlKoLjUGLs',
                'url' => 'https://www.youtube.com/watch?v=7nlKoLjUGLs',
                'thumbnail' => 'https://img.youtube.com/vi/7nlKoLjUGLs/hqdefault.jpg',
            ],
            [
                'title' => 'Le Journal - Edition test',
                'youtube_id' => 'EtqOKdAwUvY',
                'url' => 'https://www.youtube.com/watch?v=EtqOKdAwUvY',
                'thumbnail' => 'https://img.youtube.com/vi/EtqOKdAwUvY/hqdefault.jpg',
            ],
        ];
    }
}