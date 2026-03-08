import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Lock, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');

    return (
        <DashboardLayout title="Mon Profil">
            <Head title="Mon Profil" />
            
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                    <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full group flex items-center border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-gray-800 dark:text-white'
                                        : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`}
                                aria-current={activeTab === 'profile' ? 'page' : undefined}
                            >
                                <User className={`-ml-1 mr-3 h-6 w-6 flex-shrink-0 ${
                                    activeTab === 'profile'
                                        ? 'text-indigo-500 group-hover:text-indigo-500'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                                }`} />
                                <span className="truncate">Informations</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full group flex items-center border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                                    activeTab === 'password'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-gray-800 dark:text-white'
                                        : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`}
                                aria-current={activeTab === 'password' ? 'page' : undefined}
                            >
                                <Lock className={`-ml-1 mr-3 h-6 w-6 flex-shrink-0 ${
                                    activeTab === 'password'
                                        ? 'text-indigo-500 group-hover:text-indigo-500'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                                }`} />
                                <span className="truncate">Sécurité</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('delete')}
                                className={`w-full group flex items-center border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                                    activeTab === 'delete'
                                        ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/20 dark:text-red-400'
                                        : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`}
                                aria-current={activeTab === 'delete' ? 'page' : undefined}
                            >
                                <Trash2 className={`-ml-1 mr-3 h-6 w-6 flex-shrink-0 ${
                                    activeTab === 'delete'
                                        ? 'text-red-500 group-hover:text-red-500'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                                }`} />
                                <span className="truncate">Zone de danger</span>
                            </button>
                        </nav>
                    </aside>

                    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                        {activeTab === 'profile' && (
                            <div className="shadow sm:rounded-md sm:overflow-hidden bg-white dark:bg-gray-800 animate-in fade-in duration-300">
                                <div className="bg-white py-6 px-4 space-y-6 sm:p-6 dark:bg-gray-800">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="shadow sm:rounded-md sm:overflow-hidden bg-white dark:bg-gray-800 animate-in fade-in duration-300">
                                <div className="bg-white py-6 px-4 space-y-6 sm:p-6 dark:bg-gray-800">
                                    <div className="mb-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Mot de passe</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Assurez-vous d'utiliser un mot de passe long et aléatoire pour rester en sécurité.</p>
                                    </div>
                                    <UpdatePasswordForm className="max-w-xl" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'delete' && (
                            <div className="shadow sm:rounded-md sm:overflow-hidden bg-white dark:bg-gray-800 animate-in fade-in duration-300">
                                <div className="bg-white py-6 px-4 space-y-6 sm:p-6 dark:bg-gray-800">
                                    <div className="mb-6">
                                        <h3 className="text-lg leading-6 font-medium text-red-600 dark:text-red-400">Supprimer le compte</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.</p>
                                    </div>
                                    <DeleteUserForm className="max-w-xl" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
