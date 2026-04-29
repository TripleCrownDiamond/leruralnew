import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { useState } from 'react';
import { 
    ArrowLeft, 
    Mail, 
    Shield, 
    Crown, 
    Key, 
    Users, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Send, 
    UserCheck, 
    UserX, 
    Calendar,
    Clock,
    FileText,
    CreditCard,
    Activity,
    MoreHorizontal
} from 'lucide-react';
import Notifications from '@/Components/Notifications';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    status: 'active' | 'inactive' | 'invited' | 'suspended';
    created_at: string;
    last_login_at?: string;
    permissions?: string[];
    articles_count?: number;
    subscriptions_count?: number;
    payments_count?: number;
    comments_count?: number;
    total_spent?: number;
}

interface Props {
    user: User;
    roles: Array<{ value: string; label: string }>;
    permissions: Array<{ value: string; label: string }>;
    recentActivity?: Array<{
        id: number;
        type: string;
        description: string;
        created_at: string;
    }>;
}

export default function Show({ user, roles, permissions, recentActivity = [] }: Props) {
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="h-5 w-5 text-red-500" />;
            case 'moderator':
                return <Shield className="h-5 w-5 text-blue-500" />;
            case 'editor':
                return <Key className="h-5 w-5 text-green-500" />;
            default:
                return <Users className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border";
        
        switch (status) {
            case 'active':
                return (
                    <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Actif
                    </span>
                );
            case 'inactive':
                return (
                    <span className={`${baseClasses} bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/30`}>
                        <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                        Inactif
                    </span>
                );
            case 'invited':
                return (
                    <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30`}>
                        <Clock className="w-4 h-4 mr-2" />
                        Invité
                    </span>
                );
            case 'suspended':
                return (
                    <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30`}>
                        <UserX className="w-4 h-4 mr-2" />
                        Suspendu
                    </span>
                );
            default:
                return null;
        }
    };

    const getVerifiedBadge = (verified?: string) => {
        if (!verified) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    <EyeOff className="w-4 h-4 mr-2" />
                    Non vérifié
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Eye className="w-4 h-4 mr-2" />
                Vérifié
            </span>
        );
    };

    const handleResendInvitation = () => {
        router.post(route('dashboard.users.resend-invitation', user.id));
    };

    const handleToggleStatus = (newStatus: string) => {
        router.patch(route('dashboard.users.update-status', user.id), { status: newStatus });
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            router.delete(route('dashboard.users.destroy', user.id));
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'login':
                return <UserCheck className="h-4 w-4 text-green-500" />;
            case 'article_created':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'payment':
                return <CreditCard className="h-4 w-4 text-purple-500" />;
            case 'comment':
                return <Activity className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <DashboardLayout title={`Profil de ${user.name}`}>
            <Head title={`Profil de ${user.name}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('dashboard.users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {user.status === 'invited' && (
                            <Button variant="outline" onClick={handleResendInvitation}>
                                <Send className="mr-2 h-4 w-4" />
                                Renvoyer l'invitation
                            </Button>
                        )}
                        
                        <Button asChild>
                            <Link href={route('dashboard.users.edit', user.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(user.status === 'active' || user.status === 'inactive') && (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(user.status === 'active' ? 'inactive' : 'active')}>
                                        {user.status === 'active' ? (
                                            <>
                                                <UserX className="mr-2 h-4 w-4" />
                                                Désactiver
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Activer
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
                    <div className="px-6 pb-6">
                        <div className="flex items-end -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="ml-6 mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusBadge(user.status)}
                                    {getVerifiedBadge(user.email_verified_at)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getRoleIcon(user.role)}
                                    <span className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                        {roles.find(r => r.value === user.role)?.label || user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.articles_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.subscriptions_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Abonnements</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.payments_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Paiements</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.comments_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Commentaires</div>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations personnelles</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">ID Utilisateur</span>
                                        <span className="font-medium text-gray-900 dark:text-white">#{user.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Email</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Date d'inscription</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Dernière connexion</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Permissions</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                                        {getRoleIcon(user.role)}
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {roles.find(r => r.value === user.role)?.label || user.role}
                                        </span>
                                    </div>
                                    {(user.permissions || []).map((permission) => (
                                        <div key={permission} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                                            <Key className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {permissions.find(p => p.value === permission)?.label || permission}
                                            </span>
                                        </div>
                                    ))}
                                    {(!user.permissions || user.permissions.length === 0) && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            Aucune permission supplémentaire
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activité récente
                            </h3>
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        {getActivityIcon(activity.type)}
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(activity.created_at).toLocaleDateString('fr-FR')} à {new Date(activity.created_at).toLocaleTimeString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
