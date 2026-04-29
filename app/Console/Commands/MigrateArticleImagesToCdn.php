<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Services\MediaUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;

class MigrateArticleImagesToCdn extends Command
{
    protected $signature = 'articles:migrate-images-to-cdn
        {--limit=0 : Nombre maximal d\'articles a traiter (0 = tous)}
        {--dry-run : Simuler sans upload ni ecriture}
        {--force : Re-uploader meme si deja sur CDN}
        {--max-width=2200 : Largeur max des images}
        {--quality=84 : Qualite image (56-90)}
        {--max-bytes=1048576 : Taille max cible par image (octets)}';

    protected $description = 'Migre les images featured des articles vers les CDN configures et indexe en mediatheque.';

    public function handle(MediaUploadService $mediaUploadService): int
    {
        $limit = max(0, (int) $this->option('limit'));
        $dryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');

        $maxWidth = max(640, (int) $this->option('max-width'));
        $quality = max(56, min(90, (int) $this->option('quality')));
        $maxBytes = max(262144, (int) $this->option('max-bytes'));

        $query = Article::query()
            ->whereNotNull('featured_image')
            ->where('featured_image', '!=', '')
            ->orderBy('id');

        if ($limit > 0) {
            $query->limit($limit);
        }

        $articles = $query->get();

        if ($articles->isEmpty()) {
            $this->warn('Aucun article avec image a migrer.');
            return self::SUCCESS;
        }

        $this->info('Articles cibles: ' . $articles->count());
        if ($dryRun) {
            $this->warn('Mode dry-run actif: aucune ecriture ne sera faite.');
        }

        $uploadedBySource = [];

        $updated = 0;
        $failed = 0;
        $skippedAlreadyCdn = 0;
        $skippedNoSource = 0;

        foreach ($articles as $index => $article) {
            $source = trim((string) ($article->featured_image ?? ''));
            if ($source === '') {
                $skippedNoSource++;
                continue;
            }

            if (!$force && $this->isAlreadyCdnUrl($source)) {
                $skippedAlreadyCdn++;
                continue;
            }

            if (isset($uploadedBySource[$source])) {
                $newUrl = $uploadedBySource[$source];

                if (!$dryRun && is_string($newUrl) && $newUrl !== '' && $newUrl !== $source) {
                    $article->forceFill(['featured_image' => $newUrl])->saveQuietly();
                }

                if (is_string($newUrl) && $newUrl !== '' && $newUrl !== $source) {
                    $updated++;
                }

                continue;
            }

            $sourceData = $this->readSource($source);
            if ($sourceData === null) {
                $failed++;
                $this->warn("[{$article->id}] Source introuvable: {$source}");
                continue;
            }

            [$bytes, $mime, $originalName] = $sourceData;

            if ($dryRun) {
                $uploadedBySource[$source] = $source;
                continue;
            }

            $tmpPath = tempnam(sys_get_temp_dir(), 'artimg_');
            if ($tmpPath === false) {
                $failed++;
                $this->warn("[{$article->id}] Impossible de creer un fichier temporaire");
                continue;
            }

            $extension = $this->guessExtension($mime, $originalName, $source);
            $tmpFile = $tmpPath . '.' . $extension;

            @rename($tmpPath, $tmpFile);
            file_put_contents($tmpFile, $bytes);

            try {
                $uploadFile = new UploadedFile(
                    $tmpFile,
                    $originalName !== '' ? $originalName : ('article-' . $article->id . '.' . $extension),
                    $mime !== '' ? $mime : null,
                    null,
                    true
                );

                $result = $mediaUploadService->upload($uploadFile, 'articles/featured', [
                    'user_id' => $article->author_id,
                    'index_media' => true,
                    'max_width' => $maxWidth,
                    'quality' => $quality,
                    'max_image_bytes' => $maxBytes,
                ]);

                $newUrl = trim((string) ($result['url'] ?? ''));
                if ($newUrl === '') {
                    $failed++;
                    $this->warn("[{$article->id}] Upload termine sans URL retournee");
                    continue;
                }

                $uploadedBySource[$source] = $newUrl;

                if ($newUrl !== $source) {
                    $article->forceFill(['featured_image' => $newUrl])->saveQuietly();
                    $updated++;
                }
            } catch (\Throwable $exception) {
                $failed++;
                report($exception);
                $this->warn("[{$article->id}] Echec upload: {$exception->getMessage()}");
            } finally {
                if (is_file($tmpFile)) {
                    @unlink($tmpFile);
                }
            }

            if ((($index + 1) % 25) === 0) {
                $this->line('Progression: ' . ($index + 1) . '/' . $articles->count());
            }
        }

        $this->newLine();
        $this->info('Migration terminee.');
        $this->line('Mis a jour: ' . $updated);
        $this->line('Echecs: ' . $failed);
        $this->line('Deja CDN (ignore): ' . $skippedAlreadyCdn);
        $this->line('Sans source (ignore): ' . $skippedNoSource);

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function isAlreadyCdnUrl(string $url): bool
    {
        $url = strtolower(trim($url));

        return str_contains($url, 'res.cloudinary.com/')
            || str_contains($url, 'ik.imagekit.io/')
            || str_contains($url, 'ucarecdn.com/');
    }

    /**
     * @return array{0:string,1:string,2:string}|null
     */
    private function readSource(string $source): ?array
    {
        if (preg_match('/^https?:\/\//i', $source) === 1) {
            $sourcePath = (string) parse_url($source, PHP_URL_PATH);
            $sourceHost = strtolower((string) parse_url($source, PHP_URL_HOST));
            $appHost = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));

            if (($sourceHost !== '' && in_array($sourceHost, ['localhost', '127.0.0.1'], true)) || ($appHost !== '' && $sourceHost === $appHost)) {
                $localFromUrl = $this->resolveLocalPath($sourcePath);
                if ($localFromUrl && is_file($localFromUrl)) {
                    $bytes = file_get_contents($localFromUrl);
                    if ($bytes !== false && $bytes !== '') {
                        $mime = (string) (mime_content_type($localFromUrl) ?: 'application/octet-stream');
                        return [$bytes, $mime, basename($localFromUrl)];
                    }
                }
            }

            try {
                $response = Http::timeout(30)
                    ->withHeaders(['User-Agent' => 'LeRuralImageMigrator/1.0'])
                    ->get($source);

                if (!$response->successful()) {
                    return null;
                }

                $bytes = (string) $response->body();
                if ($bytes === '') {
                    return null;
                }

                $mime = trim((string) $response->header('Content-Type', ''));
                if (str_contains($mime, ';')) {
                    $mime = trim((string) strtok($mime, ';'));
                }

                $name = basename($sourcePath);

                return [$bytes, $mime, $name !== '' ? $name : 'image'];
            } catch (\Throwable) {
                return null;
            }
        }

        $localPath = $this->resolveLocalPath($source);
        if ($localPath === null || !is_file($localPath)) {
            return null;
        }

        $bytes = file_get_contents($localPath);
        if ($bytes === false || $bytes === '') {
            return null;
        }

        $mime = (string) (mime_content_type($localPath) ?: 'application/octet-stream');

        return [$bytes, $mime, basename($localPath)];
    }

    private function resolveLocalPath(string $source): ?string
    {
        $source = trim($source);
        if ($source === '') {
            return null;
        }

        if (is_file($source)) {
            return $source;
        }

        $relative = ltrim($source, '/\\');

        $publicCandidate = public_path($relative);
        if (is_file($publicCandidate)) {
            return $publicCandidate;
        }

        if (str_starts_with($relative, 'storage/')) {
            $storageRelative = substr($relative, strlen('storage/'));
            $storageCandidate = storage_path('app/public/' . ltrim((string) $storageRelative, '/\\'));
            if (is_file($storageCandidate)) {
                return $storageCandidate;
            }
        }

        return null;
    }

    private function guessExtension(string $mime, string $originalName, string $source): string
    {
        $fromName = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if ($fromName !== '') {
            return $fromName;
        }

        $fromSource = strtolower(pathinfo((string) parse_url($source, PHP_URL_PATH), PATHINFO_EXTENSION));
        if ($fromSource !== '') {
            return $fromSource;
        }

        return match (strtolower($mime)) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/avif' => 'avif',
            default => 'jpg',
        };
    }
}