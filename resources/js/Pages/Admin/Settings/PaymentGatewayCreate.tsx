import InputError from '@/Components/InputError';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';

interface ConfigField {
    key: string;
    label: string;
    value: string;
    type?: string;
}

export default function PaymentGatewayCreate() {
    const form = useForm({
        name: '',
        slug: '',
        is_active: false,
        logo: '',
        config: [] as ConfigField[],
    });

    const [field, setField] = useState<ConfigField>({ key: '', label: '', value: '', type: 'text' });

    const addField = () => {
        if (!field.key || !field.label) return;
        form.setData('config', [...form.data.config, { ...field }]);
        setField({ key: '', label: '', value: '', type: 'text' });
    };

    const removeField = (idx: number) => {
        form.setData('config', form.data.config.filter((_, i) => i !== idx));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('dashboard.settings.payment.store'));
    };

    return (
        <DashboardLayout title="Nouvelle methode de paiement">
            <Head title="Nouvelle methode de paiement" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Nouvelle methode de paiement"
                    subtitle="Ajoutez une passerelle custom avec ses champs de configuration."
                    icon={<CreditCard className="h-6 w-6" />}
                    actions={
                        <div className="flex items-center gap-2">
                            <AdminLinkButton href={route('dashboard.settings.payment')} variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                                Retour
                            </AdminLinkButton>
                            <AdminButton type="submit" form="gateway-create-form" icon={<Save className="h-4 w-4" />}>
                                Creer
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard padded>
                    <form id="gateway-create-form" onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nom" error={form.errors.name}>
                                <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                            </Field>
                            <Field label="Slug" error={form.errors.slug}>
                                <input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                            </Field>
                        </div>

                        <Field label="Logo URL" error={form.errors.logo as string}>
                            <input value={form.data.logo} onChange={(e) => form.setData('logo', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                        </Field>

                        <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] dark:border-white/10">
                            <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="h-4 w-4" />
                            Activer
                        </label>

                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Champs config</p>
                            <div className="mt-4 grid gap-3 md:grid-cols-4">
                                <input placeholder="key" value={field.key} onChange={(e) => setField({ ...field, key: e.target.value })} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                                <input placeholder="label" value={field.label} onChange={(e) => setField({ ...field, label: e.target.value })} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950" />
                                <select value={field.type} onChange={(e) => setField({ ...field, type: e.target.value })} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-gray-950">
                                    <option value="text">Texte</option>
                                    <option value="password">Password</option>
                                    <option value="textarea">Textarea</option>
                                </select>
                                <AdminButton type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={addField}>
                                    Ajouter
                                </AdminButton>
                            </div>

                            {form.data.config.length > 0 && (
                                <div className="mt-4 grid gap-3">
                                    {form.data.config.map((cfg, idx) => (
                                        <div key={`${cfg.key}-${idx}`} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-white/10">
                                            <span>{cfg.label} ({cfg.key}) [{cfg.type || 'text'}]</span>
                                            <AdminButton type="button" variant="danger" size="sm" icon={<X className="h-4 w-4" />} onClick={() => removeField(idx)}>
                                                Retirer
                                            </AdminButton>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}
