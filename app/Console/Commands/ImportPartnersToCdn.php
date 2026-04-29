<?php

namespace App\Console\Commands;

use App\Models\Partner;
use App\Services\MediaUploadService;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportPartnersToCdn extends Command
{
    protected $signature = 'partners:import-logos-to-cdn
        {--source=public/partners : Dossier source des logos (absolu ou relatif a base_path)}
        {--reset : Supprimer les partenaires existants avant import}
        {--dry-run : Simuler sans upload ni ecriture}';

    protected $description = 'Upload les logos partenaires vers le CDN configure puis cree/met a jour les partenaires.';

    public function handle(MediaUploadService $mediaUploadService): int
    {
        $sourceOption = trim((string) $this->option('source'));
        $sourcePath = $this->resolveSourcePath($sourceOption);
        $dryRun = (bool) $this->option('dry-run');
        $reset = (bool) $this->option('reset');

        if ($sourcePath === null || !File::isDirectory($sourcePath)) {
            $this->error('Dossier source introuvable: ' . $sourceOption);
            return self::FAILURE;
        }

        $files = collect(File::files($sourcePath))
            ->filter(fn ($file) => in_array(strtolower($file->getExtension()), ['png', 'jpg', 'jpeg', 'webp', 'svg'], true))
            ->sortBy(fn ($file) => strtolower($file->getFilename()))
            ->values();

        if ($files->isEmpty()) {
            $this->warn('Aucun logo trouve dans: ' . $sourcePath);
            return self::SUCCESS;
        }

        $this->info('Logos detectes: ' . $files->count());
        if ($dryRun) {
            $this->warn('Mode dry-run actif: aucune ecriture ne sera faite.');
        }

        if ($reset && !$dryRun) {
            Partner::query()->delete();
            $this->line('Partenaires existants supprimes (option --reset).');
        }

        $created = 0;
        $updated = 0;
        $failed = 0;

        foreach ($files as $index => $file) {
            $name = $this->nameFromFilename($file->getFilename());

            if ($dryRun) {
                $this->line('[DRY] ' . $name . ' <= ' . $file->getFilename());
                continue;
            }

            try {
                $uploadFile = new UploadedFile(
                    $file->getRealPath(),
                    $file->getFilename(),
                    (string) (mime_content_type($file->getRealPath()) ?: null),
                    null,
                    true
                );

                $upload = $mediaUploadService->upload($uploadFile, 'partners/logos', [
                    'index_media' => true,
                    'max_width' => 1600,
                    'quality' => 86,
                    'max_image_bytes' => 700000,
                ]);

                $logoUrl = trim((string) ($upload['url'] ?? ''));
                if ($logoUrl === '') {
                    $failed++;
                    $this->warn('[ECHEC] ' . $name . ': URL CDN vide');
                    continue;
                }

                $existing = Partner::query()->where('name', $name)->first();
                if ($existing) {
                    $existing->update([
                        'logo' => $logoUrl,
                        'is_active' => true,
                        'order' => $index,
                    ]);
                    $updated++;
                } else {
                    Partner::create([
                        'name' => $name,
                        'logo' => $logoUrl,
                        'url' => null,
                        'is_active' => true,
                        'order' => $index,
                    ]);
                    $created++;
                }

                $this->line('[OK] ' . $name . ' -> ' . $logoUrl);
            } catch (\Throwable $e) {
                $failed++;
                report($e);
                $this->warn('[ECHEC] ' . $name . ': ' . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info('Import partenaires termine.');
        $this->line('Crees: ' . $created);
        $this->line('Mis a jour: ' . $updated);
        $this->line('Echecs: ' . $failed);

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function resolveSourcePath(string $source): ?string
    {
        if ($source === '') {
            return null;
        }

        if (File::isDirectory($source)) {
            return $source;
        }

        $candidate = base_path(ltrim(str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $source), DIRECTORY_SEPARATOR));
        if (File::isDirectory($candidate)) {
            return $candidate;
        }

        return null;
    }

    private function nameFromFilename(string $filename): string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);
        $base = Str::of($base)
            ->replace(['_', '-', '.'], ' ')
            ->squish()
            ->title()
            ->toString();

        return $base !== '' ? $base : 'Partenaire';
    }
}
