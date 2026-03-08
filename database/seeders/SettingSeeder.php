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
            'comment_moderation' => 'auto', // auto or manual
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
