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

    private const CONTENT_KEYS = [
        'dashboard_hero_title',
        'dashboard_hero_subtitle',
        'dashboard_quick_actions_title',
        'dashboard_agenda_title',
        'dashboard_empty_chart_title',
        'dashboard_empty_chart_subtitle',
        'dashboard_empty_chart_text',
        'live_fallback_video_url',
    ];

    public function index(): Response
    {
        $defaults = array_merge(
            array_fill_keys(self::WIDGET_KEYS, '1'),
            array_fill_keys(self::CONTENT_KEYS, null),
            [
                'live_fallback_video_url' => 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5',
            ]
        );

        $settings = Setting::whereIn('key', array_merge(self::WIDGET_KEYS, self::CONTENT_KEYS))
            ->pluck('value', 'key')
            ->all();

        if (isset($settings['live_fallback_video_url']) && !preg_match('/^https?:\/\//i', (string) $settings['live_fallback_video_url'])) {
            $settings['live_fallback_video_url'] = 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';
        }

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
            'live_fallback_video_url' => ['nullable', 'url', 'max:2048'],
        ]);

        foreach (self::WIDGET_KEYS as $key) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => !empty($data[$key]) ? '1' : '0']
            );
        }

        foreach (self::CONTENT_KEYS as $key) {
            if ($key === 'live_fallback_video_url') {
                continue;
            }

            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => filled($data[$key] ?? null)
                        ? trim((string) $data[$key])
                        : null,
                ]
            );
        }

        Setting::updateOrCreate(
            ['key' => 'live_fallback_video_url'],
            [
                'value' => filled($data['live_fallback_video_url'] ?? null)
                    ? trim((string) $data['live_fallback_video_url'])
                    : 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5',
            ]
        );

        return back()->with('success', 'Widgets et contenu dashboard mis a jour.');
    }
}

