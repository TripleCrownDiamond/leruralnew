import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Mail, Shield, Trash2, UserCog } from 'lucide-react';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';

interface UserItem {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    role: string;
    status: 'active' | 'inactive' | 'invited' | 'suspended';
    created_at: string;
    last_login_at?: string | null;
    permissions?: string[];
}

interface Props {
    user: UserItem;
    roles: Array<{ value: string; label: string }>;
    permissions: Array<{ value: string; label: string }>;
    role_permissions: Record<string, string[]>;
}

export default function Edit({ user, roles, permissions, role_permissions }: Props) {
    const page = usePage<any>();
    const currentUser = page.props.auth?.user as { id: number } | undefined;
    const isSelf = Boolean(currentUser?.id && currentUser.id === user.id);

    const getRolePermissions = (role: string) => role_permissions[role] ?? [];

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        permissions: Array.from(new Set([...(getRolePermissions(user.role || 'user')), ...((user.permissions || []))])),
        status: user.status || 'active',
        send_notification: false,
        custom_message: '',
    });

    const togglePermission = (permission: string) => {
        if (getRolePermissions(data.role).includes(permission)) {
            return;
        }

        const next = data.permissions.includes(permission)
            ? data.permissions.filter((item) => item !== permission)
            : [...data.permissions, permission];
        setData('permissions', next);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        patch(route('dashboard.users.update', user.id));
    };

    const handleDelete = () => {
        if (isSelf) return;
        if (!confirm('Supprimer cet utilisateur ?')) return;

        router.delete(route('dashboard.users.destroy', user.id), {
            preserveScroll: true,
            onSuccess: () => router.visit(route('dashboard.users.index')),
        });
    };

    return (
        <DashboardLayout title={`Modifier ${user.name}`}>
            <Head title={`Modifier ${user.name}`} />

            <form onSubmit={submit} className="space-y-8">
                <AdminPageHeader
                    eyebrow="Communaute"
                    title="Modifier un utilisateur"
                    subtitle="Mettez a jour le profil, le role et les permissions avec le design uniforme des pages Articles."
                    icon={<UserCog className="h-6 w-6" />}
                    actions={
                        <>
                            <AdminLinkButton
                                href={route('dashboard.users.index')}
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour a la liste
                            </AdminLinkButton>
                            {!isSelf && (
                                <AdminButton
                                    type="button"
                                    variant="danger"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={handleDelete}
                                >
                                    Supprimer
                                </AdminButton>
                            )}
                            <AdminButton
                                type="submit"
                                disabled={processing}
                                icon={<Check className="h-4 w-4" />}
                            >
                                Mettre a jour
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Identite" title="Profil utilisateur" />

                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Nom complet *</label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 opacity-90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:opacity-70"
                                        value={data.name}
                                        readOnly
                                        aria-readonly="true"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">Le nom n'est pas modifiable depuis cet ecran.</p>
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Email *</label>
                                    <input
                                        type="email"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 opacity-90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:opacity-70"
                                        value={data.email}
                                        readOnly
                                        aria-readonly="true"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">L'email n'est pas modifiable depuis cet ecran.</p>
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Acces" title="Role, statut et permissions" />

                            <div className="grid gap-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Role</label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => {
                                                const nextRole = e.target.value;
                                                setData('role', nextRole);
                                                setData('permissions', getRolePermissions(nextRole));
                                            }}
                                            disabled={isSelf}
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        >
                                            {roles.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Statut</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as UserItem['status'])}
                                            disabled={isSelf}
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        >
                                            <option value="active">Actif</option>
                                            <option value="inactive">Inactif</option>
                                            <option value="invited">Invite</option>
                                            <option value="suspended">Suspendu</option>
                                        </select>
                                    </div>
                                </div>

                                {isSelf && (
                                    <p className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs text-gray-600 dark:border-primary/20 dark:bg-primary/10 dark:text-gray-300">
                                        Vous ne pouvez pas modifier votre propre role/statut depuis cet ecran.
                                    </p>
                                )}

                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Permissions supplementaires</label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {permissions.map((permission) => (
                                            <label
                                                key={permission.value}
                                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-primary/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/75"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.permissions.includes(permission.value)}
                                                    disabled={isSelf || getRolePermissions(data.role).includes(permission.value)}
                                                    onChange={() => togglePermission(permission.value)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                />
                                                {permission.label}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.permissions && <p className="mt-1 text-xs text-red-600">{errors.permissions}</p>}
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">
                            <SectionHeader eyebrow="Notification" title="Informer l'utilisateur" />

                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={data.send_notification}
                                        onChange={(e) => setData('send_notification', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Notifier par email</div>
                                        <div className="text-xs text-gray-500 dark:text-white/50">Envoi d'un recapitulatif des changements.</div>
                                    </div>
                                </label>

                                {data.send_notification && (
                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Message personnalise (optionnel)</label>
                                        <textarea
                                            rows={5}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                                            value={data.custom_message}
                                            onChange={(e) => setData('custom_message', e.target.value)}
                                            placeholder="Message visible dans l'email"
                                        />
                                        {errors.custom_message && <p className="mt-1 text-xs text-red-600">{errors.custom_message}</p>}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-5 shadow-[0_18px_40px_-28px_rgba(47,106,17,0.28)] dark:border-primary/15 dark:from-primary/10 dark:to-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                                    {data.send_notification ? <Mail className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                </div>
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    {data.send_notification
                                        ? 'Un email sera envoye apres la mise a jour.'
                                        : 'Aucune notification ne sera envoyee apres sauvegarde.'}
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </DashboardLayout>
    );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-6 border-b border-gray-200 pb-4 dark:border-white/10">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</div>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</h2>
        </div>
    );
}
