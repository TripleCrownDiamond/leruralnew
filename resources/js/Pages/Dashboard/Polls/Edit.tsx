import CloudinaryUpload from '@/Components/CloudinaryUpload';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import Notifications from '@/Components/Notifications';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Check, Plus, Trash2 } from 'lucide-react';

interface PollOption {
    id?: number;
    label: string;
    votes?: number;
}

interface Poll {
    id: number;
    question: string;
    image?: string | null;
    is_active: boolean;
    expires_at: string | null;
    options: PollOption[];
}

export default function Edit({ poll }: { poll: Poll }) {
    const { data, setData, put, processing, errors } = useForm<{
        question: string;
        image: string;
        is_active: boolean;
        expires_at: string;
        options: PollOption[];
    }>({
        question: poll.question,
        image: poll.image ?? '',
        is_active: Boolean(poll.is_active),
        expires_at: poll.expires_at ?? '',
        options: poll.options ?? [],
    });

    const addOption = () => setData('options', [...data.options, { label: '' }]);

    const removeOption = (index: number) => {
        if (data.options.length <= 2) return;
        setData(
            'options',
            data.options.filter((_, i) => i !== index),
        );
    };

    const updateOption = (index: number, value: string) => {
        const next = [...data.options];
        next[index] = { ...next[index], label: value };
        setData('options', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dashboard.polls.update', poll.id));
    };

    const handleDelete = () => {
        if (confirm('Supprimer ce sondage ?')) {
            router.delete(route('dashboard.polls.destroy', poll.id));
        }
    };

    return (
        <DashboardLayout title={`Modifier · ${poll.question}`}>
            <Head title="Modifier le sondage" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Modification"
                    title={poll.question}
                    subtitle="Ajustez la question, l'image et les options du sondage."
                    icon={<BarChart3 className="h-6 w-6" />}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.polls.index')}
                            variant="secondary"
                            icon={<ArrowLeft className="h-4 w-4" />}
                        >
                            Retour
                        </AdminLinkButton>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Question & options
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Question
                                        </label>
                                        <input
                                            type="text"
                                            value={data.question}
                                            onChange={(e) => setData('question', e.target.value)}
                                            required
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-base font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        />
                                        {errors.question && (
                                            <p className="mt-1 text-xs text-red-600">{errors.question}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Image (optionnelle)
                                        </label>
                                        <CloudinaryUpload
                                            onUpload={(url) => setData('image', url)}
                                            defaultImage={data.image || undefined}
                                            label=""
                                        />
                                        {errors.image && (
                                            <p className="mt-1 text-xs text-red-600">{errors.image}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                                Options (minimum 2)
                                            </label>
                                            <AdminButton
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                icon={<Plus className="h-3.5 w-3.5" />}
                                                onClick={addOption}
                                            >
                                                Ajouter
                                            </AdminButton>
                                        </div>

                                        <div className="space-y-2">
                                            {data.options.map((option, index) => (
                                                <div
                                                    key={option.id ?? `new-${index}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="w-6 text-center font-mono text-xs text-gray-400 dark:text-white/40">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={option.label}
                                                        onChange={(e) => updateOption(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                        required
                                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                    />
                                                    {typeof option.votes === 'number' && (
                                                        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                            {option.votes} votes
                                                        </span>
                                                    )}
                                                    {data.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {(errors as any).options && (
                                            <p className="mt-1 text-xs text-red-600">{(errors as any).options}</p>
                                        )}
                                    </div>
                                </div>
                            </AdminCard>
                        </div>

                        <div className="space-y-6">
                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Configuration
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Date d'expiration
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:[color-scheme:dark]"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        Sondage actif
                                    </label>
                                </div>
                            </AdminCard>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse items-stretch justify-between gap-2 sm:flex-row sm:items-center">
                        <AdminButton type="button" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={handleDelete}>
                            Supprimer le sondage
                        </AdminButton>
                        <div className="flex justify-end gap-2">
                            <AdminLinkButton href={route('dashboard.polls.index')} variant="ghost">
                                Annuler
                            </AdminLinkButton>
                            <AdminButton type="submit" variant="primary" disabled={processing} icon={<Check className="h-4 w-4" />}>
                                Enregistrer
                            </AdminButton>
                        </div>
                    </div>
                </form>
            </div>

            <Notifications />
        </DashboardLayout>
    );
}