import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Check, Plus, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import CloudinaryUpload from '@/Components/CloudinaryUpload';
import Notifications from '@/Components/Notifications';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        question: string;
        is_active: boolean;
        expires_at: string;
        image: string;
        options: { label: string }[];
    }>({
        question: '',
        is_active: true,
        expires_at: '',
        image: '',
        options: [{ label: '' }, { label: '' }],
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
        next[index] = { label: value };
        setData('options', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.polls.store'));
    };

    return (
        <DashboardLayout title="Nouveau sondage">
            <Head title="Nouveau sondage" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Création"
                    title="Nouveau sondage"
                    subtitle="Composez une question et ses options pour lancer une consultation éclair."
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
                                            placeholder="Ex: Quel sujet vous intéresse le plus ?"
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
                                            defaultImage={data.image}
                                            label=""
                                            className="w-full"
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
                                                    key={index}
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
                                                    {data.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {(errors as any).options && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {(errors as any).options}
                                            </p>
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
                                        <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                                            Laisser vide pour aucune expiration.
                                        </p>
                                        {errors.expires_at && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.expires_at}
                                            </p>
                                        )}
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

                    <div className="flex justify-end gap-2">
                        <AdminLinkButton
                            href={route('dashboard.polls.index')}
                            variant="ghost"
                        >
                            Annuler
                        </AdminLinkButton>
                        <AdminButton
                            type="submit"
                            variant="primary"
                            disabled={processing}
                            icon={<Check className="h-4 w-4" />}
                        >
                            Créer le sondage
                        </AdminButton>
                    </div>
                </form>
            </div>

            <Notifications />
        </DashboardLayout>
    );
}
