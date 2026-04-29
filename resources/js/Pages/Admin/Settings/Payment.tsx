import CloudinaryUpload from '@/Components/CloudinaryUpload';
import InputError from '@/Components/InputError';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Plus, Save, Trash2, Image as ImageIcon } from 'lucide-react';

interface GatewayConfig {
    key: string;
    label: string;
    value: string;
    type?: string;
}

interface Gateway {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    logo?: string;
    config: GatewayConfig[];
}

interface SettingsProps {
    gateways: Gateway[];
}

export default function Payment({ gateways }: SettingsProps) {
    return (
        <DashboardLayout title="Moyens de paiement">
            <Head title="Moyens de paiement" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Moyens de paiement"
                    subtitle="Gerez MTN MoMo, Flooz, Kkiapay, Fedapay et Qosic avec la meme UI que les pages Articles."
                    icon={<CreditCard className="h-6 w-6" />}
                    meta={`${gateways.length} methode${gateways.length > 1 ? 's' : ''}`}
                    actions={
                        <AdminLinkButton href={route('dashboard.settings.payment.create')} icon={<Plus className="h-4 w-4" />}>
                            Nouvelle methode
                        </AdminLinkButton>
                    }
                />

                <div className="grid gap-4">
                    {gateways.map((gateway) => (
                        <GatewayCard key={gateway.id} gateway={gateway} />
                    ))}

                    {gateways.length === 0 && (
                        <AdminCard padded>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Aucune methode disponible.</p>
                        </AdminCard>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function GatewayCard({ gateway }: { gateway: Gateway }) {
    const form = useForm({
        name: gateway.name,
        is_active: gateway.is_active,
        logo: gateway.logo || '',
        config: gateway.config || [],
    });

    const updateConfigValue = (key: string, value: string) => {
        form.setData('config', form.data.config.map((item) => (item.key === key ? { ...item, value } : item)));
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(route('dashboard.settings.payment.update', gateway.id), {
            preserveScroll: true,
        });
    };

    const remove = () => {
        if (confirm('Supprimer cette methode de paiement ?')) {
            router.delete(route('dashboard.settings.payment.destroy', gateway.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminCard padded>
            <form onSubmit={submit} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{gateway.slug}</p>
                        <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{gateway.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] dark:border-white/10">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="h-4 w-4"
                            />
                            Actif
                        </label>
                        <AdminButton type="button" variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={remove}>
                            Supprimer
                        </AdminButton>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Nom</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                        />
                        <InputError message={form.errors.name} className="mt-1" />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Logo (glisser-deposer)</label>
                        <CloudinaryUpload
                            onUpload={(url) => form.setData('logo', url)}
                            defaultImage={String(form.data.logo || '') || undefined}
                            label=""
                            className="w-full"
                        />
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-white/60">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Upload drag & drop active
                        </div>
                        <InputError message={form.errors.logo as string} className="mt-1" />
                    </div>
                </div>

                {form.data.config.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {form.data.config.map((field) => (
                            <div key={`${gateway.slug}-${field.key}`}>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={field.value || ''}
                                        onChange={(e) => updateConfigValue(field.key, e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'password' ? 'password' : 'text'}
                                        value={field.value || ''}
                                        onChange={(e) => updateConfigValue(field.key, e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end">
                    <AdminButton type="submit" disabled={form.processing} icon={<Save className="h-4 w-4" />}>
                        Sauvegarder
                    </AdminButton>
                </div>
            </form>
        </AdminCard>
    );
}
