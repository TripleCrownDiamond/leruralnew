import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2, Plus, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/Components/ui/button';
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
    emissions: Emission[];
}

export default function Index({ emissions }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette émission ?')) {
            router.delete(route('dashboard.emissions.destroy', id));
        }
    };

    return (
        <DashboardLayout title="Gestion des Émissions">
            <Head title="Gestion des Émissions" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Émissions TV
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gérez les playlists et émissions de la WebTV
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('dashboard.emissions.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle Émission
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Image</th>
                                    <th className="px-6 py-3">Nom</th>
                                    <th className="px-6 py-3">Playlist</th>
                                    <th className="px-6 py-3">Ordre</th>
                                    <th className="px-6 py-3">Statut</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {emissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Aucune émission trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    emissions.map((emission) => (
                                        <tr key={emission.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="h-12 w-20 overflow-hidden rounded-md bg-gray-100">
                                                    <ImageWithFallback
                                                        src={emission.image || undefined}
                                                        alt={emission.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {emission.name}
                                                {emission.description && (
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{emission.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <a 
                                                    href={emission.playlist_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:underline"
                                                >
                                                    Lien <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                {emission.order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    emission.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    {emission.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('dashboard.emissions.edit', emission.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleDelete(emission.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}