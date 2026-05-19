<?php

namespace App\Console\Commands;

use App\Services\CacheService;
use Illuminate\Console\Command;

class CacheWarmUp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warmup 
                            {--clear : Clear all application cache before warming up}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up the application cache (settings, categories, footer pages, etc.)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('clear')) {
            $this->info('Clearing application cache...');
            CacheService::clearAll();
            $this->info('✓ Cache cleared.');
        }

        $this->info('Warming up application cache...');
        
        $this->task('Settings', fn () => CacheService::settings());
        $this->task('Categories', fn () => CacheService::categories());
        $this->task('Footer pages', fn () => CacheService::footerPages());
        $this->task('SEO defaults', fn () => CacheService::seoDefaults());
        $this->task('Featured promo', fn () => CacheService::featuredPromo());
        
        $this->newLine();
        $this->info('✓ Cache warmed up successfully!');
        
        return Command::SUCCESS;
    }

    /**
     * Execute a task and display its status.
     */
    protected function task(string $title, callable $callback): void
    {
        $this->output->write("  → {$title}... ");
        
        try {
            $callback();
            $this->output->writeln('<info>✓</info>');
        } catch (\Throwable $e) {
            $this->output->writeln('<error>✗</error>');
            $this->error("    Error: {$e->getMessage()}");
        }
    }
}