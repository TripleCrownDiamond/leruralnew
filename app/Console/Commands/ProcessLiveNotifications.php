<?php

namespace App\Console\Commands;

use App\Services\LiveNotificationService;
use Illuminate\Console\Command;

class ProcessLiveNotifications extends Command
{
    protected $signature = 'live:notify 
                            {--test : Envoie une notification de test}
                            {--dry-run : Simule sans envoyer}';

    protected $description = 'Traite et envoie les notifications pour les lives (start, rappels)';

    public function handle(LiveNotificationService $service): int
    {
        if ($this->option('dry-run')) {
            $this->info('Mode dry-run activé - aucune notification ne sera envoyée');
        }

        $this->info('Vérification des lives en cours et à venir...');

        $stats = $service->processLiveNotifications();

        $this->table(
            ['Type', 'Notifications envoyées'],
            [
                ['Live démarré', $stats['started']],
                ['Rappel 15 min', $stats['reminders_15']],
                ['Rappel 5 min', $stats['reminders_5']],
            ]
        );

        $total = array_sum($stats);

        if ($total > 0) {
            $this->info("✓ {$total} notification(s) envoyée(s) au total.");
        } else {
            $this->info('Aucune notification à envoyer pour le moment.');
        }

        return Command::SUCCESS;
    }
}