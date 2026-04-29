<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Illuminate\Support\Facades\File;

class RestoreArticleSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:restore-slugs {file : Fichier de sauvegarde JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restaurer les slugs d\'articles depuis une sauvegarde';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $backupFile = $this->argument('file');

        if (!file_exists($backupFile)) {
            $this->error("❌ Fichier de sauvegarde introuvable : {$backupFile}");
            return Command::FAILURE;
        }

        $this->info("🔄 Restauration des slugs depuis : {$backupFile}");

        try {
            $backupData = json_decode(file_get_contents($backupFile), true);

            if (!$backupData || !is_array($backupData)) {
                $this->error("❌ Format de fichier de sauvegarde invalide");
                return Command::FAILURE;
            }

            $this->info("📊 {$this->getBackupDate($backupFile)} - {$this->getArticleCount($backupData)} articles à restaurer");

            if (!$this->confirm('⚠️  Cette action va restaurer les anciens slugs. Les URLs actuelles deviendront invalides. Continuer ?')) {
                $this->info('❌ Opération annulée.');
                return Command::SUCCESS;
            }

            $restoredCount = 0;
            $errors = [];

            foreach ($backupData as $item) {
                try {
                    $article = Article::find($item['id']);
                    
                    if (!$article) {
                        $errors[] = "Article ID {$item['id']} : Non trouvé";
                        continue;
                    }

                    $oldSlug = $article->slug;
                    $article->slug = $item['old_slug'];
                    $article->save();

                    $this->line("✅ Article {$article->id} : {$oldSlug} → {$item['old_slug']}");
                    $restoredCount++;

                } catch (\Exception $e) {
                    $errors[] = "Article ID {$item['id']} : " . $e->getMessage();
                }
            }

            $this->newLine();
            $this->info('📊 Résumé de la restauration :');
            $this->info("✅ {$restoredCount} articles restaurés avec succès");

            if (!empty($errors)) {
                $this->error("❌ " . count($errors) . " erreurs rencontrées :");
                foreach ($errors as $error) {
                    $this->error("   - {$error}");
                }
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("❌ Erreur lors de la restauration : " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Extraire la date du nom de fichier
     */
    private function getBackupDate(string $filename): string
    {
        if (preg_match('/article_slugs_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.json/', $filename, $matches)) {
            return $matches[1];
        }
        return 'Date inconnue';
    }

    /**
     * Compter les articles dans le backup
     */
    private function getArticleCount(array $backupData): int
    {
        return count($backupData);
    }
}
