<?php

declare(strict_types=1);

/**
 * Production deploy helper for Laravel.
 *
 * Usage:
 *   php scripts/deploy-production.php
 *   php scripts/deploy-production.php --flatten-subdir=refonte-lerural`n *   php scripts/deploy-production.php --public-root=1
 */

$root = realpath(__DIR__ . '/..');
if ($root === false) {
    fwrite(STDERR, "Unable to resolve project root.\n");
    exit(1);
}

chdir($root);

$options = parseArgs($argv);

info('Project root: ' . $root);

if (!empty($options['flatten-subdir'])) {
    flattenSubdir($root, (string) $options['flatten-subdir']);
}

if (($options['public-root'] ?? '0') === '1') {
    preparePublicRoot($root);
}

ensureDirectories($root);
ensureEnvFile($root);
ensureSqliteFileIfNeeded($root);

$env = loadEnv($root . DIRECTORY_SEPARATOR . '.env');

if (empty($env['APP_KEY'])) {
    run('php artisan key:generate --force');
} else {
    info('APP_KEY already set, skipping key generation.');
}

run('php artisan storage:link');
run('php artisan migrate --force');
run('php artisan optimize:clear');
run('php artisan config:cache');
run('php artisan view:cache');

printCsrfChecklist(loadEnv($root . DIRECTORY_SEPARATOR . '.env'));

success('Deployment bootstrap complete.');

function parseArgs(array $argv): array
{
    $options = [];

    foreach ($argv as $arg) {
        if (!str_starts_with($arg, '--')) {
            continue;
        }

        $parts = explode('=', substr($arg, 2), 2);
        $key = $parts[0] ?? '';
        $value = $parts[1] ?? '1';

        if ($key !== '') {
            $options[$key] = $value;
        }
    }

    return $options;
}

function flattenSubdir(string $root, string $subdir): void
{
    $sourceDir = realpath($root . DIRECTORY_SEPARATOR . trim($subdir, '/\\'));

    if ($sourceDir === false || !is_dir($sourceDir)) {
        warning("Flatten skipped: subdir '{$subdir}' not found.");
        return;
    }

    if ($sourceDir === $root) {
        warning('Flatten skipped: source subdir is already root.');
        return;
    }

    info("Flattening '{$sourceDir}' into root...");

    $items = scandir($sourceDir) ?: [];
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $from = $sourceDir . DIRECTORY_SEPARATOR . $item;
        $to = $root . DIRECTORY_SEPARATOR . $item;

        if (file_exists($to)) {
            warning("Destination exists, skipping: {$item}");
            continue;
        }

        if (!@rename($from, $to)) {
            warning("Failed moving {$item}");
            continue;
        }

        info("Moved: {$item}");
    }

    $remaining = array_values(array_filter(scandir($sourceDir) ?: [], static fn ($x) => $x !== '.' && $x !== '..'));
    if ($remaining === []) {
        @rmdir($sourceDir);
    }
}


function preparePublicRoot(string $root): void
{
    $publicPath = $root . '/public';

    if (!is_dir($publicPath)) {
        warning('public-root skipped: public/ directory not found.');
        return;
    }

    info('Preparing Hostinger public_html root from public/ directory...');

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($publicPath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        $relative = str_replace('\\', '/', $iterator->getSubPathName());
        $target = $root . '/' . $relative;

        if ($item->isDir()) {
            if (!is_dir($target) && !@mkdir($target, 0775, true) && !is_dir($target)) {
                throw new RuntimeException("Cannot create directory in root publish: {$target}");
            }

            continue;
        }

        if (!@copy($item->getPathname(), $target)) {
            throw new RuntimeException("Cannot copy file to root publish: {$target}");
        }
    }

    $rootIndex = $root . '/index.php';
    if (file_exists($rootIndex)) {
        $index = file_get_contents($rootIndex);
        if ($index === false) {
            throw new RuntimeException('Unable to read root index.php');
        }

        $index = str_replace("__DIR__.'/../vendor/autoload.php'", "__DIR__.'/vendor/autoload.php'", $index);
        $index = str_replace("__DIR__.'/../bootstrap/app.php'", "__DIR__.'/bootstrap/app.php'", $index);

        file_put_contents($rootIndex, $index);
    }

    info('Root publish files refreshed for Hostinger.');
}
function ensureDirectories(string $root): void
{
    $dirs = [
        $root . '/storage/framework',
        $root . '/storage/framework/cache',
        $root . '/storage/framework/sessions',
        $root . '/storage/framework/views',
        $root . '/storage/framework/testing',
        $root . '/storage/logs',
        $root . '/bootstrap/cache',
        $root . '/database',
    ];

    foreach ($dirs as $dir) {
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("Cannot create directory: {$dir}");
        }
    }

    info('Required writable directories are ready.');
}

