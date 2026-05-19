<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveStreamNotification extends Model
{
    protected $fillable = [
        'live_stream_id',
        'type',
        'sent_at',
        'recipients_count',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'recipients_count' => 'integer',
    ];

    public const TYPE_START = 'start';
    public const TYPE_REMINDER_15MIN = 'reminder_15min';
    public const TYPE_REMINDER_5MIN = 'reminder_5min';
    public const TYPE_ENDED = 'ended';

    public function liveStream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class);
    }

    /**
     * Vérifie si une notification de ce type a déjà été envoyée pour ce live
     */
    public static function alreadySent(int $liveStreamId, string $type): bool
    {
        return static::query()
            ->where('live_stream_id', $liveStreamId)
            ->where('type', $type)
            ->exists();
    }

    /**
     * Marque une notification comme envoyée
     */
    public static function markAsSent(int $liveStreamId, string $type, int $recipientsCount = 0): self
    {
        return static::create([
            'live_stream_id' => $liveStreamId,
            'type' => $type,
            'sent_at' => now(),
            'recipients_count' => $recipientsCount,
        ]);
    }
}