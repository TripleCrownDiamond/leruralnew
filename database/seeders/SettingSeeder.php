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
            // Contact
            'contact_phone' => '+229 0190350490',
            'contact_email' => 'secretariat@lerural.bj',
            'contact_address' => 'Abomey Calavi',
            
            // SEO & Partage Social
            'site_slogan' => '1er groupe de presse agricole en Afrique de l\'Ouest',
            'seo_default_description' => 'LE RURAL - 1er groupe de presse agricole en Afrique de l\'Ouest. Actualités, analyses et informations sur l\'agriculture, l\'élevage et le monde rural.',
            'seo_default_image' => '/logos/logo.png', // Recommandé: image 1200x630px pour un affichage optimal sur les réseaux sociaux
            
            // Modération
            'comment_moderation' => 'auto',
            
            // Réseaux sociaux
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
