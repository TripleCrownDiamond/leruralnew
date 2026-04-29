import CloudinaryUpload from '@/Components/CloudinaryUpload';
import InputError from '@/Components/InputError';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { Button } from '@/Components/ui/button';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Handshake, Pencil, Plus, Trash2 } from 'lucide-react';

interface Partner {
    id: number;
    name: string;
    logo: string;
    url: string | null;
    order: number;
    is_active: boolean;
}

const emptyForm = {
    name: '',
    logo: '',
    url: '',
    order: 0,
    is_active: true,
};

export default function Index({ partners }: { partners: Partner[] }) {
    const form = useForm(emptyForm);
    const isEditing = typeof (form.data as any).id === 'number';

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.setData(emptyForm);
    };

    const startEdit = (partner: Partner) => {
        form.setData({
            ...(emptyForm as any),
            id: partner.id,
            name: partner.name,
            logo: partner.logo,
            url: partner.url ?? '',
            order: partner.order,
            is_active: partner.is_active,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            form.put(route('dashboard.partners.update', (form.data as any).id), {
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.post(route('dashboard.partners.store'), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    return (
        <DashboardLayout title="Partenaires">
            <Head title="Partenaires" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Reseau"
                    title="Partenaires"
                    subtitle="Pilotez les logos du rail partenaires et leur ordre d'apparition sur la home."
                    icon={<Handshake className="h-6 w-6" />}
                    meta={`${partners.length} fiche${partners.length > 1 ? 's' : ''}`}
                />

                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Edition</p>
                                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                    {isEditing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                                </h2>
                            </div>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={resetForm} className="rounded-full">
                                    Annuler
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Nom</label>
                                <input
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Nom du partenaire"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.name} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Logo</label>
                                <CloudinaryUpload key={`${form.data.name}-${form.data.logo || 'empty'}`} onUpload={(url) => form.setData('logo', url)} defaultImage={form.data.logo || undefined} />
                                <InputError message={form.errors.logo} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Lien</label>
                                <input
                                    type="url"
                                    value={form.data.url}
                                    onChange={(event) => form.setData('url', event.target.value)}
                                    placeholder="https://..."
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.url} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Ordre</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.order}
                                    onChange={(event) => form.setData('order', Number(event.target.value) || 0)}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.order} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary"
                                />
                                Afficher ce partenaire
                            </label>
                        </div>

                        <Button type="submit" disabled={form.processing} className="mt-6 w-full rounded-full text-xs font-black uppercase tracking-[0.18em]">
                            <Plus className="mr-2 h-4 w-4" />
                            {isEditing ? 'Mettre a jour' : 'Ajouter'}
                        </Button>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2">
                        {partners.length > 0 ? (
                            partners.map((partner) => (
                                <article key={partner.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                    <div className="flex h-28 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-6 dark:border-white/10 dark:bg-white/[0.04]">
                                        <img src={partner.logo} alt={partner.name} className="max-h-14 max-w-full object-contain" />
                                    </div>
                                    <div className="mt-5 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">Ordre {partner.order}</span>
                                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${partner.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60'}`}>
                                            {partner.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{partner.name}</h3>
                                    {partner.url && (
                                        <a href={partner.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">
                                            Ouvrir le site
                                        </a>
                                    )}
                                    <div className="mt-5 flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => startEdit(partner)} className="rounded-full">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Modifier
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm('Supprimer ce partenaire ?')) {
                                                    router.delete(route('dashboard.partners.destroy', partner.id), { preserveScroll: true });
                                                }
                                            }}
                                            className="rounded-full"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400 md:col-span-2">
                                Aucun partenaire n'est encore renseigne. Ajoutez une premiere fiche pour alimenter la section partenaires.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



