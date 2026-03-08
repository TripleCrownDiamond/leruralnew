<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Quote;
use App\Models\DidYouKnow;
use Illuminate\Database\Seeder;

use App\Models\Agenda;
use App\Models\Comment;
use App\Models\Article;

class WidgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Poll, Quotes, DidYouKnow... (keep existing)
        $poll = Poll::create([
            'question' => 'Quel est votre avis sur la campagne agricole 2026 ?',
            'is_active' => true,
            'expires_at' => now()->addMonths(3),
        ]);

        $options = [
            'Très prometteuse' => 45,
            'Moyenne' => 30,
            'Inquiétante' => 15,
            'Sans avis' => 10,
        ];

        foreach ($options as $label => $votes) {
            PollOption::create([
                'poll_id' => $poll->id,
                'label' => $label,
                'votes' => $votes,
            ]);
        }

        Quote::create([
            'content' => "L'agriculture est la mère de tous les arts : lorsqu'elle est bien conduite, tous les autres arts prospèrent ; mais lorsqu'elle est négligée, tous les autres arts déclinent.",
            'author' => 'Xénophon',
            'is_active' => true,
        ]);
        
        Quote::create([
            'content' => "Cultiver son jardin, c'est un acte politique.",
            'author' => 'Pierre Rabhi',
            'is_active' => true,
        ]);

        DidYouKnow::create([
            'content' => "Le Bénin est le 4ème producteur mondial d'anacarde en 2025 avec une production record de plus de 300.000 tonnes.",
            'is_active' => true,
        ]);
        
        DidYouKnow::create([
            'content' => "L'agriculture emploie plus de 70% de la population active au Bénin et contribue pour près de 33% au PIB.",
            'is_active' => true,
        ]);

        // Agenda
        $events = [
            ['Salon International de l\'Agriculture', 'Paris, France', now()->addDays(10)],
            ['Foire Nationale de Cotonou', 'Cotonou, Bénin', now()->addDays(25)],
            ['Forum des Producteurs de Cacao', 'Abidjan, Côte d\'Ivoire', now()->addDays(45)],
            ['Journée Mondiale de l\'Alimentation', 'Mondial', now()->addMonth()],
        ];

        foreach ($events as $event) {
            Agenda::create([
                'title' => $event[0],
                'location' => $event[1],
                'date' => $event[2],
                'is_active' => true,
            ]);
        }

        // Comments
        $articles = Article::all();
        if ($articles->count() > 0) {
            $comments = [
                "Super article, très instructif !",
                "Merci pour ces informations précieuses.",
                "Je ne savais pas que l'anacarde avait autant de potentiel.",
                "Bravo à l'équipe pour ce reportage.",
                "Vivement la suite de cette série.",
                "L'agriculture est l'avenir de notre continent.",
                "Très belle initiative.",
                "Il faut soutenir nos producteurs locaux.",
                "Article bien détaillé, comme toujours.",
                "Merci Le Rural pour la qualité du contenu."
            ];

            $names = ["Jean K.", "Aminata D.", "Paul S.", "Fatou T.", "Michel O.", "Sarah L."];

            for ($i = 0; $i < 30; $i++) {
                Comment::create([
                    'article_id' => $articles->random()->id,
                    'author_name' => $names[array_rand($names)],
                    'content' => $comments[array_rand($comments)],
                    'is_approved' => true,
                    'created_at' => now()->subMinutes(rand(1, 10000)),
                ]);
            }
        }
    }
}
