<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'label' => 'Nouveau',
                'message' => 'Abonnement numerique disponible avec acces aux analyses premium et aux editions speciales.',
                'link_url' => '/register',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'label' => 'Annonce',
                'message' => 'Le Rural ouvre son espace partenaires et annonceurs pour les campagnes, publireportages et prises de parole sectorielles.',
                'link_url' => '/contact',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            Announcement::updateOrCreate(
                ['message' => $item['message']],
                $item,
            );
        }
    }
}