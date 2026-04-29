import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import CloudinaryUpload from '@/Components/CloudinaryUpload';
import CoverPositionControl from '@/Components/CoverPositionControl';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderTree, Sparkles } from 'lucide-react';
import type { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name_fr: '',
        description_fr: '',
        order: 0,
        published: true,
        image: '',
        image_position_x: 50,
        image_position_y: 50,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('dashboard.categories.store'));
    };

    return (
        <DashboardLayout title="Nouvelle categorie">
            <Head title="Nouvelle categorie" />

            <form onSubmit={submit} className="space-y-8">
                <AdminPageHeader
                    eyebrow="Creation"
                    title="Creer une categorie"
                    subtitle="Ajoutez une rubrique avec la meme presentation et ergonomie que les pages Articles."
                    icon={<FolderTree className="h-6 w-6" />}
                    actions={
                        <>
                            <AdminLinkButton href={route('dashboard.categories.index')} variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                                Retour a la liste
                            </AdminLinkButton>
                            <AdminButton type="submit" disabled={processing} icon={<Sparkles className="h-4 w-4" />}>
                                Creer
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Editorial" title="Informations" />

                            <div className="grid gap-5">
                                <div>
                                    <InputLabel htmlFor="name_fr" value="Nom *" />
                                    <TextInput
                                        id="name_fr"
                                        className="mt-2 block w-full text-lg font-semibold"
                                        value={data.name_fr}
                                        onChange={(event) => setData('name_fr', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name_fr} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description_fr" value="Description (FR)" />
                                    <textarea
                                        id="description_fr"
                                        rows={5}
                                        className="mt-2 block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                                        value={data.description_fr}
                                        onChange={(event) => setData('description_fr', event.target.value)}
                                    />
                                    <InputError message={errors.description_fr} className="mt-2" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">
                            <SectionHeader eyebrow="Publication" title="Parametres" />

                            <div className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="order" value="Ordre d'affichage" />
                                    <TextInput
                                        id="order"
                                        type="number"
                                        className="mt-2 block w-full"
                                        value={String(data.order)}
                                        onChange={(event) => setData('order', Number(event.target.value) || 0)}
                                    />
                                    <InputError message={errors.order} className="mt-2" />
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(data.published)}
                                        onChange={(event) => setData('published', event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Publier la categorie</p>
                                        <p className="text-xs text-gray-500 dark:text-white/60">Visible immediatement sur le site.</p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">
                            <SectionHeader eyebrow="Media" title="Image" />
                            <CloudinaryUpload onUpload={(url) => setData('image', url)} defaultImage={data.image || undefined} label="" className="w-full" />
                            <CoverPositionControl
                                imageUrl={data.image || undefined}
                                x={Number(data.image_position_x ?? 50)}
                                y={Number(data.image_position_y ?? 50)}
                                onChangeX={(value) => setData('image_position_x', value)}
                                onChangeY={(value) => setData('image_position_y', value)}
                                recommendation="Categorie: bandeau large recommande 1920x540, minimum 1400x500."
                            />
                            <InputError message={errors.image} className="mt-2" />
                            <InputError message={errors.image_position_x} className="mt-2" />
                            <InputError message={errors.image_position_y} className="mt-2" />
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
