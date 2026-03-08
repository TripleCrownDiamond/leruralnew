import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null as File | null,
        playlist_url: '',
        is_active: true,
        order: 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.emissions.store'));
    };

    return (
        <DashboardLayout title="Nouvelle Émission">
            <Head title="Nouvelle Émission" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('dashboard.emissions.index')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Ajouter une émission
                        </h2>
                        <p className="text-sm text-gray-500">
                            Créez une nouvelle émission pour la WebTV
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nom de l'émission" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description (Optionnel)" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div>
                            <InputLabel htmlFor="playlist_url" value="Lien de la Playlist (YouTube)" />
                            <TextInput
                                id="playlist_url"
                                type="url"
                                className="mt-1 block w-full"
                                value={data.playlist_url}
                                onChange={(e) => setData('playlist_url', e.target.value)}
                                required
                                placeholder="https://www.youtube.com/playlist?list=..."
                            />
                            <InputError className="mt-2" message={errors.playlist_url} />
                        </div>

                        <div>
                            <InputLabel htmlFor="image" value="Image de couverture (400x225 recommandé)" />
                            <input
                                id="image"
                                type="file"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                accept="image/*"
                            />
                            <InputError className="mt-2" message={errors.image} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="order" value="Ordre d'affichage" />
                                <TextInput
                                    id="order"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value))}
                                />
                                <InputError className="mt-2" message={errors.order} />
                            </div>

                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                        Émission active
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}