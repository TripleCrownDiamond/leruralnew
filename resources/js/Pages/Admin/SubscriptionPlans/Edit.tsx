import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Sparkles, Trash2 } from 'lucide-react';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';

interface Plan {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    duration_days: number;
    is_active: boolean;
    is_featured: boolean;
    features?: string[] | null;
}

export default function Edit({ plan }: { plan: Plan }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        name: plan.name ?? '',
        description: plan.description ?? '',
        price: plan.price,
        duration_days: plan.duration_days,
        is_active: Boolean(plan.is_active),
        is_featured: Boolean(plan.is_featured),
        features_text: (plan.features ?? []).filter((feature) => !['access_premium_articles', 'access_press_ecrite'].includes(feature)).join('\n'),
        access_premium_articles: (plan.features ?? []).includes('access_premium_articles') || (plan.features ?? []).length === 0,
        access_press_ecrite: (plan.features ?? []).includes('access_press_ecrite'),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        transform((payload) => ({
            name: payload.name,
            description: payload.description,
            price: payload.price,
            duration_days: payload.duration_days,
            is_active: payload.is_active,
            is_featured: payload.is_featured,
            features: Array.from(new Set([
                ...payload.features_text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                ...(payload.access_premium_articles ? ['access_premium_articles'] : []),
                ...(payload.access_press_ecrite ? ['access_press_ecrite'] : []),
            ])),
        }));

        put(route('dashboard.subscription-plans.update', plan.id));
    };

    const handleDelete = () => {
        if (!confirm('Supprimer ce plan ?')) return;

        router.delete(route('dashboard.subscription-plans.destroy', plan.id), {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout title={`Modifier ${plan.name}`}>
            <Head title={`Modifier ${plan.name}`} />

            <form onSubmit={submit} className="space-y-8">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Modifier le plan"
                    subtitle="Ajustez le prix, la duree et la visibilite dans la meme experience que les pages Articles." 
                    actions={
                        <>
                            <AdminLinkButton
                                href={route('dashboard.subscription-plans.index')}
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour a la liste
                            </AdminLinkButton>
                            <AdminButton
                                type="button"
                                variant="danger"
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={handleDelete}
                            >
                                Supprimer
                            </AdminButton>
                            <AdminButton
                                type="submit"
                                disabled={processing}
                                icon={<Check className="h-4 w-4" />}
                            >
                                Mettre a jour
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Editorial" title="Identite du plan" />

                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Nom du plan *
                                    </label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Avantages (1 ligne = 1 avantage)
                                    </label>
                                    <textarea
                                        rows={6}
                                        className="w-full rounded-2xl border border-gray-200 bg-[#fbfbf8] px-4 py-3 font-mono text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-gray-950 dark:text-gray-100"
                                        value={data.features_text}
                                        onChange={(e) => setData('features_text', e.target.value)}
                                    />
                                    {(errors.features_text || (errors as any).features) && <p className="mt-1 text-xs text-red-600">{errors.features_text || (errors as any).features}</p>}
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Droits d'acces</p>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={data.access_premium_articles}
                                                onChange={(e) => setData('access_premium_articles', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Acces articles premium</span>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={data.access_press_ecrite}
                                                onChange={(e) => setData('access_press_ecrite', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Acces aux parutions</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">
                            <SectionHeader eyebrow="Commerce" title="Tarification" />

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Prix (FCFA) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 pr-16 text-sm font-black tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                            value={data.price}
                                            onChange={(e) => setData('price', Number(e.target.value) || 0)}
                                            required
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                                            FCFA
                                        </span>
                                    </div>
                                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Duree (jours) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        value={data.duration_days}
                                        onChange={(e) => setData('duration_days', parseInt(e.target.value, 10) || 1)}
                                        required
                                    />
                                    {errors.duration_days && <p className="mt-1 text-xs text-red-600">{errors.duration_days}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">
                            <SectionHeader eyebrow="Publication" title="Visibilite" />

                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Plan actif</div>
                                        <div className="text-xs text-gray-500 dark:text-white/50">Disponible pour les nouveaux achats.</div>
                                    </div>
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Mettre en avant</div>
                                        <div className="text-xs text-gray-500 dark:text-white/50">Priorise le plan dans les comparatifs.</div>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-5 shadow-[0_18px_40px_-28px_rgba(47,106,17,0.28)] dark:border-primary/15 dark:from-primary/10 dark:to-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    Pensez a verifier le plan sur la page publique avant de valider la modification.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </DashboardLayout>
    );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-6 border-b border-gray-200 pb-4 dark:border-white/10">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</div>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</h2>
        </div>
    );
}
