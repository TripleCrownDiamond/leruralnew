<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ajoute le SAFEB 2026 (Salon de l'Autonomisation de la Femme
     * Entrepreneure Rurale du Bénin) dans l'agenda public.
     *
     * Parakou, 15 au 17 octobre 2026.
     */
    public function up(): void
    {
        $events = [
            [
                'title' => 'SAFEB 2026 - Ouverture du Salon',
                'description' => "Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Bénin. Cérémonie d'ouverture, foire-exposition et première journée de rencontres.",
                'date' => '2026-10-15',
                'time' => '09:00',
                'location' => 'Parakou, Bénin',
            ],
            [
                'title' => 'SAFEB 2026 - Panels & Rencontres B2B',
                'description' => "Panels et conférences de haut niveau, masterclass, concours de pitch et rencontres d'affaires entre femmes entrepreneures rurales et partenaires.",
                'date' => '2026-10-16',
                'time' => '09:00',
                'location' => 'Parakou, Bénin',
            ],
            [
                'title' => 'SAFEB 2026 - Clôture & Soirée de Gala',
                'description' => "Dernière journée du salon : compétition de films, village gastronomique, concert de célébration, remise des distinctions et soirée de gala.",
                'date' => '2026-10-17',
                'time' => '09:00',
                'location' => 'Parakou, Bénin',
            ],
        ];

        foreach ($events as $event) {
            $exists = DB::table('agendas')
                ->where('title', $event['title'])
                ->where('date', $event['date'])
                ->exists();

            if (!$exists) {
                DB::table('agendas')->insert(array_merge($event, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('agendas')
            ->whereIn('date', ['2026-10-15', '2026-10-16', '2026-10-17'])
            ->where('title', 'like', 'SAFEB 2026%')
            ->delete();
    }
};
