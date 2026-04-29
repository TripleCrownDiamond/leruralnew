import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, Mail, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import { Checkbox } from '@/Components/ui/checkbox';

interface UserItem {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    role: string;
    status: 'active' | 'inactive' | 'invited' | 'suspended';
    created_at: string;
    last_login_at?: string | null;
}

interface Props {
    users: {
        data: UserItem[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters?: {
        search?: string;
        role?: string;
        status?: string;
        verified?: string;
    };
    roles: Array<{ value: string; label: string }>;
}

export default function Index({ users, filters = {}, roles }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [verified, setVerified] = useState(filters.verified || 'all');

    useEffect(() => {
        if (
            search === (filters.search || '') &&
            role === (filters.role || 'all') &&
            status === (filters.status || 'all') &&
            verified === (filters.verified || 'all')
        ) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.users.index'), {
                data: {
                    search: search || undefined,
                    role: role !== 'all' ? role : undefined,
                    status: status !== 'all' ? status : undefined,
                    verified: verified !== 'all' ? verified : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 280);

        return () => clearTimeout(timeoutId);
    }, [search, role, status, verified, filters.search, filters.role, filters.status, filters.verified]);

    const roleLabelMap = useMemo(
        () => Object.fromEntries(roles.map((item) => [item.value, item.label])),
        [roles],
    );

    const resetFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        setVerified('all');

        router.visit(route('dashboard.users.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.data.length) {
            setSelectedUsers([]);
            return;
        }

        setSelectedUsers(users.data.map((user) => user.id));
    };

    const toggleSelect = (id: number) => {
        setSelectedUsers((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;

        router.delete(route('dashboard.users.destroy', id), {
            preserveScroll: true,
        });
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) return;
        if (!confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) return;

        router.post(
            route('dashboard.users.bulk-delete'),
            { user_ids: selectedUsers },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedUsers([]),
            },
        );
    };

    const handleResendInvitation = (id: number) => {
        router.post(route('dashboard.users.resend-invitation', id), {}, { preserveScroll: true });
    };

    const handleToggleStatus = (user: UserItem) => {
        const nextStatus = user.status === 'active' ? 'inactive' : 'active';
        router.patch(
            route('dashboard.users.update-status', user.id),
            { status: nextStatus },
            { preserveScroll: true },
        );
    };

    const from = users.from ?? (users.total === 0 ? 0 : (users.current_page - 1) * users.per_page + 1);
    const to = users.to ?? (users.total === 0 ? 0 : Math.min(users.current_page * users.per_page, users.total));

    return (
        <DashboardLayout title="Utilisateurs">
            <Head title="Utilisateurs" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Communaute"
                    title="Utilisateurs"
                    subtitle="Gerez les roles, verifications et activites avec la meme structure que les pages Articles."
                    icon={<Users className="h-6 w-6" />}
                    meta={`${users.total} comptes`}
                    actions={
                        <div className="flex items-center gap-2">
                            {selectedUsers.length > 0 && (
                                <AdminButton
                                    variant="danger"
                                    size="sm"
                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                    onClick={handleBulkDelete}
                                >
                                    Supprimer ({selectedUsers.length})
                                </AdminButton>
                            )}
                            <AdminLinkButton
                                href={route('dashboard.users.create')}
                                variant="primary"
                                icon={<UserPlus className="h-3.5 w-3.5" />}
                            >
                                Inviter un utilisateur
                            </AdminLinkButton>
                        </div>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher nom ou email..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actifs' },
                                { key: 'inactive', label: 'Inactifs' },
                                { key: 'invited', label: 'Invites' },
                                { key: 'suspended', label: 'Suspendus' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatus(opt.key)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        status === opt.key
                                            ? 'bg-gradient-to-br from-primary to-emerald-700 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-white hover:text-primary dark:text-white/60 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    }
                    trailing={
                        <div className="flex items-center gap-2">
                            <select
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
                            >
                                <option value="all">Tous les roles</option>
                                {roles.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={verified}
                                onChange={(event) => setVerified(event.target.value)}
                                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
                            >
                                <option value="all">Verification</option>
                                <option value="verified">Verifies</option>
                                <option value="unverified">Non verifies</option>
                            </select>

                            <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                                Reinitialiser
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard>
                    {users.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Users className="h-7 w-7" />}
                            title="Aucun utilisateur"
                            subtitle="Aucun compte ne correspond aux filtres actuels."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.users.create')}
                                    variant="primary"
                                    icon={<UserPlus className="h-4 w-4" />}
                                >
                                    Inviter un utilisateur
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3 w-10">
                                                <Checkbox
                                                    checked={selectedUsers.length === users.data.length && users.data.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-5 py-3">Utilisateur</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Role</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Verification</th>
                                            <th className="px-5 py-3 hidden xl:table-cell">Inscription</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <Checkbox
                                                        checked={selectedUsers.includes(user.id)}
                                                        onCheckedChange={() => toggleSelect(user.id)}
                                                    />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="min-w-0">
                                                        <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </div>
                                                        <div className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-white/50">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 dark:bg-white/5 dark:text-white/60">
                                                        {roleLabelMap[user.role] ?? user.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <AdminStatusPill
                                                        tone={
                                                            user.status === 'active'
                                                                ? 'success'
                                                                : user.status === 'inactive'
                                                                ? 'neutral'
                                                                : user.status === 'invited'
                                                                ? 'warning'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {user.status === 'active'
                                                            ? 'Actif'
                                                            : user.status === 'inactive'
                                                            ? 'Inactif'
                                                            : user.status === 'invited'
                                                            ? 'Invite'
                                                            : 'Suspendu'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="hidden px-5 py-4 lg:table-cell">
                                                    <AdminStatusPill tone={user.email_verified_at ? 'success' : 'warning'}>
                                                        {user.email_verified_at ? 'Verifie' : 'Non verifie'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="hidden px-5 py-4 xl:table-cell text-[11px] text-gray-500 dark:text-white/50">
                                                    <div>{new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
                                                    {user.last_login_at && (
                                                        <div>Derniere connexion {new Date(user.last_login_at).toLocaleDateString('fr-FR')}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <AdminLinkButton
                                                            href={route('dashboard.users.show', user.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={<Eye className="h-3.5 w-3.5" />}
                                                        >
                                                            Voir
                                                        </AdminLinkButton>
                                                        <AdminLinkButton
                                                            href={route('dashboard.users.edit', user.id)}
                                                            variant="secondary"
                                                            size="sm"
                                                            icon={<Edit className="h-3.5 w-3.5" />}
                                                        >
                                                            Modifier
                                                        </AdminLinkButton>
                                                        {user.status === 'invited' ? (
                                                            <AdminButton
                                                                variant="ghost"
                                                                size="sm"
                                                                icon={<Mail className="h-3.5 w-3.5" />}
                                                                onClick={() => handleResendInvitation(user.id)}
                                                            >
                                                                Relancer
                                                            </AdminButton>
                                                        ) : user.status === 'active' || user.status === 'inactive' ? (
                                                            <AdminButton
                                                                variant="ghost"
                                                                size="sm"
                                                                icon={<Shield className="h-3.5 w-3.5" />}
                                                                onClick={() => handleToggleStatus(user)}
                                                            >
                                                                {user.status === 'active' ? 'Desactiver' : 'Activer'}
                                                            </AdminButton>
                                                        ) : null}
                                                        <AdminButton
                                                            variant="danger"
                                                            size="sm"
                                                            icon={<Trash2 className="h-3.5 w-3.5" />}
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            Suppr.
                                                        </AdminButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={users.links} from={from} to={to} total={users.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
