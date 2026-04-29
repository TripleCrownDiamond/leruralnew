<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PaymentGateway;

class SetupPaymentGateways extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:setup-gateways {--force : Écraser les gateways existants}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configurer les moyens de paiement par défaut';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔧 Configuration des moyens de paiement par défaut...');

        if ($this->option('force')) {
            PaymentGateway::query()->delete();
            $this->info('🗑️  Moyens de paiement existants supprimés.');
        }

        $defaultGateways = [
            [
                'name' => 'Mobile Money (Orange, MTN, Moov)',
                'slug' => 'mobile-money',
                'is_active' => true,
                'logo' => null,
                'config' => [
                    'type' => 'mobile_money',
                    'providers' => ['orange', 'mtn', 'moov'],
                    'description' => 'Paiement par Mobile Money (Orange Money, MTN Mobile Money, Moov Money)'
                ]
            ],
            [
                'name' => 'Carte Bancaire',
                'slug' => 'card-payment',
                'is_active' => true,
                'logo' => null,
                'config' => [
                    'type' => 'card',
                    'description' => 'Paiement par carte bancaire (Visa, MasterCard)'
                ]
            ],
            [
                'name' => 'Wave',
                'slug' => 'wave',
                'is_active' => true,
                'logo' => null,
                'config' => [
                    'type' => 'wave',
                    'description' => 'Paiement par Wave (Côte d\'Ivoire, Sénégal, etc.)'
                ]
            ]
            // Note: Le "Paiement Manuel" est ajouté automatiquement par le controller
            // donc on ne l'ajoute pas ici pour éviter la duplication
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($defaultGateways as $gatewayData) {
            $gateway = PaymentGateway::where('slug', $gatewayData['slug'])->first();

            if ($gateway) {
                if ($this->option('force')) {
                    $gateway->update($gatewayData);
                    $updatedCount++;
                    $this->line("✅ Gateway mis à jour : {$gatewayData['name']}");
                } else {
                    $this->line("⚠️  Gateway existe déjà : {$gatewayData['name']} (utilisez --force pour écraser)");
                }
            } else {
                PaymentGateway::create($gatewayData);
                $createdCount++;
                $this->line("✅ Gateway créé : {$gatewayData['name']}");
            }
        }

        $this->newLine();
        $this->info('📊 Résumé :');
        $this->info("✅ {$createdCount} gateways créés");
        $this->info("🔄 {$updatedCount} gateways mis à jour");

        // Afficher les gateways actifs
        $activeGateways = PaymentGateway::where('is_active', true)->get();
        $this->newLine();
        $this->info('🎯 Gateways actifs configurés :');
        
        foreach ($activeGateways as $gateway) {
            $this->line("  • {$gateway->name} ({$gateway->slug})");
        }

        return Command::SUCCESS;
    }
}
