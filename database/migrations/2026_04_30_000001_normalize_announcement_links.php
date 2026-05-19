<?php

use App\Models\Announcement;
use App\Services\AnnouncementLinkResolver;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $resolver = app(AnnouncementLinkResolver::class);

        Announcement::query()->chunkById(100, function ($announcements) use ($resolver): void {
            foreach ($announcements as $announcement) {
                $normalized = $resolver->normalize($announcement->link_url);

                if ($normalized !== $announcement->link_url) {
                    $announcement->forceFill(['link_url' => $normalized])->saveQuietly();
                }
            }
        });
    }

    public function down(): void
    {
        // No safe rollback for legacy link normalization.
    }
};