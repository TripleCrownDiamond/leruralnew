import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Users, Clock, Settings, Mail, Shield, Crown, Key } from 'lucide-react';

export default function ComingSoon() {
    return (
        <DashboardLayout title="Gestion des Utilisateurs">
            <Head title="Gestion des Utilisateurs - Bientôt Disponible" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={route('dashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Bientôt disponible - En cours de développement
                        </p>
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                            <Users className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Bientôt Disponible
                        </h2>
                        <p className="text-blue-100 text-lg">
                            La gestion des utilisateurs est en cours de développement
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Features Preview */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Fonctionnalités à venir
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            Invitations par Email
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Invitez des utilisateurs par email avec des liens sécurisés
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            Gestion des Rôles
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Admin, Moderator, Editor avec permissions granulaires
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                        <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            Modération
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Suspendre, activer, supprimer des comptes utilisateur
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                        <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            Permissions Avancées
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Contrôle d'accès granulaire par utilisateur
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Statut de Développement
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Interface Utilisateur</span>
                                        <span className="text-green-600 dark:text-green-400">100%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Backend API</span>
                                        <span className="text-yellow-600 dark:text-yellow-400">En cours</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Tests & Déploiement</span>
                                        <span className="text-gray-600 dark:text-gray-400">Bientôt</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild className="flex-1">
                                <a href={route('dashboard')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour au Dashboard
                                </a>
                            </Button>
                            
                            <Button variant="outline" className="flex-1" asChild>
                                <a href="mailto:admin@lerural.com">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contactez le Support
                                </a>
                            </Button>
                        </div>

                        {/* Info */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <h4 className="font-medium mb-1">Disponibilité prévue</h4>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        La gestion des utilisateurs sera disponible dans les prochains jours. 
                                        Vous serez notifié dès que la fonctionnalité sera prête.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
