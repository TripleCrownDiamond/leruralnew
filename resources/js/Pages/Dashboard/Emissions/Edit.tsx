import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import ImageWithFallback from '@/Components/ImageWithFallback';

interface Emission {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    playlist_url: string;
    is_active: boolean;
    order: number;
}

interface Props {
    emission: Emission;
}

export default function Edit({ emission }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: emission.name,
        description: emission.description || '',
        image: null as File | null,
        playlist_url: emission.playlist_url,
        is_active: emission.is_active,
        order: emission.order,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.emissions.update', emission.id));
    };

    return (
        <DashboardLayout title="Modifier l'Émission">
            <Head title="Modifier l'Émission" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('dashboard.emissions.index')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Modifier l'émission
                        </h2>
                        <p className="text-sm text-gray-500">
                            Modifiez les informations de l'émission
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
                            />
                            <InputError className="mt-2" message={errors.playlist_url} />
                        </div>

                        <div>
                            <InputLabel htmlFor="image" value="Image de couverture (400x225 recommandé)" />
                            {emission.image && (
                                <div className="mb-2 w-40 aspect-video rounded-md overflow-hidden bg-gray-100">
                                    <ImageWithFallback src={emission.image || undefined} alt={emission.name} className="w-full h-full object-cover" />
                                </div>
                            )}
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
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}