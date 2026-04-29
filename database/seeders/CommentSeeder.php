<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\Article;
use App\Models\User;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Vérifier s'il y a des articles et des utilisateurs
        $articles = Article::take(5)->get();
        $users = User::take(3)->get();

        if ($articles->isEmpty()) {
            $this->command->info('Aucun article trouvé. Créez d\'abord des articles.');
            return;
        }

        // Commentaires de test avec différents statuts
        $testComments = [
            [
                'content' => 'Excellent article, très instructif!',
                'author_name' => 'Jean Dupont',
                'author_email' => 'jean@example.com',
                'is_approved' => true,
                'auto_flagged' => false,
            ],
            [
                'content' => 'Ceci est un spam publicitaire',
                'author_name' => 'Spammer',
                'author_email' => 'spam@spam.com',
                'is_approved' => false,
                'auto_flagged' => true,
            ],
            [
                'content' => 'J\'ai une question sur ce sujet...',
                'author_name' => 'Marie Curie',
                'author_email' => 'marie@example.com',
                'is_approved' => false,
                'auto_flagged' => false,
            ],
            [
                'content' => 'Merci pour cette information précieuse.',
                'author_name' => 'Paul Martin',
                'author_email' => 'paul@example.com',
                'is_approved' => true,
                'auto_flagged' => false,
            ],
            [
                'content' => 'Ce commentaire contient un mot suspect comme violence',
                'author_name' => 'Test User',
                'author_email' => 'test@example.com',
                'is_approved' => false,
                'auto_flagged' => true,
            ],
        ];

        foreach ($testComments as $index => $commentData) {
            $article = $articles->random();
            $user = $users->random();

            Comment::create([
                'article_id' => $article->id,
                'content' => $commentData['content'],
                'author_name' => $commentData['author_name'],
                'author_email' => $commentData['author_email'],
                'user_id' => $user ? $user->id : null,
                'is_approved' => $commentData['is_approved'],
                'auto_flagged' => $commentData['auto_flagged'],
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }

        $this->command->info('Commentaires de test créés avec succès!');
    }
}
