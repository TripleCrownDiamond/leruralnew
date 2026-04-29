<?php

namespace App\Support;

use Illuminate\Support\Str;

class ArticleImageResolver
{
    /**
     * @var array<string, string>|null
     */
    private static ?array $bySlug = null;

    /**
     * @var array<string, string>|null
     */
    private static ?array $byBasename = null;

    public static function resolveLegacy(?string $legacyUrl, ?string $slug = null): ?string
    {
        $legacyUrl = trim((string) $legacyUrl);
        if ($legacyUrl === '') {
            return null;
        }

        self::bootIndex();

        $path = (string) parse_url($legacyUrl, PHP_URL_PATH);
        $basename = mb_strtolower(basename($path));

        if ($basename !== '' && isset(self::$byBasename[$basename])) {
            return self::$byBasename[$basename];
        }

        $slug = trim((string) $slug);
        if ($slug !== '') {
            $slug = Str::slug($slug);
            if ($slug !== '' && isset(self::$bySlug[$slug])) {
                return self::$bySlug[$slug];
            }
        }

        return null;
    }

    private static function bootIndex(): void
    {
        if (self::$bySlug !== null && self::$byBasename !== null) {
            return;
        }

        self::$bySlug = [];
        self::$byBasename = [];

        $baseDir = public_path('uploads/articles/imported');
        if (!is_dir($baseDir)) {
            return;
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($baseDir, \FilesystemIterator::SKIP_DOTS)
        );

        $publicBase = str_replace('\\', '/', public_path());

        foreach ($iterator as $fileInfo) {
            if (!$fileInfo instanceof \SplFileInfo || !$fileInfo->isFile()) {
                continue;
            }

            $extension = mb_strtolower($fileInfo->getExtension());
            if (!in_array($extension, $allowedExtensions, true)) {
                continue;
            }

            $normalizedPath = str_replace('\\', '/', $fileInfo->getPathname());
            if (!Str::startsWith($normalizedPath, $publicBase)) {
                continue;
            }

            $relative = '/' . ltrim(Str::after($normalizedPath, $publicBase), '/');
            $basename = mb_strtolower($fileInfo->getBasename());
            $filenameNoExt = mb_strtolower($fileInfo->getBasename('.' . $fileInfo->getExtension()));

            if ($basename !== '' && !isset(self::$byBasename[$basename])) {
                self::$byBasename[$basename] = $relative;
            }

            $slugKey = null;
            if (preg_match('/^(.*)-\d+$/', $filenameNoExt, $matches) === 1) {
                $slugKey = Str::slug((string) $matches[1]);
            }

            if ($slugKey !== null && $slugKey !== '' && !isset(self::$bySlug[$slugKey])) {
                self::$bySlug[$slugKey] = $relative;
            }
        }
    }
}