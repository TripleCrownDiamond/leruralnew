<?php

namespace App\Console\Commands;

use App\Services\YouTubeService;
use Illuminate\Console\Command;

class RefreshYouTubeCache extends Command
{
    protected $signature = 'youtube:refresh {--stats : Seulement rafraîchir les stats chaîne}';

    protected $description = 'Vide le cache YouTube et recharge stats, vidéos et playlists';

    public function handle(YouTubeService $service): int
    {
        if (! $service->isConfigured()) {
            $this->warn('YOUTUBE_API_KEY non configuré. Ajoutez-le dans .env pour utiliser l\'intégration YouTube.');
            return self::FAILURE;
        }

        $service->flushCache();
        $this->info('Cache YouTube vidé.');

        $this->line('Rechargement des données…');
        $channel = $service->getChannelStats();
        if ($channel) {
            $this->info("Chaîne : {$channel['title']} · Abonnés : {$channel['subscriber_count']} · Vidéos : {$channel['video_count']}");
        } else {
            $this->warn('Impossible de charger les stats chaîne (vérifier la clé API / quota / channel handle).');
        }

        if (! $this->option('stats')) {
            $videos = $service->getLatestVideos(12);
            $this->info('Vidéos chargées : ' . count($videos));

            $playlists = $service->getPlaylists(10);
            $this->info('Playlists chargées : ' . count($playlists));
        }

        return self::SUCCESS;
    }
}
