import InputError from '@/Components/InputError';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard from '@/Components/Dashboard/AdminCard';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { Globe, Save } from 'lucide-react';

interface FooterSettings {
    footer_description?: string | null;
    footer_copyright?: string | null;
    mobile_menu_description?: string | null;
    contact_address?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    footer_info_title?: string | null;
    footer_group_title?: string | null;
    footer_newsletter_title?: string | null;
    footer_newsletter_description?: string | null;
    footer_group_links?: string | null;
    mobile_menu_links_title?: string | null;
    footer_top_badge?: string | null;
    footer_top_tagline?: string | null;
    footer_brand_title?: string | null;
    footer_newsletter_placeholder?: string | null;
}

interface StaticPageFooter {
    id: number;
    title: string;
    slug: string;
    category: 'legal' | 'info' | 'other';
    is_published: boolean;
}

export default function Index({ settings, staticPages }: { settings: FooterSettings; staticPages: StaticPageFooter[] }) {
    const form = useForm({
        footer_description: settings.footer_description ?? '',
        footer_copyright: settings.footer_copyright ?? '',
        mobile_menu_description: settings.mobile_menu_description ?? '',
        contact_address: settings.contact_address ?? '',
        contact_phone: settings.contact_phone ?? '',
        contact_email: settings.contact_email ?? '',
        footer_info_title: settings.footer_info_title ?? '',
        footer_group_title: settings.footer_group_title ?? '',
        footer_newsletter_title: settings.footer_newsletter_title ?? '',
        footer_newsletter_description: settings.footer_newsletter_description ?? '',
        footer_group_links: settings.footer_group_links ?? '',
        mobile_menu_links_title: settings.mobile_menu_links_title ?? '',
        footer_top_badge: settings.footer_top_badge ?? '',
        footer_top_tagline: settings.footer_top_tagline ?? '',
        footer_brand_title: settings.footer_brand_title ?? '',
        footer_newsletter_placeholder: settings.footer_newsletter_placeholder ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('dashboard.footer.update'), { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Footer et menu mobile">
            <Head title="Footer et menu mobile" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Navigation publique"
                    title="Footer et menu mobile"
                    subtitle="Centralisez les textes de contact et les messages affiches dans le footer et le panneau mobile."
                    icon={<Globe className="h-6 w-6" />}
                    actions={
                        <AdminButton type="submit" form="footer-form" disabled={form.processing} icon={<Save className="h-4 w-4" />}>
                            Enregistrer
                        </AdminButton>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <AdminCard padded>
                        <form id="footer-form" onSubmit={submit} className="space-y-4">
                            <Field label="Description footer" error={form.errors.footer_description}>
                                <textarea
                                    rows={5}
                                    value={form.data.footer_description}
                                    onChange={(event) => form.setData('footer_description', event.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>

                            <Field label="Copyright" error={form.errors.footer_copyright}>
                                <input
                                    value={form.data.footer_copyright}
                                    onChange={(event) => form.setData('footer_copyright', event.target.value)}
                                    placeholder="2026 LE RURAL. Tous droits reserves."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>

                            <Field label="Texte menu mobile" error={form.errors.mobile_menu_description}>
                                <textarea
                                    rows={4}
                                    value={form.data.mobile_menu_description}
                                    onChange={(event) => form.setData('mobile_menu_description', event.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Adresse" error={form.errors.contact_address}>
                                    <input
                                        value={form.data.contact_address}
                                        onChange={(event) => form.setData('contact_address', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>

                                <Field label="Telephone" error={form.errors.contact_phone}>
                                    <input
                                        value={form.data.contact_phone}
                                        onChange={(event) => form.setData('contact_phone', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>
                            </div>

                            <Field label="Email" error={form.errors.contact_email}>
                                <input
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(event) => form.setData('contact_email', event.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Label marque (haut footer)" error={form.errors.footer_top_badge}>
                                    <input
                                        value={form.data.footer_top_badge}
                                        onChange={(event) => form.setData('footer_top_badge', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>

                                <Field label="Tagline marque (haut footer)" error={form.errors.footer_top_tagline}>
                                    <input
                                        value={form.data.footer_top_tagline}
                                        onChange={(event) => form.setData('footer_top_tagline', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Titre marque bloc principal" error={form.errors.footer_brand_title}>
                                    <input
                                        value={form.data.footer_brand_title}
                                        onChange={(event) => form.setData('footer_brand_title', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>

                                <Field label="Placeholder newsletter" error={form.errors.footer_newsletter_placeholder}>
                                    <input
                                        value={form.data.footer_newsletter_placeholder}
                                        onChange={(event) => form.setData('footer_newsletter_placeholder', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Titre infos footer" error={form.errors.footer_info_title}>
                                    <input
                                        value={form.data.footer_info_title}
                                        onChange={(event) => form.setData('footer_info_title', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>

                                <Field label="Titre liens footer" error={form.errors.footer_group_title}>
                                    <input
                                        value={form.data.footer_group_title}
                                        onChange={(event) => form.setData('footer_group_title', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Titre newsletter" error={form.errors.footer_newsletter_title}>
                                    <input
                                        value={form.data.footer_newsletter_title}
                                        onChange={(event) => form.setData('footer_newsletter_title', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>

                                <Field label="Titre liens menu mobile" error={form.errors.mobile_menu_links_title}>
                                    <input
                                        value={form.data.mobile_menu_links_title}
                                        onChange={(event) => form.setData('mobile_menu_links_title', event.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </Field>
                            </div>

                            <Field label="Description newsletter" error={form.errors.footer_newsletter_description}>
                                <textarea
                                    rows={3}
                                    value={form.data.footer_newsletter_description}
                                    onChange={(event) => form.setData('footer_newsletter_description', event.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>

                            <Field label="Liens footer/menu mobile (1 ligne = Label|URL)" error={form.errors.footer_group_links}>
                                <textarea
                                    rows={6}
                                    value={form.data.footer_group_links}
                                    onChange={(event) => form.setData('footer_group_links', event.target.value)}
                                    placeholder={"Entreprise|https://example.com/entreprise\nCarrieres|https://example.com/carrieres"}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                            </Field>
                        </form>
                    </AdminCard>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <AdminCard padded>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Apercu footer</p>
                            <div className="mt-5 rounded-3xl bg-gray-950 p-6 text-white">
                                <h3 className="text-2xl font-black uppercase tracking-tight">LE RURAL</h3>
                                <p className="mt-4 text-sm text-white/70">
                                    {form.data.footer_description || 'Ajoutez une description pour le footer.'}
                                </p>
                                <div className="mt-6 space-y-2 text-sm text-white/70">
                                    <p>{form.data.contact_address || 'Adresse non configuree'}</p>
                                    <p>{form.data.contact_phone || 'Telephone non configure'}</p>
                                    <p>{form.data.contact_email || 'Email non configure'}</p>
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard padded>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Apercu mobile</p>
                            <div className="mt-5 rounded-[2rem] border border-gray-200 bg-[linear-gradient(180deg,#0b140a_0%,#132613_100%)] p-6 text-white dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Infos</p>
                                <p className="mt-4 text-sm leading-relaxed text-white/75">
                                    {form.data.mobile_menu_description || 'Ajoutez un texte court pour le menu mobile.'}
                                </p>
                            </div>
                        </AdminCard>

                        <AdminCard padded>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Apercu liens footer</p>
                            <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-gray-950">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Titre infos</p>
                                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{form.data.footer_info_title || 'Informations'}</p>

                                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Titre liens</p>
                                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{form.data.footer_group_title || 'Le Groupe'}</p>

                                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Liens configures</p>
                                <div className="mt-2 space-y-2">
                                    {form.data.footer_group_links.trim() ? (
                                        form.data.footer_group_links.split('\n').filter(Boolean).map((line, idx) => (
                                            <p key={idx} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">{line}</p>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-white/60">Aucun lien configure.</p>
                                    )}
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard padded className="lg:col-span-2">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Apercu complet footer</p>
                            <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-gray-950">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{form.data.footer_top_badge || 'LE RURAL'} / {form.data.footer_top_tagline || 'Media agricole'}</p>
                                <p className="mt-2 font-semibold text-gray-900 dark:text-white">{form.data.footer_brand_title || 'LE RURAL'}</p>
                                <p className="mt-2 text-gray-600 dark:text-white/70">{form.data.footer_description || "1er groupe de presse agricole en Afrique de l'Ouest."}</p>
                                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Informations (pages legale/FAQ)</p>
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                    {staticPages.length > 0 ? staticPages.map((page) => (
                                        <span key={`preview-page-${page.id}`} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">{page.title}</span>
                                    )) : <span className="text-xs text-gray-500 dark:text-white/60">Aucune page statique publiee.</span>}
                                </div>
                                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Newsletter</p>
                                <p className="mt-1 text-xs text-gray-600 dark:text-white/70">{form.data.footer_newsletter_description || "Recevez l'essentiel de l'actualite agricole chaque matin."}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-white/60">Placeholder email: {form.data.footer_newsletter_placeholder || 'Votre email'}</p>
                            </div>
                        </AdminCard>

                        <AdminCard padded className="lg:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Pages statiques connectees</p>
                                <AdminLinkButton href={route('dashboard.static-pages.index')} variant="ghost" size="sm">
                                    Gerer
                                </AdminLinkButton>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {staticPages.length > 0 ? (
                                    staticPages.map((page) => (
                                        <a
                                            key={page.id}
                                            href={route('dashboard.static-pages.edit', page.id)}
                                            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition hover:border-primary/40 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                                        >
                                            <p className="font-semibold text-gray-900 dark:text-white">{page.title}</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-white/60">/pages/{page.slug}</p>
                                            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                                {page.category === 'legal' ? 'Legal' : page.category === 'info' ? 'Info' : 'Autre'} - {page.is_published ? 'Publiee' : 'Brouillon'}
                                            </p>
                                        </a>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
                                        Aucune page statique disponible.
                                    </div>
                                )}
                            </div>
                        </AdminCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}
