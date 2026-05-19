<?php

namespace App\Services;

use App\Models\LiveStream;
use App\Models\LiveStreamNotification;
use App\Models\User;
use App\Notifications\LiveStreamReminder;
use App\Notifications\LiveStreamStarted;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class LiveNotificationService
{
    /**
     * Envoie les notifications pour un live qui vient de commencer
     */
    public function notifyLiveStarted(LiveStream $liveStream): int
    {
        // Vérifie si déjà notifié
        if (LiveStreamNotification::alreadySent($liveStream->id, LiveStreamNotification::TYPE_START)) {
            Log::info("Live #{$liveStream->id} déjà notifié (start)");
            return 0;
        }

        // Récupère les utilisateurs qui veulent être notifiés
        $users = $this->getUsersToNotify('live_start');
        
        if ($users->isEmpty()) {
            Log::info("Aucun utilisateur à notifier pour le live #{$liveStream->id}");
            return 0;
        }

        // Envoie les notifications
        Notification::send($users, new LiveStreamStarted($liveStream));

        // Marque comme envoyé
        LiveStreamNotification::markAsSent(
            $liveStream->id,
            LiveStreamNotification::TYPE_START,
            $users->count()
        );

        Log::info("Notifications live start envoyées à {$users->count()} utilisateurs pour le live #{$liveStream->id}");

        return $users->count();
    }

    /**
     * Envoie les rappels pour un live qui commence bientôt
     */
    public function notifyLiveReminder(LiveStream $liveStream, int $minutesBefore = 15): int
    {
        $type = $minutesBefore === 15 
            ? LiveStreamNotification::TYPE_REMINDER_15MIN 
            : LiveStreamNotification::TYPE_REMINDER_5MIN;

        // Vérifie si déjà notifié
        if (LiveStreamNotification::alreadySent($liveStream->id, $type)) {
            Log::info("Live #{$liveStream->id} déjà notifié ({$type})");
            return 0;
        }

        // Récupère les utilisateurs qui veulent être notifiés
        $users = $this->getUsersToNotify('live_reminder');
        
        if ($users->isEmpty()) {
            return 0;
        }

        // Envoie les notifications
        Notification::send($users, new LiveStreamReminder($liveStream, $minutesBefore));

        // Marque comme envoyé
        LiveStreamNotification::markAsSent($liveStream->id, $type, $users->count());

        Log::info("Notifications live reminder ({$minutesBefore}min) envoyées à {$users->count()} utilisateurs");

        return $users->count();
    }

    /**
     * Vérifie et envoie les notifications pour tous les lives actifs/à venir
     * À appeler via un job/cron
     */
    public function processLiveNotifications(): array
    {
        $stats = [
            'started' => 0,
            'reminders_15' => 0,
            'reminders_5' => 0,
        ];

        $now = now();

        // Lives en cours qui n'ont pas été notifiés
        $activeLives = LiveStream::query()
            ->where('is_active', true)
            ->whereNotNull('starts_at')
            ->where('starts_at', '<=', $now)
            ->where(function ($query) use ($now) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $now);
            })
            ->get();

        foreach ($activeLives as $live) {
            $stats['started'] += $this->notifyLiveStarted($live);
        }

        // Lives qui commencent dans 15 minutes
        $in15min = LiveStream::query()
            ->where('is_active', true)
            ->whereNotNull('starts_at')
            ->whereBetween('starts_at', [$now->copy()->addMinutes(14), $now->copy()->addMinutes(16)])
            ->get();

        foreach ($in15min as $live) {
            $stats['reminders_15'] += $this->notifyLiveReminder($live, 15);
        }

        // Lives qui commencent dans 5 minutes
        $in5min = LiveStream::query()
            ->where('is_active', true)
            ->whereNotNull('starts_at')
            ->whereBetween('starts_at', [$now->copy()->addMinutes(4), $now->copy()->addMinutes(6)])
            ->get();

        foreach ($in5min as $live) {
            $stats['reminders_5'] += $this->notifyLiveReminder($live, 5);
        }

        return $stats;
    }

    /**
     * Récupère les utilisateurs à notifier selon le type
     */
    protected function getUsersToNotify(string $type): \Illuminate\Database\Eloquent\Collection
    {
        $query = User::query()
            ->whereNotNull('email_verified_at');

        // Filtre selon les préférences
        switch ($type) {
            case 'live_start':
                $query->where(function ($q) {
                    $q->where('notify_live_start', true)
                        ->orWhereDoesntHave('notificationPreferences');
                });
                break;

            case 'live_reminder':
                $query->where(function ($q) {
                    $q->where('notify_live_start', true)
                        ->orWhereDoesntHave('notificationPreferences');
                });
                break;
        }

        return $query->get();
    }

    /**
     * Envoie une notification de test à un utilisateur
     */
    public function sendTestNotification(User $user, LiveStream $liveStream): void
    {
        $user->notify(new LiveStreamStarted($liveStream));
    }
}