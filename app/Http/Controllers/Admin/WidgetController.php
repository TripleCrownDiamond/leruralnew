<?php

namespace App\Http\Controllers\Admin;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends AdminController
{
    private const WIDGET_KEYS = [
        'widget_show_announcements',
        'widget_show_market_prices',
        'widget_show_webtv',
        'widget_show_partners',
        'widget_show_socials',
        'widget_show_sidebar_ads',
        'widget_show_newsletter',
    ];

    private const DASHBOARD_CONTENT_KEYS = [
        'dashboard_hero_title',
        'dashboard_hero_subtitle',
        'dashboard_quick_actions_title',
        'dashboard_agenda_title',
        'dashboard_empty_chart_title',
        'dashboard_empty_chart_subtitle',
        'dashboard_empty_chart_text',
    ];

    public function index(): Response
    {
        $defaults = array_merge(
            array_fill_keys(self::WIDGET_KEYS, '1'),
            array_fill_keys(self::DASHBOARD_CONTENT_KEYS, null)
        );

        $settings = Setting::whereIn('key', array_merge(self::WIDGET_KEYS, self::DASHBOARD_CONTENT_KEYS))
            ->pluck('value', 'key')
            ->all();

        return Inertia::render('Dashboard/Widgets/Index', [
            'settings' => array_merge($defaults, $settings),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'widget_show_announcements' => ['boolean'],
            'widget_show_market_prices' => ['boolean'],
            'widget_show_webtv' => ['boolean'],
            'widget_show_partners' => ['boolean'],
            'widget_show_socials' => ['boolean'],
            'widget_show_sidebar_ads' => ['boolean'],
            'widget_show_newsletter' => ['boolean'],
            'dashboard_hero_title' => ['nullable', 'string', 'max:150'],
            'dashboard_hero_subtitle' => ['nullable', 'string', 'max:400'],
            'dashboard_quick_actions_title' => ['nullable', 'string', 'max:120'],
            'dashboard_agenda_title' => ['nullable', 'string', 'max:120'],
            'dashboard_empty_chart_title' => ['nullable', 'string', 'max:120'],
            'dashboard_empty_chart_subtitle' => ['nullable', 'string', 'max:180'],
            'dashboard_empty_chart_text' => ['nullable', 'string', 'max:400'],
        ]);

        foreach (self::WIDGET_KEYS as $key) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => !empty($data[$key]) ? '1' : '0']
            );
        }

        foreach (self::DASHBOARD_CONTENT_KEYS as $key) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => filled($data[$key] ?? null) ? trim((string) $data[$key]) : null]
            );
        }

        return back()->with('success', 'Widgets et contenu dashboard mis a jour.');
    }
}