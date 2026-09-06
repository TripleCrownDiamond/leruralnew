<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class SafebRegistration extends Model
{
    public const STATUS_NEW = 'new';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_CONTACTED,
        self::STATUS_CONFIRMED,
    ];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'files' => 'array',
        ];
    }

    /**
     * Libelle lisible du type d'inscription.
     */
    protected function typeLabel(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => match ($attributes['type'] ?? null) {
                'panel' => 'Participant au panel',
                'partner' => 'Partenaire',
                'stand' => 'Reservation de stand',
                'masterclass' => 'Inscription masterclass',
                'pitch' => 'Concours de pitch',
                'culinary' => 'Concours d\'art culinaire',
                'film' => 'Concours de films',
                default => $attributes['type'] ?? 'Inconnu',
            },
        );
    }

    /**
     * Libelle lisible du statut de suivi.
     */
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => match ($attributes['status'] ?? null) {
                self::STATUS_NEW => 'Nouveau',
                self::STATUS_CONTACTED => 'Contacte',
                self::STATUS_CONFIRMED => 'Confirme',
                default => $attributes['status'] ?? 'Nouveau',
            },
        );
    }

    /**
     * URLs de telechargement des fichiers uploades.
     */
    protected function filesUrls(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => collect($attributes['files'] ?? [])
                ->map(fn (string $path) => [
                    'path' => $path,
                    'name' => basename($path),
                    'url' => '/storage/' . $path,
                ])
                ->toArray(),
        );
    }
}
