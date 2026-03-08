import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Plus, Edit, Trash2, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Poll {
    id: number;
    question: string;
    is_active: boolean;
    expires_at: string | null;
    options_count: number;
    created_at: string;
    options: {
        id: number;
        label: string;
        votes: number;
    }[];
}

interface Props {
    polls: {
        data: Poll[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ polls }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
            router.delete(route('dashboard.polls.destroy', id));
        }
    };

    return (
        <DashboardLayout title="Gestion des Sondages">
            <Head title="Gestion des Sondages" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Sondages
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gérez les sondages affichés sur le site
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('dashboard.polls.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Sondage
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Question
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Résultats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Expiration
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {polls.data.length > 0 ? (
                                polls.data.map((poll) => (
                                    <tr key={poll.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {poll.question}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2 min-w-[200px]">
                                                {poll.options && poll.options.map(option => {
                                                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                                                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                                    
                                                    return (
                                                        <div key={option.id} className="text-xs">
                                                            <div className="flex justify-between mb-1 text-gray-600 dark:text-gray-400">
                                                                <span>{option.label}</span>
                                                                <span className="font-semibold">{option.votes} ({percentage}%)</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                                                <div 
                                                                    className="bg-blue-600 h-1.5 rounded-full" 
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                                                    Total: {poll.options?.reduce((acc, curr) => acc + curr.votes, 0) || 0} votes
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                poll.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {poll.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {poll.expires_at 
                                                ? format(new Date(poll.expires_at), 'dd MMM yyyy', { locale: fr }) 
                                                : 'Jamais'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('dashboard.polls.edit', poll.id)}>
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(poll.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <BarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                        <p>Aucun sondage trouvé</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
