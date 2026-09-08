import {
    AdminButton,
    AdminLinkButton,
} from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Clock,
    CreditCard,
    Crown,
    Edit,
    Eye,
    EyeOff,
    FileText,
    Key,
    MoreHorizontal,
    Send,
    Shield,
    Trash2,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';

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

export default function Show({
    user,
    roles,
    permissions,
    recentActivity = [],
}: Props) {
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
        const baseClasses =
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border';

        switch (status) {
            case 'active':
                return (
                    <span
                        className={`${baseClasses} border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400`}
                    >
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                        Actif
                    </span>
                );
            case 'inactive':
                return (
                    <span
                        className={`${baseClasses} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-900/30 dark:bg-gray-900/20 dark:text-gray-400`}
                    >
                        <span className="mr-2 h-2 w-2 rounded-full bg-gray-500"></span>
                        Inactif
                    </span>
                );
            case 'invited':
                return (
                    <span
                        className={`${baseClasses} border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400`}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Invité
                    </span>
                );
            case 'suspended':
                return (
                    <span
                        className={`${baseClasses} border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400`}
                    >
                        <UserX className="mr-2 h-4 w-4" />
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
                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    <EyeOff className="mr-2 h-4 w-4" />
                    Non vérifié
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Eye className="mr-2 h-4 w-4" />
                Vérifié
            </span>
        );
    };

    const handleResendInvitation = () => {
        router.post(route('dashboard.users.resend-invitation', user.id));
    };

    const handleResendVerification = () => {
        router.post(
            route('dashboard.users.resend-verification', user.id),
            {},
            { preserveScroll: true },
        );
    };

    const handleToggleStatus = (newStatus: string) => {
        router.patch(route('dashboard.users.update-status', user.id), {
            status: newStatus,
        });
    };

    const handleDelete = () => {
        if (
            confirm(
                'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
            )
        ) {
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

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Communaute"
                    title={user.name}
                    subtitle={user.email}
                    icon={<Users className="h-6 w-6" />}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <AdminLinkButton
                                href={route('dashboard.users.index')}
                                variant="ghost"
                                icon={<ArrowLeft className="h-3.5 w-3.5" />}
                            >
                                Retour
                            </AdminLinkButton>
                            {!user.email_verified_at && (
                                <AdminButton
                                    variant="secondary"
                                    icon={<Send className="h-3.5 w-3.5" />}
                                    onClick={handleResendVerification}
                                >
                                    Renvoyer la verification
                                </AdminButton>
                            )}
                            <AdminLinkButton
                                href={route('dashboard.users.edit', user.id)}
                                variant="primary"
                                icon={<Edit className="h-3.5 w-3.5" />}
                            >
                                Modifier
                            </AdminLinkButton>
                        </div>
                    }
                />

                <div className="flex flex-wrap justify-end gap-2">
                    {user.status === 'invited' && (
                        <Button
                            variant="outline"
                            onClick={handleResendInvitation}
                        >
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
                            {(user.status === 'active' ||
                                user.status === 'inactive') && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleToggleStatus(
                                            user.status === 'active'
                                                ? 'inactive'
                                                : 'active',
                                        )
                                    }
                                >
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

                {/* User Profile Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div className="h-32 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/40"></div>
                    <div className="px-6 pb-6">
                        <div className="-mt-16 mb-6 flex items-end">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white dark:border-gray-800 dark:bg-gray-800">
                                <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="mb-4 ml-6">
                                <div className="mb-2 flex items-center gap-3">
                                    {getStatusBadge(user.status)}
                                    {getVerifiedBadge(user.email_verified_at)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getRoleIcon(user.role)}
                                    <span className="text-lg font-medium capitalize text-gray-900 dark:text-white">
                                        {roles.find(
                                            (r) => r.value === user.role,
                                        )?.label || user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/50">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.articles_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Articles
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/50">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.subscriptions_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Abonnements
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/50">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.payments_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Paiements
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/50">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.comments_count || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Commentaires
                                </div>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                    Informations personnelles
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            ID Utilisateur
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            #{user.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Email
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Date d'inscription
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Dernière connexion
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user.last_login_at
                                                ? new Date(
                                                      user.last_login_at,
                                                  ).toLocaleDateString('fr-FR')
                                                : 'Jamais'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                    Permissions
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded bg-gray-50 p-2 dark:bg-gray-900/50">
                                        {getRoleIcon(user.role)}
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {roles.find(
                                                (r) => r.value === user.role,
                                            )?.label || user.role}
                                        </span>
                                    </div>
                                    {(user.permissions || []).map(
                                        (permission) => (
                                            <div
                                                key={permission}
                                                className="flex items-center gap-2 rounded bg-gray-50 p-2 dark:bg-gray-900/50"
                                            >
                                                <Key className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {permissions.find(
                                                        (p) =>
                                                            p.value ===
                                                            permission,
                                                    )?.label || permission}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                    {(!user.permissions ||
                                        user.permissions.length === 0) && (
                                        <div className="text-sm italic text-gray-500 dark:text-gray-400">
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
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="p-6">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
                                <Activity className="h-5 w-5" />
                                Activité récente
                            </h3>
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50"
                                    >
                                        {getActivityIcon(activity.type)}
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    activity.created_at,
                                                ).toLocaleDateString(
                                                    'fr-FR',
                                                )}{' '}
                                                à{' '}
                                                {new Date(
                                                    activity.created_at,
                                                ).toLocaleTimeString('fr-FR')}
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
