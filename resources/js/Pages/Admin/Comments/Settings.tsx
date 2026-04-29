import AdminCard, { AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import Notifications from '@/Components/Notifications';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Plus, Save, Settings2, Shield, Sparkles, X } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useMemo, useState } from 'react';

interface Props {
    autoApprove: boolean;
    redFlags: string[];
}

export default function Settings({ autoApprove, redFlags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        auto_approve: autoApprove,
        red_flags: redFlags,
    });

    const [newRedFlag, setNewRedFlag] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('dashboard.comments.update-auto-moderation'), {
            preserveScroll: true,
        });
    };

    const addRedFlag = () => {
        const value = newRedFlag.trim().toLowerCase();
        if (!value) return;

        if (data.red_flags.includes(value)) {
            setNewRedFlag('');
            return;
        }

        setData('red_flags', [...data.red_flags, value]);
        setNewRedFlag('');
    };

    const removeRedFlag = (index: number) => {
        setData('red_flags', data.red_flags.filter((_, i) => i !== index));
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addRedFlag();
        }
    };

    const moderationLabel = data.auto_approve ? 'Automatique' : 'Manuelle';

    const sampleWords = useMemo(
        () => ['spam', 'arnaque', 'menace', 'insulte', 'publicite'],
        [],
    );

    return (
        <DashboardLayout title="Parametres commentaires">
            <Head title="Parametres commentaires" />

            <form onSubmit={submit} className="space-y-6">
                <AdminPageHeader
                    eyebrow="Moderation"
                    title="Parametres commentaires"
                    subtitle="Pilotez l'approbation auto et la liste des red flags avec la meme UI que les autres modules admin."
                    icon={<Settings2 className="h-6 w-6" />}
                    meta={`${data.red_flags.length} red flag(s)`}
                    actions={
                        <>
                            <AdminLinkButton
                                href={route('dashboard.comments.index')}
                                variant="secondary"
                                size="sm"
                                icon={<ArrowLeft className="h-3.5 w-3.5" />}
                            >
                                Retour
                            </AdminLinkButton>
                            <AdminButton
                                type="submit"
                                variant="primary"
                                size="sm"
                                icon={<Save className="h-3.5 w-3.5" />}
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer'}
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <AdminCard padded>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Mode</p>
                                    <h3 className="mt-1 text-lg font-black uppercase tracking-[0.04em] text-gray-900 dark:text-white">Approbation des commentaires</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-white/60">
                                        Activez pour publier directement les commentaires propres. Sinon chaque commentaire reste en attente.
                                    </p>
                                </div>
                                <AdminStatusPill tone={data.auto_approve ? 'success' : 'warning'}>{moderationLabel}</AdminStatusPill>
                            </div>

                            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <Checkbox
                                        name="auto_approve"
                                        checked={data.auto_approve}
                                        onChange={(event) => setData('auto_approve', event.target.checked)}
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">Activer l'approbation automatique</span>
                                        <span className="mt-1 block text-xs text-gray-500 dark:text-white/60">
                                            Les red flags restent controles. Les commentaires detectes restent signales.
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <InputError message={errors.auto_approve as string | undefined} className="mt-2" />
                        </AdminCard>

                        <AdminCard padded>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Filtrage</p>
                                    <h3 className="mt-1 text-lg font-black uppercase tracking-[0.04em] text-gray-900 dark:text-white">Red flags</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-white/60">
                                        Ajoutez les mots a surveiller. Un commentaire contenant ces termes sera marque pour moderation.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-2 text-amber-700 ring-1 ring-inset ring-amber-300/50 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {data.red_flags.length > 0 ? (
                                    data.red_flags.map((word, index) => (
                                        <span
                                            key={`${word}-${index}`}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-red-300/70 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                                        >
                                            {word}
                                            <button
                                                type="button"
                                                onClick={() => removeRedFlag(index)}
                                                className="rounded-full p-0.5 text-red-500 transition hover:bg-red-200/50 hover:text-red-700 dark:hover:bg-red-500/20 dark:hover:text-red-200"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-white/60">Aucun red flag actif.</p>
                                )}
                            </div>

                            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                <input
                                    value={newRedFlag}
                                    onChange={(event) => setNewRedFlag(event.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Ajouter un mot ou une expression"
                                    className="h-11 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                                />
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    icon={<Plus className="h-4 w-4" />}
                                    disabled={!newRedFlag.trim()}
                                    onClick={addRedFlag}
                                >
                                    Ajouter
                                </AdminButton>
                            </div>
                            <InputError message={errors.red_flags as string | undefined} className="mt-2" />

                            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Exemples rapides</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {sampleWords.map((word) => (
                                        <button
                                            key={word}
                                            type="button"
                                            onClick={() => {
                                                if (!data.red_flags.includes(word)) {
                                                    setData('red_flags', [...data.red_flags, word]);
                                                }
                                            }}
                                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-600 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </AdminCard>
                    </div>

                    <div className="space-y-6">
                        <AdminCard padded>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Etat actuel</h3>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-white/60">Moderation</span>
                                    <AdminStatusPill tone={data.auto_approve ? 'success' : 'warning'}>{moderationLabel}</AdminStatusPill>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-white/60">Red flags</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{data.red_flags.length}</span>
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard padded>
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-primary/10 p-2 text-primary ring-1 ring-inset ring-primary/25">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.14em] text-gray-900 dark:text-white">Recommandations</h3>
                                    <ul className="mt-2 space-y-2 text-sm text-gray-500 dark:text-white/60">
                                        <li>Gardez une liste courte et precise.</li>
                                        <li>Evitez les mots trop generiques.</li>
                                        <li>Revisez les red flags chaque semaine.</li>
                                    </ul>
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard padded>
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="h-4 w-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.14em]">Astuce</p>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-white/65">
                                Tu peux desactiver l'approbation auto pendant les periodes sensibles puis la reactiver quand la moderation est stable.
                            </p>
                        </AdminCard>
                    </div>
                </div>
            </form>

            <Notifications />
        </DashboardLayout>
    );
}
