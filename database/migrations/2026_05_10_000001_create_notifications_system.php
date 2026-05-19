<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table des notifications Laravel (si pas déjà créée)
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
            });
        }

        // Préférences de notification utilisateur
        if (!Schema::hasTable('user_notification_preferences')) {
            Schema::create('user_notification_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->boolean('live_start_email')->default(true);
                $table->boolean('live_start_push')->default(true);
                $table->boolean('live_reminder_email')->default(true);
                $table->boolean('live_reminder_push')->default(true);
                $table->boolean('new_article_email')->default(false);
                $table->boolean('new_article_push')->default(true);
                $table->boolean('subscription_email')->default(true);
                $table->boolean('marketing_email')->default(false);
                $table->timestamps();

                $table->unique('user_id');
            });
        }

        // Ajout des préférences de notification au modèle User
        if (!Schema::hasColumn('users', 'notify_live_start')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('notify_live_start')->default(true)->after('last_login_at');
                $table->boolean('notify_new_content')->default(true)->after('notify_live_start');
            });
        }

        // Table pour tracker les notifications de live envoyées (éviter les doublons)
        if (!Schema::hasTable('live_stream_notifications')) {
            Schema::create('live_stream_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('live_stream_id')->constrained()->onDelete('cascade');
                $table->enum('type', ['start', 'reminder_15min', 'reminder_5min', 'ended'])->default('start');
                $table->timestamp('sent_at');
                $table->integer('recipients_count')->default(0);
                $table->timestamps();

                $table->unique(['live_stream_id', 'type']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('live_stream_notifications');
        
        if (Schema::hasColumn('users', 'notify_live_start')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['notify_live_start', 'notify_new_content']);
            });
        }

        Schema::dropIfExists('user_notification_preferences');
        Schema::dropIfExists('notifications');
    }
};