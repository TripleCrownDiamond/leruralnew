<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionExpiringReminder;
use App\Mail\SubscriptionExpiredNotice;
use App\Models\UserSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendSubscriptionExpiryReminders extends Command
{
    protected $signature = 'subscriptions:notify-expiring {--days=3 : Nombre de jours avant expiration}';

    protected $description = 'Envoie des emails aux abonnes dont l abonnement expire bientot ou vient d expirer.';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));

        $expiredCount = $this->sendExpiredNotices();
        $expiringCount = $this->sendExpiringReminders($days);

        if ($expiredCount === 0 && $expiringCount === 0) {
            $this->line('Aucun abonnement a notifier.');
            return self::SUCCESS;
        }

        $this->info('Rappels expiration proche envoyes: ' . $expiringCount);
        $this->info('Notifications expiration effective envoyees: ' . $expiredCount);

        return self::SUCCESS;
    }

    private function sendExpiringReminders(int $days): int
    {
        $start = now();
        $end = now()->copy()->addDays($days)->endOfDay();

        $subscriptions = UserSubscription::query()
            ->with(['user', 'plan'])
            ->where('status', 'active')
            ->whereBetween('ends_at', [$start, $end])
            ->where(function ($query) {
                $query->whereNull('expiry_notice_sent_at')
                    ->orWhere('expiry_notice_sent_at', '<', now()->subDay());
            })
            ->get();

        $sent = 0;

        foreach ($subscriptions as $subscription) {
            if (!$subscription->user?->email) {
                continue;
            }

            Mail::to($subscription->user->email)->send(new SubscriptionExpiringReminder($subscription));
            $subscription->forceFill(['expiry_notice_sent_at' => now()])->save();
            $sent++;
        }

        return $sent;
    }

    private function sendExpiredNotices(): int
    {
        $subscriptions = UserSubscription::query()
            ->with(['user', 'plan'])
            ->where('status', 'active')
            ->where('ends_at', '<=', now())
            ->get();

        $sent = 0;

        foreach ($subscriptions as $subscription) {
            if (!$subscription->user?->email) {
                $subscription->forceFill(['status' => 'expired'])->save();
                continue;
            }

            Mail::to($subscription->user->email)->send(new SubscriptionExpiredNotice($subscription));

            $subscription->forceFill([
                'status' => 'expired',
                'expiry_notice_sent_at' => now(),
            ])->save();

            $sent++;
        }

        return $sent;
    }
}
