<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'live_start_email',
        'live_start_push',
        'live_reminder_email',
        'live_reminder_push',
        'new_article_email',
        'new_article_push',
        'subscription_email',
        'marketing_email',
    ];

    protected $casts = [
        'live_start_email' => 'boolean',
        'live_start_push' => 'boolean',
        'live_reminder_email' => 'boolean',
        'live_reminder_push' => 'boolean',
        'new_article_email' => 'boolean',
        'new_article_push' => 'boolean',
        'subscription_email' => 'boolean',
        'marketing_email' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Récupère ou crée les préférences pour un utilisateur
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId],
            [
                'live_start_email' => true,
                'live_start_push' => true,
                'live_reminder_email' => true,
                'live_reminder_push' => true,
                'new_article_email' => false,
                'new_article_push' => true,
                'subscription_email' => true,
                'marketing_email' => false,
            ]
        );
    }
}