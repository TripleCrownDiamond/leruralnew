<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RedFlag;

class RedFlagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultRedFlags = [
            'spam',
            'publicité',
            'pub',
            'vulgaire',
            'insulte',
            'haine',
            'racisme',
            'menace',
            'violence',
            'scam',
            'arnaque',
            'lien suspect',
            'clickbait',
            'troll',
            'harassment',
        ];

        foreach ($defaultRedFlags as $word) {
            RedFlag::updateOrCreate(
                ['word' => $word],
                ['active' => true]
            );
        }

        $this->command->info('Red flags par défaut créés avec succès!');
    }
}
