<?php

namespace App\Http\Controllers\Admin;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends AdminController
{
    private const SOCIAL_KEYS = [
        'social_facebook_url',
        'social_x_url',
        'social_instagram_url',
        'social_tiktok_url',
        'social_whatsapp_url',
        'social_linkedin_url',
    ];

    private const WHATSAPP_KEYS = [
        'floating_whatsapp_enabled',
        'floating_whatsapp_number',
        'floating_whatsapp_message',
    ];

    private const INTEGRATION_KEYS = [
        'google_search_console_enabled',
        'google_search_console_verification_token',
        'google_search_console_property_url',

        'google_site_kit_enabled',
        'google_site_kit_client_id',
        'google_site_kit_client_secret',
        'google_site_kit_redirect_uri',
        'google_site_kit_property_id',

        'google_adsense_enabled',
        'google_adsense_client_id',
        'google_adsense_slot_id',
        'google_adsense_auto_ads_enabled',

        'facebook_pixel_enabled',
        'facebook_pixel_id',
        'facebook_pixel_access_token',
        'facebook_pixel_test_event_code',

        'tiktok_pixel_enabled',
        'tiktok_pixel_id',
        'tiktok_access_token',
        'tiktok_test_event_code',

        'andromeda_enabled',
        'andromeda_tracking_id',
        'andromeda_endpoint_url',
        'andromeda_api_key',
    ];

    public function payment(): Response
    {
        $settings = Setting::where('group', 'payment')->get()->pluck('value', 'key');

        return Inertia::render('Admin/Settings/Payment', [
            'settings' => $settings,
        ]);
    }

    public function updatePayment(Request $request)
    {
        $data = $request->validate([
            'kkiapay_active' => 'boolean',
            'kkiapay_public_key' => 'nullable|string',
            'kkiapay_private_key' => 'nullable|string',
            'kkiapay_secret' => 'nullable|string',
            'fedapay_active' => 'boolean',
            'fedapay_public_key' => 'nullable|string',
            'fedapay_secret_key' => 'nullable|string',
            'manual_payment_active' => 'boolean',
            'manual_payment_number' => 'nullable|string',
            'manual_payment_instructions' => 'nullable|string',
        ]);

        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return back()->with('success', 'Parametres de paiement mis a jour.');
    }

    public function socials(): Response
    {
        $defaults = array_fill_keys(self::SOCIAL_KEYS, null);
        $settings = Setting::whereIn('key', self::SOCIAL_KEYS)->pluck('value', 'key')->all();

        return Inertia::render('Admin/Settings/Socials', [
            'settings' => array_merge($defaults, $settings),
        ]);
    }

    public function updateSocials(Request $request)
    {
        $data = $request->validate([
            'social_facebook_url' => 'nullable|string|max:255',
            'social_x_url' => 'nullable|string|max:255',
            'social_instagram_url' => 'nullable|string|max:255',
            'social_tiktok_url' => 'nullable|string|max:255',
            'social_whatsapp_url' => 'nullable|string|max:255',
            'social_linkedin_url' => 'nullable|string|max:255',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => filled($value) ? trim($value) : null]
            );
        }

        return back()->with('success', 'Reseaux sociaux mis a jour.');
    }

    public function whatsapp(): Response
    {
        $defaults = [
            'floating_whatsapp_enabled' => '1',
            'floating_whatsapp_number' => null,
            'floating_whatsapp_message' => 'Bonjour LE RURAL, je souhaite plus d\'informations.',
        ];

        $settings = Setting::whereIn('key', self::WHATSAPP_KEYS)->pluck('value', 'key')->all();

        return Inertia::render('Admin/Settings/WhatsApp', [
            'settings' => array_merge($defaults, $settings),
        ]);
    }

    public function updateWhatsapp(Request $request)
    {
        $data = $request->validate([
            'floating_whatsapp_enabled' => 'boolean',
            'floating_whatsapp_number' => 'nullable|string|max:30',
            'floating_whatsapp_message' => 'nullable|string|max:255',
        ]);

        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => filled($value) ? trim((string) $value) : null]
            );
        }

        return back()->with('success', 'Configuration WhatsApp mise a jour.');
    }

    public function integrations(): Response
    {
        $defaults = array_fill_keys(self::INTEGRATION_KEYS, null);
        $settings = Setting::whereIn('key', self::INTEGRATION_KEYS)->pluck('value', 'key')->all();

        return Inertia::render('Admin/Settings/Integrations', [
            'settings' => array_merge($defaults, $settings),
        ]);
    }

    public function updateIntegrations(Request $request)
    {
        $data = $request->validate([
            'google_search_console_enabled' => 'boolean',
            'google_search_console_verification_token' => 'nullable|string|max:500',
            'google_search_console_property_url' => 'nullable|string|max:255',

            'google_site_kit_enabled' => 'boolean',
            'google_site_kit_client_id' => 'nullable|string|max:500',
            'google_site_kit_client_secret' => 'nullable|string|max:500',
            'google_site_kit_redirect_uri' => 'nullable|string|max:255',
            'google_site_kit_property_id' => 'nullable|string|max:255',

            'google_adsense_enabled' => 'boolean',
            'google_adsense_client_id' => 'nullable|string|max:255',
            'google_adsense_slot_id' => 'nullable|string|max:255',
            'google_adsense_auto_ads_enabled' => 'boolean',

            'facebook_pixel_enabled' => 'boolean',
            'facebook_pixel_id' => 'nullable|string|max:255',
            'facebook_pixel_access_token' => 'nullable|string|max:500',
            'facebook_pixel_test_event_code' => 'nullable|string|max:255',

            'tiktok_pixel_enabled' => 'boolean',
            'tiktok_pixel_id' => 'nullable|string|max:255',
            'tiktok_access_token' => 'nullable|string|max:500',
            'tiktok_test_event_code' => 'nullable|string|max:255',

            'andromeda_enabled' => 'boolean',
            'andromeda_tracking_id' => 'nullable|string|max:255',
            'andromeda_endpoint_url' => 'nullable|string|max:255',
            'andromeda_api_key' => 'nullable|string|max:500',
        ]);

        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => filled($value) ? trim((string) $value) : null]
            );
        }

        return back()->with('success', 'Integrations tracking mises a jour.');
    }
}
