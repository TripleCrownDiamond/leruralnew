<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'contact_phone' => '+229 0190350490',
            'contact_email' => 'secretariat@lerural.bj',
            'contact_address' => 'Abomey Calavi',
            'comment_moderation' => 'auto',
            'social_facebook_url' => null,
            'social_x_url' => null,
            'social_instagram_url' => null,
            'social_tiktok_url' => null,
            'social_whatsapp_url' => null,
            'social_linkedin_url' => null,
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
