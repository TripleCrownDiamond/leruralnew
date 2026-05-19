<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$options = parseArgs($argv);

$sourcePath = resolvePath((string) ($options['source'] ?? 'c:\\Users\\takac\\Downloads\\database.sqlite'));
$targetPath = resolvePath((string) ($options['target'] ?? base_path('database/database.sqlite')));
$dryRun = ($options['dry-run'] ?? '0') === '1';
$limit = isset($options['limit']) ? max(1, (int) $options['limit']) : null;

if (!is_file($sourcePath)) {
    fwrite(STDERR, "Source DB not found: {$sourcePath}\n");
    exit(1);
}

if (!is_file($targetPath)) {
    fwrite(STDERR, "Target DB not found: {$targetPath}\n");
    exit(1);
}

if (realpath($sourcePath) === realpath($targetPath)) {
    fwrite(STDERR, "Source and target databases are identical. Aborting.\n");
    exit(1);
}

$source = new PDO('sqlite:' . $sourcePath);
$source->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$target = new PDO('sqlite:' . $targetPath);
$target->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

assertTableExists($source, 'source');
assertTableExists($target, 'target');

$sourceColumns = getArticleColumns($source);
$targetColumns = getArticleColumns($target);
$commonColumns = array_values(array_intersect($sourceColumns, $targetColumns));

$insertColumns = array_values(array_filter($commonColumns, fn (string $column) => $column !== 'id'));
if ($insertColumns === []) {
    fwrite(STDERR, "No compatible columns found between source and target.\n");
    exit(1);
}

$sourceCount = (int) $source->query('SELECT COUNT(*) FROM articles')->fetchColumn();
$targetBefore = (int) $target->query('SELECT COUNT(*) FROM articles')->fetchColumn();

$targetSlugs = $target->query('SELECT slug FROM articles WHERE slug IS NOT NULL AND slug <> ""')
    ->fetchAll(PDO::FETCH_COLUMN);
$existingSlugMap = [];
foreach ($targetSlugs as $slug) {
    $existingSlugMap[(string) $slug] = true;
}

$selectColumnsSql = implode(', ', array_map(static fn (string $c) => '"' . $c . '"', $insertColumns));
$sourceSql = 'SELECT ' . $selectColumnsSql . ' FROM articles WHERE slug IS NOT NULL AND slug <> "" ORDER BY id ASC';
if ($limit !== null) {
    $sourceSql .= ' LIMIT ' . $limit;
}

$stmtSource = $source->query($sourceSql);

$placeholders = implode(', ', array_fill(0, count($insertColumns), '?'));
$insertSql = 'INSERT INTO articles ('
    . implode(', ', array_map(static fn (string $c) => '"' . $c . '"', $insertColumns))
    . ') VALUES (' . $placeholders . ')';
$stmtInsert = $target->prepare($insertSql);

$stats = [
    'source_total' => $sourceCount,
    'target_before' => $targetBefore,
    'processed' => 0,
    'created' => 0,
    'skipped_existing' => 0,
    'skipped_invalid' => 0,
    'errors' => 0,
];

$syncedArticles = [];

if (!$dryRun) {
    $target->beginTransaction();
}

try {
    while ($row = $stmtSource->fetch(PDO::FETCH_ASSOC)) {
        $stats['processed']++;

        $slug = trim((string) ($row['slug'] ?? ''));
        if ($slug === '') {
            $stats['skipped_invalid']++;
            continue;
        }

        if (isset($existingSlugMap[$slug])) {
            $stats['skipped_existing']++;
            continue;
        }

        $values = [];
        foreach ($insertColumns as $column) {
            $values[] = $row[$column] ?? null;
        }

        if (!$dryRun) {
            $stmtInsert->execute($values);
        }

        $existingSlugMap[$slug] = true;
        $stats['created']++;
        $syncedArticles[] = [
            'slug' => $slug,
            'title_fr' => (string) ($row['title_fr'] ?? ''),
            'published_at' => (string) ($row['published_at'] ?? ''),
        ];
    }

    if (!$dryRun) {
        $target->commit();
    }
} catch (Throwable $e) {
    if (!$dryRun && $target->inTransaction()) {
        $target->rollBack();
    }

    fwrite(STDERR, 'Sync aborted: ' . $e->getMessage() . "\n");
    exit(1);
}

$targetAfter = (int) $target->query('SELECT COUNT(*) FROM articles')->fetchColumn();
$stats['target_after'] = $targetAfter;

$report = [
    'mode' => $dryRun ? 'dry-run' : 'insert-missing-by-slug',
    'source' => $sourcePath,
    'target' => $targetPath,
    'stats' => $stats,
    'synced_articles' => $syncedArticles,
    'generated_at' => now()->toDateTimeString(),
];

$reportDir = storage_path('logs');
if (!is_dir($reportDir)) {
    mkdir($reportDir, 0777, true);
}

$reportPath = $options['report'] ?? ($reportDir . '/article-sync-' . now()->format('Ymd-His') . '.json');
file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Mode: {$report['mode']}\n";
echo "Source: {$sourcePath}\n";
echo "Target: {$targetPath}\n\n";
echo "Processed: {$stats['processed']}\n";
echo "Created: {$stats['created']}\n";
echo "Skipped (existing): {$stats['skipped_existing']}\n";
echo "Skipped (invalid): {$stats['skipped_invalid']}\n";
echo "Errors: {$stats['errors']}\n";
echo "Target count before: {$stats['target_before']}\n";
echo "Target count after: {$stats['target_after']}\n";
echo "Report: {$reportPath}\n";

if ($stats['created'] > 0) {
    echo "\nSynced article slugs:\n";
    foreach ($syncedArticles as $article) {
        echo '- ' . $article['slug'] . "\n";
    }
}

function parseArgs(array $argv): array
{
    $opts = [];

    foreach ($argv as $arg) {
        if (!is_string($arg) || !str_starts_with($arg, '--')) {
            continue;
        }

        $parts = explode('=', substr($arg, 2), 2);
        $key = $parts[0] ?? '';
        $val = $parts[1] ?? '1';

        if ($key !== '') {
            $opts[$key] = $val;
        }
    }

    return $opts;
}

function resolvePath(string $path): string
{
    if ($path === '') {
        return $path;
    }

    if (preg_match('/^[A-Za-z]:\\\\/', $path) || str_starts_with($path, '/')) {
        return $path;
    }

    return base_path($path);
}

function assertTableExists(PDO $pdo, string $label): void
{
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'articles'")->fetchColumn();
    if ($exists === 0) {
        fwrite(STDERR, "The {$label} database has no articles table.\n");
        exit(1);
    }
}

function getArticleColumns(PDO $pdo): array
{
    $rows = $pdo->query('PRAGMA table_info(articles)')->fetchAll(PDO::FETCH_ASSOC);

    return array_values(array_map(static fn (array $row) => (string) ($row['name'] ?? ''), $rows));
}