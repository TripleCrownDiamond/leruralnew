<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PaymentGateway;

class CleanupPaymentGateways extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:cleanup-gateways {--force : Supprimer réellement les doublons}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nettoyer les gateways de paiement dupliqués';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧹 Nettoyage des gateways de paiement dupliqués...');

        // Trouver les doublons potentiels
        $allGateways = PaymentGateway::all();
        $duplicates = [];
        $toDelete = [];

        // Vérifier les doublons de "manual"
        $manualGateways = $allGateways->filter(function ($gateway) {
            return in_array($gateway->slug, ['manual', 'manual-payment']);
        });

        if ($manualGateways->count() > 1) {
            $this->warn('⚠️  Gateways "manual" dupliqués trouvés :');
            foreach ($manualGateways as $gateway) {
                $this->line("  • ID: {$gateway->id}, Slug: {$gateway->slug}, Name: {$gateway->name}");
                $toDelete[] = $gateway->id;
            }
        }

        // Vérifier les slugs dupliqués
        $slugCounts = $allGateways->groupBy('slug')->map->count();
        $duplicateSlugs = $slugCounts->filter(function ($count) {
            return $count > 1;
        });

        if ($duplicateSlugs->count() > 0) {
            $this->warn('⚠️  Slugs dupliqués trouvés :');
            foreach ($duplicateSlugs as $slug => $count) {
                $this->line("  • Slug '{$slug}' : {$count} occurrences");
                
                $duplicateGateways = $allGateways->where('slug', $slug);
                $toKeep = $duplicateGateways->first();
                $toDeleteFromSlug = $duplicateGateways->skip(1)->pluck('id')->toArray();
                
                $toDelete = array_merge($toDelete, $toDeleteFromSlug);
                
                $this->line("    → Garder : ID {$toKeep->id} ({$toKeep->name})");
                $this->line("    → Supprimer : " . implode(', ', $toDeleteFromSlug));
            }
        }

        $uniqueToDelete = array_unique($toDelete);
        $deleteCount = count($uniqueToDelete);

        if ($deleteCount === 0) {
            $this->info('✅ Aucun gateway dupliqué trouvé.');
            return Command::SUCCESS;
        }

        $this->newLine();
        $this->info("📊 {$deleteCount} gateways à supprimer :");
        
        foreach ($uniqueToDelete as $id) {
            $gateway = PaymentGateway::find($id);
            if ($gateway) {
                $this->line("  • ID: {$id}, Name: {$gateway->name}, Slug: {$gateway->slug}");
            }
        }

        if (!$this->option('force')) {
            if (!$this->confirm('Voulez-vous vraiment supprimer ces gateways dupliqués ?')) {
                $this->info('❌ Opération annulée.');
                return Command::SUCCESS;
            }
        }

        // Supprimer les doublons
        $deletedCount = PaymentGateway::whereIn('id', $uniqueToDelete)->delete();

        $this->newLine();
        $this->info("✅ {$deletedCount} gateways supprimés avec succès.");

        // Afficher les gateways restants
        $remainingGateways = PaymentGateway::where('is_active', true)->get();
        $this->newLine();
        $this->info('🎯 Gateways actifs restants :');
        
        foreach ($remainingGateways as $gateway) {
            $this->line("  • {$gateway->name} ({$gateway->slug})");
        }

        return Command::SUCCESS;
    }
}
