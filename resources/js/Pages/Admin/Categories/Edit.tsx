import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import CloudinaryUpload from '@/Components/CloudinaryUpload';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ category }: { category: any }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name_fr: category.name_fr || '',
        name_en: category.name_en || '',
        description_fr: category.description_fr || '',
        description_en: category.description_en || '',
        order: category.order || 0,
        published: Boolean(category.published),
        image: category.image || null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.categories.update', category.id));
    };

    return (
        <DashboardLayout title={`Modifier ${category.name_fr}`}>
            <Head title={`Modifier ${category.name_fr}`} />

            <form onSubmit={submit}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Modifier Catégorie: {category.name_fr}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Modifiez les informations de la catégorie
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={route('dashboard.categories.index')}>Annuler</Link>
                        </Button>
                        <PrimaryButton disabled={processing}>
                            Mettre à jour
                        </PrimaryButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Informations générales
                            </h3>
                            
                            {/* Names */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name_fr" value="Nom (Français) *" />
                                    <TextInput
                                        id="name_fr"
                                        className="mt-1 block w-full"
                                        value={data.name_fr}
                                        onChange={(e) => setData('name_fr', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name_fr} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="name_en" value="Nom (Anglais)" />
                                    <TextInput
                                        id="name_en"
                                        className="mt-1 block w-full"
                                        value={data.name_en}
                                        onChange={(e) => setData('name_en', e.target.value)}
                                    />
                                    <InputError message={errors.name_en} className="mt-2" />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="description_fr" value="Description (Français)" />
                                    <textarea
                                        id="description_fr"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        rows={4}
                                        value={data.description_fr}
                                        onChange={(e) => setData('description_fr', e.target.value)}
                                    />
                                    <InputError message={errors.description_fr} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="description_en" value="Description (Anglais)" />
                                    <textarea
                                        id="description_en"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        rows={4}
                                        value={data.description_en}
                                        onChange={(e) => setData('description_en', e.target.value)}
                                    />
                                    <InputError message={errors.description_en} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">
                        {/* Status & Visibility */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Configuration
                            </h3>
                            
                            <div>
                                <InputLabel htmlFor="order" value="Ordre d'affichage" />
                                <TextInput
                                    id="order"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value))}
                                />
                                <InputError message={errors.order} className="mt-2" />
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                    <Checkbox
                                        name="published"
                                        checked={data.published}
                                        onChange={(e) => setData('published', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Publier la catégorie</span>
                                </label>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Image de bannière
                            </h3>
                            
                            <div>
                                <CloudinaryUpload
                                    onUpload={(url) => setData('image', url)}
                                    defaultImage={data.image as string}
                                    label=""
                                    className="w-full"
                                />
                                <InputError message={errors.image} className="mt-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
