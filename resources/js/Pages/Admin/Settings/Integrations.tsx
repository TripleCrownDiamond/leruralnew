import InputError from '@/Components/InputError';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard from '@/Components/Dashboard/AdminCard';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Settings2 } from 'lucide-react';

type IntegrationForm = {
    google_search_console_enabled: boolean;
    google_search_console_verification_token: string;
    google_search_console_property_url: string;

    google_site_kit_enabled: boolean;
    google_site_kit_client_id: string;
    google_site_kit_client_secret: string;
    google_site_kit_redirect_uri: string;
    google_site_kit_property_id: string;

    google_adsense_enabled: boolean;
    google_adsense_client_id: string;
    google_adsense_slot_id: string;
    google_adsense_auto_ads_enabled: boolean;

    facebook_pixel_enabled: boolean;
    facebook_pixel_id: string;
    facebook_pixel_access_token: string;
    facebook_pixel_test_event_code: string;

    tiktok_pixel_enabled: boolean;
    tiktok_pixel_id: string;
    tiktok_access_token: string;
    tiktok_test_event_code: string;

    andromeda_enabled: boolean;
    andromeda_tracking_id: string;
    andromeda_endpoint_url: string;
    andromeda_api_key: string;
};

interface IntegrationSettingsProps {
    settings: Partial<Record<keyof IntegrationForm, string | null>>;
}

type FieldConfig = {
    key: Exclude<keyof IntegrationForm, `${string}_enabled`>;
    label: string;
    placeholder: string;
    hint: string;
    type?: 'text' | 'url' | 'password';
};

type SectionConfig = {
    title: string;
    description: string;
    enabledKey: Extract<keyof IntegrationForm, `${string}_enabled`>;
    fields: FieldConfig[];
    extraToggle?: {
        key: Extract<keyof IntegrationForm, `${string}_enabled`>;
        label: string;
    };
};

const sections: SectionConfig[] = [
    {
        title: 'Google Search Console',
        description: 'Verification du domaine et propriete Search Console.',
        enabledKey: 'google_search_console_enabled',
        fields: [
            {
                key: 'google_search_console_verification_token',
                label: 'Verification token',
                placeholder: 'google-site-verification=xxxxxxxx',
                hint: 'Meta verification token fourni par Google Search Console.',
            },
            {
                key: 'google_search_console_property_url',
                label: 'Property URL',
                placeholder: 'https://www.votresite.com/',
                hint: 'URL de la propriete verifiee.',
                type: 'url',
            },
        ],
    },
    {
        title: 'Google Site Kit',
        description: 'Configuration OAuth/API pour le connecteur Site Kit.',
        enabledKey: 'google_site_kit_enabled',
        fields: [
            {
                key: 'google_site_kit_client_id',
                label: 'Client ID',
                placeholder: 'xxxxxxxx.apps.googleusercontent.com',
                hint: 'Client ID OAuth Google Cloud.',
            },
            {
                key: 'google_site_kit_client_secret',
                label: 'Client secret',
                placeholder: 'GOCSPX-xxxxxxxx',
                hint: 'Client secret OAuth.',
                type: 'password',
            },
            {
                key: 'google_site_kit_redirect_uri',
                label: 'Redirect URI',
                placeholder: 'https://www.votresite.com/auth/google/callback',
                hint: 'URI de redirection autorisee dans Google Cloud.',
                type: 'url',
            },
            {
                key: 'google_site_kit_property_id',
                label: 'Property ID',
                placeholder: 'sc-domain:example.com ou UA/GA4 property id',
                hint: 'Identifiant de la propriete liee.',
            },
        ],
    },
    {
        title: 'Google AdSense',
        description: 'Monetisation AdSense globale et emplacements.',
        enabledKey: 'google_adsense_enabled',
        extraToggle: {
            key: 'google_adsense_auto_ads_enabled',
            label: 'Activer Auto Ads',
        },
        fields: [
            {
                key: 'google_adsense_client_id',
                label: 'Client ID',
                placeholder: 'ca-pub-XXXXXXXXXXXXXXXX',
                hint: 'Client publisher ID AdSense.',
            },
            {
                key: 'google_adsense_slot_id',
                label: 'Slot ID par defaut',
                placeholder: '1234567890',
                hint: 'Slot utilise si aucun slot specifique n est defini.',
            },
        ],
    },
    {
        title: 'Facebook Pixel',
        description: 'Tracking events Meta Browser + Conversion API.',
        enabledKey: 'facebook_pixel_enabled',
        fields: [
            {
                key: 'facebook_pixel_id',
                label: 'Pixel ID',
                placeholder: '123456789012345',
                hint: 'Identifiant du pixel Meta.',
            },
            {
                key: 'facebook_pixel_access_token',
                label: 'Access token CAPI',
                placeholder: 'EAAG... ou token system user',
                hint: 'Token pour envoyer les events server-side (optionnel).',
                type: 'password',
            },
            {
                key: 'facebook_pixel_test_event_code',
                label: 'Test event code',
                placeholder: 'TEST12345',
                hint: 'Code de test pour Events Manager (optionnel).',
            },
        ],
    },
    {
        title: 'TikTok Pixel',
        description: 'Tracking TikTok Pixel et Events API.',
        enabledKey: 'tiktok_pixel_enabled',
        fields: [
            {
                key: 'tiktok_pixel_id',
                label: 'Pixel ID',
                placeholder: 'C123ABC456DEF789',
                hint: 'Identifiant du TikTok Pixel.',
            },
            {
                key: 'tiktok_access_token',
                label: 'Access token',
                placeholder: 'tt_live_xxxxxxxx',
                hint: 'Token Events API TikTok (optionnel).',
                type: 'password',
            },
            {
                key: 'tiktok_test_event_code',
                label: 'Test event code',
                placeholder: 'TESTEVENT123',
                hint: 'Code de test pour Event Manager TikTok (optionnel).',
            },
        ],
    },
    {
        title: 'Andromeda',
        description: 'Tracking externe et endpoint de collecte.',
        enabledKey: 'andromeda_enabled',
        fields: [
            {
                key: 'andromeda_tracking_id',
                label: 'Tracking ID',
                placeholder: 'andromeda-trk-xxxx',
                hint: 'Identifiant principal du tenant/projet.',
            },
            {
                key: 'andromeda_endpoint_url',
                label: 'Endpoint URL',
                placeholder: 'https://api.andromeda.io/collect',
                hint: 'Endpoint de collecte.',
                type: 'url',
            },
            {
                key: 'andromeda_api_key',
                label: 'API key',
                placeholder: 'andr_live_xxxxxxxx',
                hint: 'Cle d API privee si requise.',
                type: 'password',
            },
        ],
    },
];

