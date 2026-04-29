import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import InputError from '@/Components/InputError';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Radio, Pencil, Plus, Trash2 } from 'lucide-react';

interface LiveStream {
    id: number;
    platform: 'tiktok' | 'youtube' | 'twitch';
    title: string;
    stream_url: string;
    embed_url: string | null;
    sort_order: number;
    is_active: boolean;
}

const emptyForm = {
    platform: 'youtube' as 'tiktok' | 'youtube' | 'twitch',
    title: '',
    stream_url: '',
    embed_url: '',
    sort_order: 0,
    is_active: true,
};

export default function Index({ liveStreams }: { liveStreams: LiveStream[] }) {
    const form = useForm({ ...(emptyForm as any), id: null as number | null });
    const isEditing = Boolean(form.data.id);

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.setData({ ...(emptyForm as any), id: null });
    };

    const startEdit = (stream: LiveStream) => {
        form.setData({
            id: stream.id,
            platform: stream.platform,
            title: stream.title,
            stream_url: stream.stream_url,
            embed_url: stream.embed_url ?? '',
            sort_order: stream.sort_order,
            is_active: stream.is_active,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(route('dashboard.live-streams.update', form.data.id), {
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.post(route('dashboard.live-streams.store'), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    return (
        <DashboardLayout title="Lives">
            <Head title="Lives" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Diffusion"
                    title="Lives TikTok / YouTube / Twitch"
                    subtitle="Ajoutez les lives a mettre en avant sur la page d'accueil."
                    icon={<Radio className="h-6 w-6" />}
                    meta={`${liveStreams.length} live${liveStreams.length > 1 ? 's' : ''}`}
                />

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            {isEditing ? 'Modifier le live' : 'Nouveau live'}
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Plateforme</label>
                                <select
                                    value={form.data.platform}
                                    onChange={(e) => form.setData('platform', e.target.value as any)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                >
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="twitch">Twitch</option>
                                </select>
                                <InputError message={form.errors.platform} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Titre</label>
                                <input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.title} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">URL du live</label>
                                <input
                                    value={form.data.stream_url}
                                    onChange={(e) => form.setData('stream_url', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.stream_url} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">URL embed (optionnel)</label>
                                <input
                                    value={form.data.embed_url}
                                    onChange={(e) => form.setData('embed_url', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.embed_url} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Ordre</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(e) => form.setData('sort_order', Number(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.sort_order} className="mt-1" />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                />
                                Live actif
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <AdminButton type="submit" icon={<Plus className="h-4 w-4" />} disabled={form.processing}>
                                {isEditing ? 'Mettre a jour' : 'Ajouter'}
                            </AdminButton>
                            {isEditing && (
                                <AdminButton type="button" variant="secondary" onClick={resetForm}>
                                    Annuler
                                </AdminButton>
                            )}
                        </div>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2">
                        {liveStreams.map((stream) => (
                            <article key={stream.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{stream.platform}</div>
                                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{stream.title}</h3>
                                <a href={stream.stream_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-primary hover:underline">Ouvrir le live</a>
                                <div className="mt-2 text-xs text-gray-500">Ordre: {stream.sort_order}</div>
                                <div className="mt-1 text-xs text-gray-500">{stream.is_active ? 'Actif' : 'Inactif'}</div>
                                <div className="mt-4 flex gap-2">
                                    <AdminButton type="button" variant="secondary" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => startEdit(stream)}>
                                        Modifier
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        onClick={() => {
                                            if (confirm('Supprimer ce live ?')) {
                                                router.delete(route('dashboard.live-streams.destroy', stream.id), { preserveScroll: true });
                                            }
                                        }}
                                    >
                                        Supprimer
                                    </AdminButton>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
