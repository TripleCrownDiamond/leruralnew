import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

interface Props {
    settings: {
        floating_whatsapp_enabled?: string | null;
        floating_whatsapp_number?: string | null;
        floating_whatsapp_message?: string | null;
    };
}

export default function WhatsAppSettings({ settings }: Props) {
    const form = useForm({
        floating_whatsapp_enabled: settings.floating_whatsapp_enabled === '1',
        floating_whatsapp_number: settings.floating_whatsapp_number ?? '',
        floating_whatsapp_message: settings.floating_whatsapp_message ?? 'Bonjour LE RURAL, je souhaite plus d\'informations.',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(route('dashboard.settings.whatsapp.update'));
    };

    return (
        <DashboardLayout title="WhatsApp flottant">
            <Head title="WhatsApp flottant" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Configuration"
                    title="WhatsApp flottant"
                    subtitle="Configurez le bouton WhatsApp visible en bas des pages publiques."
                    icon={<MessageCircle className="h-6 w-6" />}
                />

                <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                            <input
                                type="checkbox"
                                checked={form.data.floating_whatsapp_enabled}
                                onChange={(e) => form.setData('floating_whatsapp_enabled', e.target.checked)}
                            />
                            Activer le bouton WhatsApp flottant
                        </label>

                        <div>
                            <label className="mb-1 block text-sm font-semibold">Numero WhatsApp (format international)</label>
                            <input
                                value={form.data.floating_whatsapp_number}
                                onChange={(e) => form.setData('floating_whatsapp_number', e.target.value)}
                                placeholder="22997000000"
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                            />
                            {form.errors.floating_whatsapp_number && <p className="mt-1 text-xs text-red-500">{form.errors.floating_whatsapp_number}</p>}
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="mb-1 block text-sm font-semibold">Message pre-rempli</label>
                        <textarea
                            rows={3}
                            value={form.data.floating_whatsapp_message}
                            onChange={(e) => form.setData('floating_whatsapp_message', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                        />
                        {form.errors.floating_whatsapp_message && <p className="mt-1 text-xs text-red-500">{form.errors.floating_whatsapp_message}</p>}
                    </div>

                    <div className="mt-6">
                        <AdminButton type="submit" disabled={form.processing}>Enregistrer</AdminButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
