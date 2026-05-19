<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            [
                'key' => 'live_jingle_duration_seconds',
                'value' => '90',
            ],
            [
                'key' => 'live_emission_duration_seconds',
                'value' => '720',
            ],
            [
                'key' => 'live_auto_refresh_seconds',
                'value' => '60',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::query()->firstOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }
    }

    public function down(): void
    {
        Setting::query()
            ->whereIn('key', [
                'live_jingle_duration_seconds',
                'live_emission_duration_seconds',
                'live_auto_refresh_seconds',
            ])
            ->delete();
    }
};