<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class CommentSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer les settings par défaut pour les commentaires
        Setting::updateOrCreate(
            ['key' => 'comments.auto_approve'],
            ['value' => '0'] // Désactivé par défaut (modération manuelle)
        );

        $this->command->info('Settings des commentaires créés avec succès!');
    }
}
