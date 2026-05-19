<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $new = 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';

        $existing = DB::table('settings')
            ->where('key', 'live_fallback_video_url')
            ->value('value');

        $normalized = trim((string) ($existing ?? ''));

        $replaceable = [
            '',
            'https://www.youtube.com/watch?v=MUIYEPFS-bk',
            'https://youtu.be/MUIYEPFS-bk',
        ];

        if ($existing === null || in_array($normalized, $replaceable, true)) {
            DB::table('settings')->updateOrInsert(
                ['key' => 'live_fallback_video_url'],
                ['value' => $new]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('key', 'live_fallback_video_url')
            ->where('value', 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5')
            ->update(['value' => 'https://www.youtube.com/watch?v=MUIYEPFS-bk']);
    }
};
