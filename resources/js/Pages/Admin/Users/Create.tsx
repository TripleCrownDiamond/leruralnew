import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Mail, Shield, UserPlus } from 'lucide-react';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';

interface Props {
    roles: Array<{ value: string; label: string }>;
    permissions: Array<{ value: string; label: string }>;
}

export default function Create({ roles, permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'user',
        permissions: [] as string[],
        send_invitation: true,
        custom_message: '',
    });

    const togglePermission = (permission: string) => {
        const next = data.permissions.includes(permission)
            ? data.permissions.filter((item) => item !== permission)
            : [...data.permissions, permission];
        setData('permissions', next);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('dashboard.users.store'));
    };

    return (
        <DashboardLayout title="Inviter un utilisateur">
            <Head title="Inviter un utilisateur" />

            <form onSubmit={submit} className="space-y-8">
                <AdminPageHeader
                    eyebrow="Communaute"
                    title="Inviter un utilisateur"
                    subtitle="Creez un compte, assignez un role et envoyez une invitation avec le meme workflow que les pages Articles."
                    icon={<UserPlus className="h-6 w-6" />}
                    actions={
                        <>
                            <AdminLinkButton
                                href={route('dashboard.users.index')}
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour a la liste
                            </AdminLinkButton>
                            <AdminButton
                                type="submit"
                                disabled={processing}
                                icon={<Check className="h-4 w-4" />}
                            >
                                {data.send_invitation ? 'Envoyer invitation' : 'Creer utilisateur'}
                            </AdminButton>
                        </>
                    }
                />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Identite" title="Informations du compte" />

                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Nom complet *</label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        placeholder="Nom et prenom"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Email *</label>
                                    <input
                                        type="email"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        placeholder="email@domaine.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">
                            <SectionHeader eyebrow="Acces" title="Role et permissions" />

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Role principal *</label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    >
                                        {roles.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
                                </div>

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
                                                    onChange={() => togglePermission(permission.value)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                            <SectionHeader eyebrow="Invitation" title="Notification" />

                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={data.send_invitation}
                                        onChange={(e) => setData('send_invitation', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Envoyer un email d'invitation</div>
                                        <div className="text-xs text-gray-500 dark:text-white/50">Lien d'activation valable 7 jours.</div>
                                    </div>
                                </label>

                                {data.send_invitation && (
                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Message personnalise (optionnel)</label>
                                        <textarea
                                            rows={5}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                                            placeholder="Ajoutez un message pour cet utilisateur"
                                            value={data.custom_message}
                                            onChange={(e) => setData('custom_message', e.target.value)}
                                        />
                                        {errors.custom_message && <p className="mt-1 text-xs text-red-600">{errors.custom_message}</p>}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-5 shadow-[0_18px_40px_-28px_rgba(47,106,17,0.28)] dark:border-primary/15 dark:from-primary/10 dark:to-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                                    {data.send_invitation ? <Mail className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                </div>
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    {data.send_invitation
                                        ? "Une invitation email est recommandee pour laisser l'utilisateur definir son mot de passe."
                                        : 'Le compte sera cree actif immediatement sans invitation.'}
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