const asBool = (value?: string | null) => value === '1' || value === 'true';

export default function Integrations({ settings }: IntegrationSettingsProps) {
    const { data, setData, put, processing, errors, recentlySuccessful, isDirty } = useForm<IntegrationForm>({
        google_search_console_enabled: asBool(settings.google_search_console_enabled),
        google_search_console_verification_token: settings.google_search_console_verification_token ?? '',
        google_search_console_property_url: settings.google_search_console_property_url ?? '',

        google_site_kit_enabled: asBool(settings.google_site_kit_enabled),
        google_site_kit_client_id: settings.google_site_kit_client_id ?? '',
        google_site_kit_client_secret: settings.google_site_kit_client_secret ?? '',
        google_site_kit_redirect_uri: settings.google_site_kit_redirect_uri ?? '',
        google_site_kit_property_id: settings.google_site_kit_property_id ?? '',

        google_adsense_enabled: asBool(settings.google_adsense_enabled),
        google_adsense_client_id: settings.google_adsense_client_id ?? '',
        google_adsense_slot_id: settings.google_adsense_slot_id ?? '',
        google_adsense_auto_ads_enabled: asBool(settings.google_adsense_auto_ads_enabled),

        facebook_pixel_enabled: asBool(settings.facebook_pixel_enabled),
        facebook_pixel_id: settings.facebook_pixel_id ?? '',
        facebook_pixel_access_token: settings.facebook_pixel_access_token ?? '',
        facebook_pixel_test_event_code: settings.facebook_pixel_test_event_code ?? '',

        tiktok_pixel_enabled: asBool(settings.tiktok_pixel_enabled),
        tiktok_pixel_id: settings.tiktok_pixel_id ?? '',
        tiktok_access_token: settings.tiktok_access_token ?? '',
        tiktok_test_event_code: settings.tiktok_test_event_code ?? '',

        andromeda_enabled: asBool(settings.andromeda_enabled),
        andromeda_tracking_id: settings.andromeda_tracking_id ?? '',
        andromeda_endpoint_url: settings.andromeda_endpoint_url ?? '',
        andromeda_api_key: settings.andromeda_api_key ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.settings.integrations.update'));
    };

    return (
        <DashboardLayout title="Integrations tracking">
            <Head title="Integrations tracking" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Configuration"
                    title="Integrations tracking & monetisation"
                    subtitle="Configuration complete inspiree des parametres courants: Search Console, Site Kit, AdSense, Facebook Pixel, TikTok Pixel et Andromeda."
                    icon={<Settings2 className="h-6 w-6" />}
                    actions={
                        <>
                            <AdminLinkButton href={route('dashboard')} variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                                Retour
                            </AdminLinkButton>
                            <AdminButton type="submit" form="integrations-form" disabled={processing || !isDirty} icon={<Save className="h-4 w-4" />}>
                                Sauvegarder
                            </AdminButton>
                        </>
                    }
                />

                <AdminCard padded>
                    <form id="integrations-form" onSubmit={submit} className="space-y-5">
                        {sections.map((section) => {
                            const enabled = data[section.enabledKey];

                            return (
                                <div key={section.title} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-heading text-lg font-black tracking-tight text-gray-900 dark:text-white">{section.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-white/50">{section.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={enabled}
                                                    onChange={(e) => setData(section.enabledKey, e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                Activer
                                            </label>

                                            {section.extraToggle && (
                                                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={data[section.extraToggle.key]}
                                                        onChange={(e) => setData(section.extraToggle!.key, e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    {section.extraToggle.label}
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        {section.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type ?? 'text'}
                                                    value={data[field.key]}
                                                    onChange={(e) => setData(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                />
                                                <p className="mt-1 text-xs text-gray-500 dark:text-white/50">{field.hint}</p>
                                                <InputError message={errors[field.key]} className="mt-1" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {recentlySuccessful && (
                            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                                Configuration enregistree.
                            </div>
                        )}
                    </form>
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}