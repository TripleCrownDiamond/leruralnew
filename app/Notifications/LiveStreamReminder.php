<?php

namespace App\Notifications;

use App\Models\LiveStream;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LiveStreamReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public LiveStream $liveStream,
        public int $minutesBefore = 15
    ) {}

    /**
     * Canaux de notification
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        $prefs = $notifiable->notificationPreferences;
        if ($prefs?->live_reminder_email ?? $notifiable->notify_live_start ?? true) {
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
        $startsAt = $this->liveStream->starts_at?->format('H:i') ?? 'bientôt';

        return (new MailMessage)
            ->subject("⏰ Dans {$this->minutesBefore} min : {$this->liveStream->title}")
            ->greeting("Bonjour {$notifiable->name} !")
            ->line("**{$this->liveStream->title}** commence dans {$this->minutesBefore} minutes sur {$platform}.")
            ->line("Heure de début prévue : **{$startsAt}**")
            ->line("Préparez-vous à rejoindre le direct !")
            ->action('Accéder au direct', $liveUrl)
            ->line("À tout de suite sur LE RURAL !")
            ->salutation('L\'équipe LE RURAL');
    }

    /**
     * Notification stockée en base
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'live_reminder',
            'live_stream_id' => $this->liveStream->id,
            'title' => $this->liveStream->title,
            'platform' => $this->liveStream->platform,
            'minutes_before' => $this->minutesBefore,
            'message' => "⏰ Dans {$this->minutesBefore} min : {$this->liveStream->title}",
            'url' => '/direct',
            'starts_at' => $this->liveStream->starts_at?->toIso8601String(),
            'thumbnail' => $this->liveStream->thumbnail_url,
        ];
    }
}