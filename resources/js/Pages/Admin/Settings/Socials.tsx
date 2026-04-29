import SocialMediaSection from '@/Components/SocialMediaSection';
import InputError from '@/Components/InputError';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Share2 } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';

interface SocialSettingsProps {
    settings: {
        social_facebook_url?: string | null;
        social_x_url?: string | null;
        social_instagram_url?: string | null;
        social_tiktok_url?: string | null;
        social_whatsapp_url?: string | null;
        social_linkedin_url?: string | null;
    };
}

const fields = [
    {
        key: 'social_facebook_url',
        label: 'Facebook',
        placeholder: 'https://facebook.com/lerural',
        hint: 'Page officielle Facebook.',
    },
    {
        key: 'social_x_url',
        label: 'X / Twitter',
        placeholder: 'https://x.com/lerural',
        hint: 'Compte X pour les annonces rapides.',
    },
    {
        key: 'social_instagram_url',
        label: 'Instagram',
        placeholder: 'https://instagram.com/lerural',
        hint: 'Compte Instagram pour les visuels.',
    },
    {
        key: 'social_tiktok_url',
        label: 'TikTok',
        placeholder: 'https://www.tiktok.com/@lerural',
        hint: 'Compte TikTok pour les capsules video.',
    },
    {
        key: 'social_whatsapp_url',
        label: 'WhatsApp',
        placeholder: 'https://wa.me/229XXXXXXXX',
        hint: 'Canal WhatsApp pour les alertes rapides.',
    },
    {
        key: 'social_linkedin_url',
        label: 'LinkedIn',
        placeholder: 'https://www.linkedin.com/company/lerural',
        hint: 'Presence LinkedIn pour les partenaires et institutions.',
    },
] as const;

export default function Socials({ settings }: SocialSettingsProps) {
    const { data, setData, put, processing, errors, recentlySuccessful, isDirty } = useForm({
        social_facebook_url: settings.social_facebook_url ?? '',
        social_x_url: settings.social_x_url ?? '',
        social_instagram_url: settings.social_instagram_url ?? '',
        social_tiktok_url: settings.social_tiktok_url ?? '',
        social_whatsapp_url: settings.social_whatsapp_url ?? '',
        social_linkedin_url: settings.social_linkedin_url ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.settings.socials.update'));
    };

    return (
        <DashboardLayout title="Reseaux sociaux">
            <Head title="Reseaux sociaux" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Configuration"
                    title="Reseaux sociaux"
                    subtitle="Gerez les liens sociaux utilises sur home, footer et menu mobile dans le meme design que les pages Articles."
                    icon={<Share2 className="h-6 w-6" />}
                    actions={
                        <>
                            <AdminLinkButton
                                href={route('dashboard.static-pages.index')}
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour
                            </AdminLinkButton>
                            <AdminButton type="submit" form="socials-form" disabled={processing || !isDirty} icon={<Save className="h-4 w-4" />}>
                                Sauvegarder
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <AdminCard padded>
                        <form id="socials-form" onSubmit={submit} className="space-y-5">
                            {fields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        {field.label}
                                    </label>
                                    <input
                                        value={data[field.key]}
                                        onChange={(e) => setData(field.key, e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        placeholder={field.placeholder}
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">{field.hint}</p>
                                    <InputError message={errors[field.key]} className="mt-1" />
                                </div>
                            ))}

                            {recentlySuccessful && (
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                                    Configuration enregistree.
                                </div>
                            )}
                        </form>
                    </AdminCard>

                    <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                        <AdminCard className="p-4">
                            <SocialMediaSection settings={data} compact className="mb-0 md:mx-0" />
                        </AdminCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
