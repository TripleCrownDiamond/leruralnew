import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
    duration_days: number;
    is_active: boolean;
    is_featured: boolean;
}

export default function Index({ plans }: { plans: Plan[] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
            destroy(route('dashboard.subscription-plans.destroy', id));
        }
    };

    return (
        <DashboardLayout title="Plans d'abonnement">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Plans d'abonnement</h1>
                <Button asChild className="w-full sm:w-auto">
                    <Link href={route('dashboard.subscription-plans.create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Plan
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Mis en avant</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: plan.currency }).format(plan.price)}</TableCell>
                                <TableCell>{plan.duration_days} jours</TableCell>
                                <TableCell>
                                    {plan.is_active ? (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                                            Inactif
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {plan.is_featured && <CheckCircle className="h-4 w-4 text-primary" />}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={route('dashboard.subscription-plans.edit', plan.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(plan.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {plans.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Aucun plan d'abonnement trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
}