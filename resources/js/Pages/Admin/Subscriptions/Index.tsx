import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface Subscription {
    id: number;
    user: { name: string; email: string };
    plan: { name: string; duration_days: number };
    starts_at: string;
    ends_at: string;
    status: 'active' | 'expired' | 'cancelled';
    is_recurring: boolean;
}

export default function Index({ subscriptions }: { subscriptions: { data: Subscription[], links: any[] } }) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <DashboardLayout title="Souscriptions">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Souscriptions Utilisateurs</h1>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Début</TableHead>
                            <TableHead>Fin</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Récurrent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.data.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{sub.user.name}</span>
                                        <span className="text-xs text-gray-500">{sub.user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{sub.plan.name}</TableCell>
                                <TableCell>{new Date(sub.starts_at).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>{new Date(sub.ends_at).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(sub.status)}`}>
                                        {sub.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {sub.is_recurring ? (
                                        <span className="text-green-600 dark:text-green-400 font-bold">Oui</span>
                                    ) : (
                                        <span className="text-gray-400">Non</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {subscriptions.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Aucune souscription active trouvée.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
}