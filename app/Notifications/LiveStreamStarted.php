<?php

namespace App\Notifications;

use App\Models\LiveStream;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LiveStreamStarted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public LiveStream $liveStream
    ) {}

    /**
     * Canaux de notification (mail + base de données pour l'icône)
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Vérifie les préférences utilisateur pour l'email
        $prefs = $notifiable->notificationPreferences;
        if ($prefs?->live_start_email ?? $notifiable->notify_live_start ?? true) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Notification par email
     */
    public function toMail(object $notifiable): MailMessage
    {
        $platformLabels = [
            'youtube' => 'YouTube',
            'facebook' => 'Facebook',
            'tiktok' => 'TikTok',
            'twitch' => 'Twitch',
            'obs' => 'OBS',
            'streamyard' => 'StreamYard',
            'custom' => 'Direct',
        ];

        $platform = $platformLabels[$this->liveStream->platform] ?? 'Direct';
        $liveUrl = url('/direct');

        return (new MailMessage)
            ->subject("🔴 En direct maintenant : {$this->liveStream->title}")
            ->greeting("Bonjour {$notifiable->name} !")
            ->line("**{$this->liveStream->title}** vient de commencer sur {$platform}.")
            ->line("Ne manquez pas cette émission en direct sur LE RURAL !")
            ->action('Regarder le direct', $liveUrl)
            ->line("À très vite sur LE RURAL !")
            ->salutation('L\'équipe LE RURAL');
    }

    /**
     * Notification stockée en base (pour l'icône de notification)
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'live_started',
            'live_stream_id' => $this->liveStream->id,
            'title' => $this->liveStream->title,
            'platform' => $this->liveStream->platform,
            'message' => "🔴 En direct : {$this->liveStream->title}",
            'url' => '/direct',
            'thumbnail' => $this->liveStream->thumbnail_url,
        ];
    }
}