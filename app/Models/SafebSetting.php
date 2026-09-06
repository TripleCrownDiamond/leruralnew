<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SafebSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * Recupere la valeur d'un parametre SafeB.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        return $setting?->value ?? $default;
    }

    /**
     * Enregistre ou met a jour un parametre SafeB.
     */
    public static function set(string $key, mixed $value): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Recupere tous les parametres SafeB sous forme de tableau.
     */
    public static function allAsArray(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
