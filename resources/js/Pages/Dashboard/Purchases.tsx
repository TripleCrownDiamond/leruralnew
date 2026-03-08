import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Calendar, CheckCircle, XCircle, CreditCard, Clock, FileText } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    date: string;
    description: string;
    method: string;
}

interface Props {
    payments: Payment[];
}

export default function Purchases({ payments }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 mr-1" />;
            case 'pending':
                return <Clock className="h-4 w-4 mr-1" />;
            case 'failed':
                return <XCircle className="h-4 w-4 mr-1" />;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <DashboardLayout title="Historique d'achats">
            <Head title="Historique d'achats" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Historique d'achats
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Retrouvez ici tous vos achats d'articles et abonnements.
                </p>
            </div>

            <div className="space-y-4">
                {payments.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Description</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Montant</th>
                                        <th className="px-6 py-4 font-medium">Moyen de paiement</th>
                                        <th className="px-6 py-4 font-medium">Statut</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {payment.description}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Ref: #{payment.id.toString().padStart(6, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {payment.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 capitalize">
                                                    <CreditCard className="h-4 w-4 text-gray-400" />
                                                    {payment.method}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status === 'completed' ? 'Payé' : 
                                                     payment.status === 'pending' ? 'En attente' : 'Échoué'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href="#">Reçu</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun achat effectué</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">
                            Vous n'avez pas encore effectué d'achat. Explorez nos articles premium ou abonnez-vous pour accéder à tout le contenu.
                        </p>
                        <Button className="mt-6" asChild>
                            <Link href="/">Explorer les articles</Link>
                        </Button>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}