import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Lock, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');

    return (
        <DashboardLayout title="Mon profil">
            <Head title="Mon profil" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Compte"
                    title="Mon profil"
                    subtitle="Mettez a jour vos informations, votre securite et les parametres sensibles avec la meme experience visuelle que les pages Articles."
                    icon={<User className="h-6 w-6" />}
                />

                <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <AdminCard padded>
                        <nav className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                                    activeTab === 'profile'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-white/75 dark:hover:bg-white/5'
                                }`}
                            >
                                <User className="h-4 w-4" />
                                Informations
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('password')}
                                className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                                    activeTab === 'password'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-white/75 dark:hover:bg-white/5'
                                }`}
                            >
                                <Lock className="h-4 w-4" />
                                Securite
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('delete')}
                                className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                                    activeTab === 'delete'
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-700 hover:bg-red-50 dark:text-white/75 dark:hover:bg-red-500/10'
                                }`}
                            >
                                <Trash2 className="h-4 w-4" />
                                Zone de danger
                            </button>
                        </nav>
                    </AdminCard>

                    <AdminCard padded>
                        {activeTab === 'profile' && (
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-2xl"
                            />
                        )}

                        {activeTab === 'password' && <UpdatePasswordForm className="max-w-2xl" />}

                        {activeTab === 'delete' && <DeleteUserForm className="max-w-2xl" />}
                    </AdminCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
