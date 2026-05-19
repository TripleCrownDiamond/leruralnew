<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Index sur articles pour les requêtes fréquentes
        Schema::table('articles', function (Blueprint $table) {
            // Index composite pour les articles publiés triés par date
            if (!$this->indexExists('articles', 'articles_published_at_is_premium_index')) {
                $table->index(['published_at', 'is_premium'], 'articles_published_at_is_premium_index');
            }
            
            // Index pour les articles en vedette
            if (!$this->indexExists('articles', 'articles_is_featured_published_at_index')) {
                $table->index(['is_featured', 'published_at'], 'articles_is_featured_published_at_index');
            }
            
            // Index pour la recherche par auteur
            if (!$this->indexExists('articles', 'articles_author_id_index')) {
                $table->index('author_id', 'articles_author_id_index');
            }
        });

        // Index sur comments pour la modération
        Schema::table('comments', function (Blueprint $table) {
            if (!$this->indexExists('comments', 'comments_is_approved_created_at_index')) {
                $table->index(['is_approved', 'created_at'], 'comments_is_approved_created_at_index');
            }
            
            if (!$this->indexExists('comments', 'comments_article_id_is_approved_index')) {
                $table->index(['article_id', 'is_approved'], 'comments_article_id_is_approved_index');
            }
        });

        // Index sur payments pour les requêtes admin
        Schema::table('payments', function (Blueprint $table) {
            if (!$this->indexExists('payments', 'payments_status_created_at_index')) {
                $table->index(['status', 'created_at'], 'payments_status_created_at_index');
            }
            
            if (!$this->indexExists('payments', 'payments_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'payments_user_id_status_index');
            }
        });

        // Index sur user_subscriptions
        Schema::table('user_subscriptions', function (Blueprint $table) {
            if (!$this->indexExists('user_subscriptions', 'user_subscriptions_user_id_status_ends_at_index')) {
                $table->index(['user_id', 'status', 'ends_at'], 'user_subscriptions_user_id_status_ends_at_index');
            }
        });

        // Index sur categories
        Schema::table('categories', function (Blueprint $table) {
            if (!$this->indexExists('categories', 'categories_published_order_index')) {
                $table->index(['published', 'order'], 'categories_published_order_index');
            }
        });

        // Index sur settings pour les lookups par clé
        Schema::table('settings', function (Blueprint $table) {
            if (!$this->indexExists('settings', 'settings_key_unique') && !$this->indexExists('settings', 'settings_key_index')) {
                $table->unique('key', 'settings_key_unique');
            }
        });

        // Index sur polls pour les sondages actifs
        Schema::table('polls', function (Blueprint $table) {
            if (!$this->indexExists('polls', 'polls_is_active_expires_at_index')) {
                $table->index(['is_active', 'expires_at'], 'polls_is_active_expires_at_index');
            }
        });

        // Index sur static_pages
        Schema::table('static_pages', function (Blueprint $table) {
            if (!$this->indexExists('static_pages', 'static_pages_is_published_category_index')) {
                $table->index(['is_published', 'category', 'order'], 'static_pages_is_published_category_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndexIfExists('articles_published_at_is_premium_index');
            $table->dropIndexIfExists('articles_is_featured_published_at_index');
            $table->dropIndexIfExists('articles_author_id_index');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndexIfExists('comments_is_approved_created_at_index');
            $table->dropIndexIfExists('comments_article_id_is_approved_index');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndexIfExists('payments_status_created_at_index');
            $table->dropIndexIfExists('payments_user_id_status_index');
        });

        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->dropIndexIfExists('user_subscriptions_user_id_status_ends_at_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndexIfExists('categories_published_order_index');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropIndexIfExists('settings_key_unique');
        });

        Schema::table('polls', function (Blueprint $table) {
            $table->dropIndexIfExists('polls_is_active_expires_at_index');
        });

        Schema::table('static_pages', function (Blueprint $table) {
            $table->dropIndexIfExists('static_pages_is_published_category_index');
        });
    }

    /**
     * Check if an index exists on a table.
     */
    protected function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $driverName = $connection->getDriverName();

        if ($driverName === 'sqlite') {
            $indexes = $connection->select(
                "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name=?",
                [$table, $indexName]
            );
            return count($indexes) > 0;
        }

        if ($driverName === 'mysql') {
            $indexes = $connection->select(
                "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
                [$indexName]
            );
            return count($indexes) > 0;
        }

        if ($driverName === 'pgsql') {
            $indexes = $connection->select(
                "SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );
            return count($indexes) > 0;
        }

        return false;
    }
};