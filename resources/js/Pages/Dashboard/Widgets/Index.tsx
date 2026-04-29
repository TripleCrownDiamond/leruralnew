import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminCard from '@/Components/Dashboard/AdminCard';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { LayoutPanelTop, Save } from 'lucide-react';

interface WidgetSettings {
    widget_show_announcements?: string | null;
    widget_show_market_prices?: string | null;
    widget_show_webtv?: string | null;
    widget_show_partners?: string | null;
    widget_show_socials?: string | null;
    widget_show_sidebar_ads?: string | null;
    widget_show_newsletter?: string | null;
    dashboard_hero_title?: string | null;
    dashboard_hero_subtitle?: string | null;
    dashboard_quick_actions_title?: string | null;
    dashboard_agenda_title?: string | null;
    dashboard_empty_chart_title?: string | null;
    dashboard_empty_chart_subtitle?: string | null;
    dashboard_empty_chart_text?: string | null;
}

const items = [
    { key: 'widget_show_announcements', label: "Fil d'annonces", description: 'Bandeau sticky sous les rubriques.' },
    { key: 'widget_show_market_prices', label: 'Cours du marche', description: 'Bloc sidebar prix du marche.' },
    { key: 'widget_show_webtv', label: 'Web TV', description: 'Section Web TV et cartes video.' },
    { key: 'widget_show_partners', label: 'Partenaires', description: 'Rail de logos partenaires.' },
    { key: 'widget_show_socials', label: 'Reseaux sociaux', description: 'Section sociale sur la home.' },
    { key: 'widget_show_sidebar_ads', label: 'Espaces pub', description: 'Tous les slots publicitaires.' },
    { key: 'widget_show_newsletter', label: 'Newsletter', description: 'Bloc newsletter dans la sidebar.' },
] as const;

type WidgetKey = (typeof items)[number]['key'];

export default function Index({ settings }: { settings: WidgetSettings }) {
    const form = useForm({
        widget_show_announcements: settings.widget_show_announcements !== '0',
        widget_show_market_prices: settings.widget_show_market_prices !== '0',
        widget_show_webtv: settings.widget_show_webtv !== '0',
        widget_show_partners: settings.widget_show_partners !== '0',
        widget_show_socials: settings.widget_show_socials !== '0',
        widget_show_sidebar_ads: settings.widget_show_sidebar_ads !== '0',
        widget_show_newsletter: settings.widget_show_newsletter !== '0',
        dashboard_hero_title: settings.dashboard_hero_title ?? '',
        dashboard_hero_subtitle: settings.dashboard_hero_subtitle ?? '',
        dashboard_quick_actions_title: settings.dashboard_quick_actions_title ?? '',
        dashboard_agenda_title: settings.dashboard_agenda_title ?? '',
        dashboard_empty_chart_title: settings.dashboard_empty_chart_title ?? '',
        dashboard_empty_chart_subtitle: settings.dashboard_empty_chart_subtitle ?? '',
        dashboard_empty_chart_text: settings.dashboard_empty_chart_text ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('dashboard.widgets.store'), { preserveScroll: true });
    };

    const enabledCount = items.filter((item) => form.data[item.key as WidgetKey]).length;

    return (
        <DashboardLayout title="Widgets">
            <Head title="Widgets" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Modules dynamiques"
                    title="Widgets"
                    subtitle="Activez les sections publiques et personnalisez le contenu du dashboard depuis l'admin. Les elements d'agenda se gerent dans le menu Agenda."
                    icon={<LayoutPanelTop className="h-6 w-6" />}
                    meta={`${enabledCount}/${items.length} actifs`}
                    actions={
                        <AdminButton type="submit" form="widgets-form" disabled={form.processing} icon={<Save className="h-4 w-4" />}>
                            Enregistrer
                        </AdminButton>
                    }
                />

                <form id="widgets-form" onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="grid gap-4 md:grid-cols-2">
                            {items.map((item) => (
                                <label
                                    key={item.key}
                                    className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/40 dark:border-white/10 dark:bg-gray-900"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                        </div>
                                        <span className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition-colors ${form.data[item.key] ? 'bg-primary' : 'bg-gray-300 dark:bg-white/15'}`}>
                                            <span className={`h-5 w-5 rounded-full bg-white transition-transform ${form.data[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={form.data[item.key]}
                                        onChange={(event) => form.setData(item.key, event.target.checked)}
                                        className="sr-only"
                                    />
                                </label>
                            ))}
                        </div>

                        <AdminCard padded className="lg:sticky lg:top-6 lg:self-start">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Etat public</p>
                            <div className="mt-5 space-y-3">
                                {items.map((item) => (
                                    <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 dark:border-white/10">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${form.data[item.key] ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60'}`}>
                                            {form.data[item.key] ? 'Visible' : 'Masque'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </AdminCard>
                    </div>

                    <AdminCard padded>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Contenu dashboard</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field label="Titre hero" value={form.data.dashboard_hero_title} onChange={(v) => form.setData('dashboard_hero_title', v)} />
                            <Field label="Titre actions rapides" value={form.data.dashboard_quick_actions_title} onChange={(v) => form.setData('dashboard_quick_actions_title', v)} />
                            <Field label="Titre agenda" value={form.data.dashboard_agenda_title} onChange={(v) => form.setData('dashboard_agenda_title', v)} />
                            <Field label="Titre bloc vide" value={form.data.dashboard_empty_chart_title} onChange={(v) => form.setData('dashboard_empty_chart_title', v)} />
                            <Field label="Sous-titre bloc vide" value={form.data.dashboard_empty_chart_subtitle} onChange={(v) => form.setData('dashboard_empty_chart_subtitle', v)} />
                        </div>
                        <div className="mt-4">
                            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Sous-titre hero</label>
                            <textarea value={form.data.dashboard_hero_subtitle} onChange={(e) => form.setData('dashboard_hero_subtitle', e.target.value)} rows={3} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                        </div>
                        <div className="mt-4">
                            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Texte bloc vide</label>
                            <textarea value={form.data.dashboard_empty_chart_text} onChange={(e) => form.setData('dashboard_empty_chart_text', e.target.value)} rows={3} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                        </div>
                    </AdminCard>
                </form>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
        </div>
    );
}