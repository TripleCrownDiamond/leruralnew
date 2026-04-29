<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Poll;
use App\Models\PollOption;

class PollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $polls = [
            [
                'question' => 'Quel est votre framework PHP préféré ?',
                'is_active' => true,
                'expires_at' => now()->addDays(30),
                'options' => [
                    'Laravel',
                    'Symfony',
                    'CodeIgniter',
                    'Yii',
                    'Autre'
                ]
            ],
            [
                'question' => 'Quelle est votre base de données préférée ?',
                'is_active' => true,
                'expires_at' => now()->addDays(15),
                'options' => [
                    'MySQL',
                    'PostgreSQL',
                    'MongoDB',
                    'SQLite',
                    'Redis'
                ]
            ],
            [
                'question' => 'Quel est votre éditeur de code principal ?',
                'is_active' => false,
                'expires_at' => now()->subDays(5),
                'options' => [
                    'VS Code',
                    'Sublime Text',
                    'PhpStorm',
                    'Vim',
                    'Autre'
                ]
            ],
            [
                'question' => 'Préférez-vous le développement Frontend ou Backend ?',
                'is_active' => true,
                'expires_at' => null,
                'options' => [
                    'Frontend',
                    'Backend',
                    'Full Stack',
                    'DevOps',
                    'Mobile'
                ]
            ]
        ];

        foreach ($polls as $pollData) {
            $poll = Poll::create([
                'question' => $pollData['question'],
                'is_active' => $pollData['is_active'],
                'expires_at' => $pollData['expires_at'],
            ]);

            foreach ($pollData['options'] as $index => $optionLabel) {
                PollOption::create([
                    'poll_id' => $poll->id,
                    'label' => $optionLabel,
                    'votes' => rand(0, 50), // Votes aléatoires pour tester
                ]);
            }
        }

        $this->command->info('Sondages de test créés avec succès!');
    }
}
