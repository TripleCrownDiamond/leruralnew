import CloudinaryUpload from '@/Components/CloudinaryUpload';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Tv } from 'lucide-react';

export default function Create() {
    const form = useForm({
        name: '',
        description: '',
        image: null as File | null,
        image_url: '',
        playlist_url: '',
        is_active: true,
        order: 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('dashboard.emissions.store'));
    };

    return (
        <DashboardLayout title="Nouvelle emission">
            <Head title="Nouvelle emission" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Creation"
                    title="Nouvelle emission"
                    subtitle="Ajoutez une emission a la grille Web TV avec une source YouTube (video ou playlist)."
                    icon={<Tv className="h-6 w-6" />}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.emissions.index')}
                            variant="secondary"
                            icon={<ArrowLeft className="h-4 w-4" />}
                        >
                            Retour
                        </AdminLinkButton>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    <AdminCard padded>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Informations
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Journal rural"
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Lien YouTube (video ou playlist)
                                </label>
                                <input
                                    type="url"
                                    value={form.data.playlist_url}
                                    onChange={(e) => form.setData('playlist_url', e.target.value)}
                                    required
                                    placeholder="https://www.youtube.com/watch?v=... ou https://www.youtube.com/playlist?list=..."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                                {form.errors.playlist_url && (
                                    <p className="mt-1 text-xs text-red-600">{form.errors.playlist_url}</p>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <CloudinaryUpload
                                    label="Image de couverture"
                                    onUpload={(url) => {
                                        form.setData('image_url', url);
                                        form.setData('image', null);
                                    }}
                                    defaultImage={form.data.image_url || undefined}
                                />
                                <p className="text-xs text-gray-500 dark:text-white/60">
                                    Vous pouvez uploader ou choisir dans la mediatheque.
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Ordre d'affichage
                                </label>
                                <input
                                    type="number"
                                    value={form.data.order}
                                    onChange={(e) => form.setData('order', parseInt(e.target.value) || 0)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>
                            <label className="flex items-center gap-2 pt-7 text-sm font-bold text-gray-700 dark:text-white/80">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Emission active
                            </label>
                        </div>
                    </AdminCard>

                    <div className="flex justify-end gap-2">
                        <AdminLinkButton
                            href={route('dashboard.emissions.index')}
                            variant="ghost"
                        >
                            Annuler
                        </AdminLinkButton>
                        <AdminButton
                            type="submit"
                            variant="primary"
                            disabled={form.processing}
                            icon={<Check className="h-4 w-4" />}
                        >
                            Enregistrer
                        </AdminButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
