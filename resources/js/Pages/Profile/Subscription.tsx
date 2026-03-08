import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    duration_days: number;
}

interface UserSubscription {
    id: number;
    plan: SubscriptionPlan;
    start_date: string;
    end_date: string;
    status: string;
}

interface Props {
    auth: any;
    currentSubscription: UserSubscription | null;
    subscriptionHistory: UserSubscription[];
    availablePlans: SubscriptionPlan[];
}

export default function Subscription({ auth, currentSubscription, subscriptionHistory, availablePlans }: Props) {
    const isSubscriptionActive = currentSubscription && new Date(currentSubscription.end_date) > new Date();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Mon Abonnement</h2>}
        >
            <Head title="Mon Abonnement" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Current Subscription Status */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Statut de l'abonnement</h3>
                        
                        {isSubscriptionActive ? (
                            <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        <h4 className="text-xl font-bold text-green-800 dark:text-green-300">Abonnement Actif</h4>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Vous êtes abonné au plan <span className="font-semibold">{currentSubscription?.plan.name}</span>.
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Expire le : {format(new Date(currentSubscription!.end_date), 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                </div>
                                <div>
                                    <Link href={route('payment.checkout', { type: 'subscription', id: currentSubscription?.plan.slug })}>
                                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">
                                            Prolonger
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                        <h4 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">Aucun abonnement actif</h4>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Abonnez-vous pour accéder à tout le contenu premium et aux archives.
                                    </p>
                                </div>
                                <div>
                                    <a href="#plans">
                                        <Button>S'abonner maintenant</Button>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Available Plans */}
                    <div id="plans" className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Nos Offres</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {availablePlans.map((plan) => (
                                <div key={plan.id} className="border dark:border-gray-700 rounded-xl p-6 flex flex-col hover:border-primary transition-colors relative">
                                    {currentSubscription?.plan.id === plan.id && isSubscriptionActive && (
                                        <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                            Actuel
                                        </span>
                                    )}
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                                    <div className="text-3xl font-bold text-primary mb-4">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(plan.price)}
                                        <span className="text-sm text-gray-500 font-normal"> / {plan.duration_days} jours</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
                                        {plan.description}
                                    </p>
                                    <Link href={route('payment.checkout', { type: 'subscription', id: plan.slug })} className="w-full">
                                        <Button className="w-full" variant={currentSubscription?.plan.id === plan.id && isSubscriptionActive ? "secondary" : "default"}>
                                            {currentSubscription?.plan.id === plan.id && isSubscriptionActive ? 'Renouveler' : 'Choisir'}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscription History */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Historique</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Plan</th>
                                        <th className="px-6 py-3">Date début</th>
                                        <th className="px-6 py-3">Date fin</th>
                                        <th className="px-6 py-3">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptionHistory.length > 0 ? (
                                        subscriptionHistory.map((sub) => (
                                            <tr key={sub.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {sub.plan.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {format(new Date(sub.start_date), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {format(new Date(sub.end_date), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(sub.end_date) > new Date() && sub.status === 'active' ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Expiré</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Aucun historique d'abonnement.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}