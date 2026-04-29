<?php

namespace App\Http\Controllers\Admin;

use App\Models\Setting;
use App\Models\StaticPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FooterController extends AdminController
{
    private const CONTENT_KEYS = [
        'footer_description',
        'footer_copyright',
        'mobile_menu_description',
        'contact_address',
        'contact_phone',
        'contact_email',
        'footer_info_title',
        'footer_group_title',
        'footer_newsletter_title',
        'footer_newsletter_description',
        'footer_group_links',
        'mobile_menu_links_title',
        'footer_top_badge',
        'footer_top_tagline',
        'footer_brand_title',
        'footer_newsletter_placeholder',
    ];

    public function index(): Response
    {
        StaticPage::ensureDefaultPages();

        $defaults = [
            'footer_description' => "1er groupe de presse agricole en Afrique de l'Ouest. Information fiable et pertinente pour le developpement rural.",
            'footer_copyright' => now()->year . ' LE RURAL - Tous droits reserves.',
            'mobile_menu_description' => "Retrouvez les rubriques, les pages statiques et nos contacts directement depuis ce menu.",
            'contact_address' => 'Abomey Calavi',
            'contact_phone' => '+229 0190350490',
            'contact_email' => 'secretariat@lerural.bj',
            'footer_info_title' => 'Informations',
            'footer_group_title' => 'Le Groupe',
            'footer_newsletter_title' => 'Newsletter',
            'footer_newsletter_description' => "Recevez l'essentiel de l'actualite agricole chaque matin.",
            'footer_group_links' => "Entreprise|/pages/entreprise
Carrieres|/pages/carrieres
Opportunites|/pages/opportunites
Plurimedia|/pages/plurimedia
Communication|/pages/communication
EIMA|/pages/eima
Fondation LE RURAL|/pages/fondation-le-rural",
            'mobile_menu_links_title' => 'Liens utiles',
            'footer_top_badge' => 'LE RURAL',
            'footer_top_tagline' => 'Media agricole',
            'footer_brand_title' => 'LE RURAL',
            'footer_newsletter_placeholder' => 'Votre email',
        ];
        $settings = Setting::whereIn('key', self::CONTENT_KEYS)->pluck('value', 'key')->all();

        $legacyGroupLinks = "Entreprise|#
Carrieres|#
Opportunites|#
Plurimedia|#
Communication|#
EIMA|#
Fondation LE RURAL|#";

        if (($settings['footer_group_links'] ?? null) === $legacyGroupLinks) {
            Setting::updateOrCreate(
                ['key' => 'footer_group_links'],
                ['value' => $defaults['footer_group_links']]
            );

            $settings['footer_group_links'] = $defaults['footer_group_links'];
        }

        $staticPages = StaticPage::query()
            ->orderBy('category')
            ->orderBy('order')
            ->get(['id', 'title', 'slug', 'category', 'is_published']);

        return Inertia::render('Dashboard/Footer/Index', [
            'settings' => array_merge($defaults, $settings),
            'staticPages' => $staticPages,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'footer_description' => ['nullable', 'string', 'max:1000'],
            'footer_copyright' => ['nullable', 'string', 'max:255'],
            'mobile_menu_description' => ['nullable', 'string', 'max:500'],
            'contact_address' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'string', 'max:255'],
            'footer_info_title' => ['nullable', 'string', 'max:120'],
            'footer_group_title' => ['nullable', 'string', 'max:120'],
            'footer_newsletter_title' => ['nullable', 'string', 'max:120'],
            'footer_newsletter_description' => ['nullable', 'string', 'max:400'],
            'footer_group_links' => ['nullable', 'string', 'max:4000'],
            'mobile_menu_links_title' => ['nullable', 'string', 'max:120'],
            'footer_top_badge' => ['nullable', 'string', 'max:120'],
            'footer_top_tagline' => ['nullable', 'string', 'max:120'],
            'footer_brand_title' => ['nullable', 'string', 'max:120'],
            'footer_newsletter_placeholder' => ['nullable', 'string', 'max:120'],
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => filled($value) ? trim($value) : null]
            );
        }

        return back()->with('success', 'Footer et menu mobile mis a jour.');
    }
}