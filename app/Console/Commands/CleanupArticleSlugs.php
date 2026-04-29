<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CleanupArticleSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:cleanup-slugs {--force : Force la modification sans confirmation} {--backup : Créer une sauvegarde avant modification}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nettoyer les slugs des articles existants (enlever les chiffres)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Analyse des slugs d\'articles existants...');

        // Trouver les articles avec des slugs qui se terminent par des chiffres
        $articlesWithNumbers = Article::whereRaw("slug REGEXP '-[0-9]+$'")->get();

        if ($articlesWithNumbers->isEmpty()) {
            $this->info('✅ Aucun article avec des chiffres dans le slug trouvé.');
            return Command::SUCCESS;
        }

        $this->info("📊 {$articlesWithNumbers->count()} articles trouvés avec des chiffres dans le slug :");
        $this->table(
            ['ID', 'Titre', 'Slug Actuel', 'Slug Proposé'],
            $articlesWithNumbers->map(function ($article) {
                $newSlug = $this->generateNewSlug($article);
                return [
                    $article->id,
                    Str::limit($article->title_fr, 40),
                    $article->slug,
                    $newSlug
                ];
            })->toArray()
        );

        // Créer un backup si demandé
        if ($this->option('backup')) {
            $this->createBackup();
        }

        // Demander confirmation
        if (!$this->option('force')) {
            if (!$this->confirm('⚠️  ATTENTION : Cette action va modifier les URLs de tous les articles listés ci-dessus. Les anciennes URLs ne fonctionneront plus ! Continuer ?')) {
                $this->info('❌ Opération annulée.');
                return Command::SUCCESS;
            }
        }

        // Modifier les slugs
        $updatedCount = 0;
        $errors = [];

        foreach ($articlesWithNumbers as $article) {
            try {
                $newSlug = $this->generateNewSlug($article);
                
                // Vérifier que le nouveau slug n'existe pas déjà
                if (Article::where('slug', $newSlug)->where('id', '!=', $article->id)->exists()) {
                    $errors[] = "Article ID {$article->id} : Le slug '{$newSlug}' existe déjà";
                    continue;
                }

                // Mettre à jour le slug
                $article->slug = $newSlug;
                $article->save();
                $updatedCount++;

                $this->line("✅ Article {$article->id} : {$article->slug} → {$newSlug}");

            } catch (\Exception $e) {
                $errors[] = "Article ID {$article->id} : " . $e->getMessage();
            }
        }

        // Afficher le résumé
        $this->newLine();
        $this->info('📊 Résumé de l\'opération :');
        $this->info("✅ {$updatedCount} articles mis à jour avec succès");
        
        if (!empty($errors)) {
            $this->error("❌ " . count($errors) . " erreurs rencontrées :");
            foreach ($errors as $error) {
                $this->error("   - {$error}");
            }
        }

        if ($updatedCount > 0) {
            $this->newLine();
            $this->warn('⚠️  IMPORTANT :');
            $this->warn('   - Les anciennes URLs ne fonctionnent plus');
            $this->warn('   - Pensez à mettre à jour les liens internes');
            $this->warn('   - Configurez des redirections 301 si nécessaire');
            $this->warn('   - Les backlinks externes seront perdus');
        }

        return Command::SUCCESS;
    }

    /**
     * Générer un nouveau slug sans chiffres
     */
    private function generateNewSlug(Article $article): string
    {
        $baseSlug = Str::slug($article->title_fr);
        
        // Ajouter la date de création pour l'unicité
        $dateSlug = $baseSlug . '-' . $article->created_at->format('Y-m-d');
        
        // Si le slug avec date existe déjà, ajouter des lettres aléatoires
        if (Article::where('slug', $dateSlug)->where('id', '!=', $article->id)->exists()) {
            $dateSlug = $baseSlug . '-' . $article->created_at->format('Y-m-d') . '-' . Str::random(3);
        }

        return $dateSlug;
    }

    /**
     * Créer une sauvegarde des slugs actuels
     */
    private function createBackup(): void
    {
        $backupFile = database_path('backups/article_slugs_' . date('Y-m-d_H-i-s') . '.json');
        
        // Créer le répertoire de backup si nécessaire
        $backupDir = dirname($backupFile);
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Exporter les slugs actuels
        $articles = Article::whereRaw("slug REGEXP '-[0-9]+$'")->get(['id', 'slug']);
        $backupData = $articles->map(function ($article) {
            return [
                'id' => $article->id,
                'old_slug' => $article->slug,
                'backup_date' => now()->toISOString()
            ];
        })->toArray();

        file_put_contents($backupFile, json_encode($backupData, JSON_PRETTY_PRINT));
        
        $this->info("💾 Sauvegarde créée : {$backupFile}");
    }
}