function ensureEnvFile(string $root): void
{
    $envPath = $root . '/.env';
    if (file_exists($envPath)) {
        info('.env already exists.');
        return;
    }

    $candidateFiles = [
        $root . '/.env.production.example',
        $root . '/.env.example',
    ];

    foreach ($candidateFiles as $candidate) {
        if (file_exists($candidate)) {
            copyOrFail($candidate, $envPath);
            info('.env created from ' . basename($candidate));
            return;
        }
    }

    $template = <<<ENV
APP_NAME="LE RURAL"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://example.com

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.example.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

CACHE_STORE=database
QUEUE_CONNECTION=database

ENV;

    file_put_contents($envPath, $template);
    info('.env created from built-in template.');
}

function ensureSqliteFileIfNeeded(string $root): void
{
    $env = loadEnv($root . '/.env');
    $connection = strtolower(trim((string) ($env['DB_CONNECTION'] ?? '')));

    if ($connection !== 'sqlite') {
        info('DB_CONNECTION is not sqlite, skipping sqlite file creation.');
        return;
    }

    $dbPath = trim((string) ($env['DB_DATABASE'] ?? 'database/database.sqlite'));
    if ($dbPath === '' || $dbPath === ':memory:') {
        warning('SQLite DB path is empty or :memory:, skipping file creation.');
        return;
    }

    if (!str_starts_with($dbPath, '/') && !preg_match('/^[A-Za-z]:\\\\/', $dbPath)) {
        $dbPath = $root . DIRECTORY_SEPARATOR . str_replace(['/', '\\\\'], DIRECTORY_SEPARATOR, $dbPath);
    }

    $dbDir = dirname($dbPath);
    if (!is_dir($dbDir) && !@mkdir($dbDir, 0775, true) && !is_dir($dbDir)) {
        throw new RuntimeException("Cannot create sqlite directory: {$dbDir}");
    }

    if (!file_exists($dbPath)) {
        touch($dbPath);
        info("SQLite file created: {$dbPath}");
    } else {
        info("SQLite file already exists: {$dbPath}");
    }
}

function loadEnv(string $envPath): array
{
    $values = [];

    if (!file_exists($envPath)) {
        return $values;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }

        $key = trim(substr($line, 0, $pos));
        $value = trim(substr($line, $pos + 1));
        $value = trim($value, " \t\n\r\0\x0B\"");

        $values[$key] = $value;
    }

    return $values;
}

function run(string $command): void
{
    info("Running: {$command}");
    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        throw new RuntimeException("Command failed ({$exitCode}): {$command}");
    }
}

function printCsrfChecklist(array $env): void
{
    echo PHP_EOL;
    info('CSRF/419 checklist:');

    $checks = [
        'APP_URL' => [
            'value' => $env['APP_URL'] ?? null,
            'ok' => isset($env['APP_URL']) && str_starts_with((string) $env['APP_URL'], 'https://'),
            'hint' => 'Use full https URL of production domain.',
        ],
        'SESSION_DRIVER' => [
            'value' => $env['SESSION_DRIVER'] ?? null,
            'ok' => in_array(strtolower((string) ($env['SESSION_DRIVER'] ?? '')), ['database', 'redis', 'file', 'cookie'], true),
            'hint' => 'Prefer database or redis in production.',
        ],
        'SESSION_DOMAIN' => [
            'value' => $env['SESSION_DOMAIN'] ?? null,
            'ok' => !empty($env['SESSION_DOMAIN']),
            'hint' => 'Set .example.com when app runs on subdomain.',
        ],
        'SESSION_SECURE_COOKIE' => [
            'value' => $env['SESSION_SECURE_COOKIE'] ?? null,
            'ok' => strtolower((string) ($env['SESSION_SECURE_COOKIE'] ?? '')) === 'true',
            'hint' => 'Must be true behind HTTPS.',
        ],
        'SESSION_SAME_SITE' => [
            'value' => $env['SESSION_SAME_SITE'] ?? null,
            'ok' => in_array(strtolower((string) ($env['SESSION_SAME_SITE'] ?? '')), ['lax', 'none', 'strict'], true),
            'hint' => 'Use lax for same-domain; none for cross-domain with secure cookie.',
        ],
    ];

    foreach ($checks as $key => $check) {
        $status = $check['ok'] ? 'OK' : 'WARN';
        $value = (string) ($check['value'] ?? '(missing)');
        echo " - [{$status}] {$key}={$value}" . PHP_EOL;
        if (!$check['ok']) {
            echo "   -> {$check['hint']}" . PHP_EOL;
        }
    }

    echo PHP_EOL;
}

function copyOrFail(string $from, string $to): void
{
    if (!@copy($from, $to)) {
        throw new RuntimeException("Failed copying {$from} to {$to}");
    }
}

function info(string $message): void
{
    echo "[INFO] {$message}" . PHP_EOL;
}

function warning(string $message): void
{
    echo "[WARN] {$message}" . PHP_EOL;
}

function success(string $message): void
{
    echo "[DONE] {$message}" . PHP_EOL;
}

