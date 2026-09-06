import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Download, Eye, FileText, Film, Globe2, Inbox, ListChecks, Mic2, PhoneCall, RotateCcw, Store, Trash2, UserPlus, Users, Video, X } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { Checkbox } from '@/Components/ui/checkbox';

interface Registration {
    id: number;
    type: 'panel' | 'partner' | 'stand' | 'masterclass' | 'pitch' | 'culinary' | 'film';
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    option_label: string | null;
    specialty: string | null;
    message: string | null;
    files: Array<{ path: string; name: string; url: string }> | null;
    status: 'new' | 'contacted' | 'confirmed';
    ip_address: string | null;
    created_at: string;
}

interface Paginator {
    data: Registration[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    registrations: Paginator;
    stats: {
        total: number;
        panel: number;
        partner: number;
        stand: number;
        masterclass: number;
        pitch: number;
        culinary: number;
        film: number;
        new: number;
    };
    filters: { type?: string; status?: string; search?: string };
}

const TYPE_META: Record<Registration['type'], { label: string; tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral'; icon: ReactNode }> = {
    panel: { label: 'Participant au panel', tone: 'info', icon: <UserPlus className="h-3.5 w-3.5" /> },
    partner: { label: 'Partenaire', tone: 'success', icon: <Users className="h-3.5 w-3.5" /> },
    stand: { label: 'Reservation de stand', tone: 'warning', icon: <Store className="h-3.5 w-3.5" /> },
    masterclass: { label: 'Masterclass', tone: 'neutral', icon: <Mic2 className="h-3.5 w-3.5" /> },
    pitch: { label: 'Concours de pitch', tone: 'info', icon: <FileText className="h-3.5 w-3.5" /> },
    culinary: { label: "Concours d'art culinaire", tone: 'success', icon: <Globe2 className="h-3.5 w-3.5" /> },
    film: { label: 'Concours de films', tone: 'danger', icon: <Film className="h-3.5 w-3.5" /> },
};

const STATUS_META: Record<Registration['status'], { label: string; tone: 'info' | 'warning' | 'success' }> = {
    new: { label: 'Nouveau', tone: 'info' },
    contacted: { label: 'Contacte', tone: 'warning' },
    confirmed: { label: 'Confirme', tone: 'success' },
};

export default function Index({ registrations, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [typeFilter, setTypeFilter] = useState(filters.type ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [selected, setSelected] = useState<Registration | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (
            search === (filters.search ?? '') &&
            typeFilter === (filters.type ?? 'all') &&
            statusFilter === (filters.status ?? 'all')
        ) {
            return;
        }

        const timer = setTimeout(() => {
            router.visit(route('dashboard.safeb-registrations.index'), {
                data: {
                    search: search || undefined,
                    type: typeFilter !== 'all' ? typeFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, typeFilter, statusFilter, filters]);

    const resetFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setStatusFilter('all');
        router.visit(route('dashboard.safeb-registrations.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const exportHref = useMemo(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const qs = params.toString();

        return route('dashboard.safeb-registrations.export') + (qs ? `?${qs}` : '');
    }, [search, typeFilter, statusFilter]);

    const toggleSelectAll = () => {
        if (selectedIds.length === registrations.data.length) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(registrations.data.map((registration) => registration.id));
    };

    const toggleSelect = (registrationId: number) => {
        setSelectedIds((current) =>
            current.includes(registrationId)
                ? current.filter((id) => id !== registrationId)
                : [...current, registrationId],
        );
    };

    const changeStatus = (registration: Registration, status: Registration['status']) => {
        if (registration.status === status) return;

        router.patch(route('dashboard.safeb-registrations.update', registration.id), { status }, { preserveScroll: true });
    };

    const handleBulkStatus = (status: Registration['status']) => {
        const count = bulkCounts[status];

        if (!count) return;

        const label = STATUS_META[status].label;
        const confirmMessage =
            status === 'confirmed'
                ? `Confirmer ${count} inscription(s) ? Des emails de confirmation seront envoyes aux inscrits.`
                : `Passer ${count} inscription(s) au statut "${label}" ?`;

        if (confirm(confirmMessage)) {
            router.post(
                route('dashboard.safeb-registrations.bulk-status'),
                { registration_ids: selectedIds, status },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedIds([]),
                },
            );
        }
    };

    const handleBulkDelete = () => {
        if (!selectedIds.length) return;

        if (confirm(`Supprimer ${selectedIds.length} inscription(s) ?`)) {
            router.post(
                route('dashboard.safeb-registrations.bulk-delete'),
                { registration_ids: selectedIds },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedIds([]),
                },
            );
        }
    };

    const remove = (registration: Registration) => {
        if (confirm(`Supprimer l'inscription de ${registration.name} ?`)) {
            router.delete(route('dashboard.safeb-registrations.destroy', registration.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (selected?.id === registration.id) setSelected(null);
                    setSelectedIds((current) => current.filter((id) => id !== registration.id));
                },
            });
        }
    };

    const bulkNewCount = useMemo(
        () => registrations.data.filter((registration) => selectedIds.includes(registration.id) && registration.status !== 'new').length,
        [registrations.data, selectedIds],
    );

    const bulkContactableCount = useMemo(
        () => registrations.data.filter((registration) => selectedIds.includes(registration.id) && registration.status !== 'contacted').length,
        [registrations.data, selectedIds],
    );

    const bulkConfirmableCount = useMemo(
        () => registrations.data.filter((registration) => selectedIds.includes(registration.id) && registration.status !== 'confirmed').length,
        [registrations.data, selectedIds],
    );

    const bulkCounts: Record<Registration['status'], number> = {
        new: bulkNewCount,
        contacted: bulkContactableCount,
        confirmed: bulkConfirmableCount,
    };

    const from = registrations.total === 0 ? 0 : (registrations.current_page - 1) * registrations.per_page + 1;
    const to = registrations.total === 0 ? 0 : Math.min(registrations.current_page * registrations.per_page, registrations.total);

    const statCards = [
        { icon: <Inbox className="h-4 w-4" />, label: 'Inscriptions', value: stats.total, tone: 'neutral' as const },
        { icon: <UserPlus className="h-4 w-4" />, label: 'Panels', value: stats.panel, tone: 'info' as const },
        { icon: <Users className="h-4 w-4" />, label: 'Partenaires', value: stats.partner, tone: 'success' as const },
        { icon: <Store className="h-4 w-4" />, label: 'Stands', value: stats.stand, tone: 'warning' as const },
        { icon: <Mic2 className="h-4 w-4" />, label: 'Masterclass', value: stats.masterclass, tone: 'info' as const },
        { icon: <FileText className="h-4 w-4" />, label: 'Pitch', value: stats.pitch, tone: 'success' as const },
        { icon: <Globe2 className="h-4 w-4" />, label: 'Culinaire', value: stats.culinary, tone: 'warning' as const },
        { icon: <Film className="h-4 w-4" />, label: 'Films', value: stats.film, tone: 'danger' as const },
    ];

    return (
        <DashboardLayout title="SAFEB 2026">
            <Head title="SAFEB 2026" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Evenement"
                    title="SAFEB 2026"
                    subtitle="Consultez et traitez les inscriptions au Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin."
                    icon={<CalendarCheck className="h-6 w-6" />}
                    meta={`${stats.total} inscriptions`}
                    actions={
                        <>
                            {selectedIds.length > 0 && (
                                <>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                                        <ListChecks className="h-3.5 w-3.5" />
                                        {selectedIds.length} inscription(s) selectionnee(s)
                                    </span>
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        icon={<X className="h-3.5 w-3.5" />}
                                        onClick={() => setSelectedIds([])}
                                        title="Tout deselectonner"
                                    >
                                        Tout deselectonner
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                                        onClick={() => handleBulkStatus('new')}
                                        disabled={bulkNewCount === 0}
                                    >
                                        Nouveau ({bulkNewCount})
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        icon={<PhoneCall className="h-3.5 w-3.5" />}
                                        onClick={() => handleBulkStatus('contacted')}
                                        disabled={bulkContactableCount === 0}
                                    >
                                        Contacte ({bulkContactableCount})
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                        onClick={() => handleBulkStatus('confirmed')}
                                        disabled={bulkConfirmableCount === 0}
                                    >
                                        Confirmer ({bulkConfirmableCount})
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        onClick={handleBulkDelete}
                                    >
                                        Supprimer ({selectedIds.length})
                                    </AdminButton>
                                </>
                            )}
                            <AdminLinkButton
                                href={exportHref}
                                as="a"
                                variant="secondary"
                                size="sm"
                                icon={<Download className="h-3.5 w-3.5" />}
                            >
                                Export CSV
                            </AdminLinkButton>
                            {stats.new > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-300 ring-1 ring-inset ring-amber-400/30">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    </span>
                                    {stats.new} nouveau(x)
                                </span>
                            )}
                        </>
                    }
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {statCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par nom, email, telephone ou organisation..."
                    filters={
                        <div className="flex flex-wrap gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'panel', label: 'Panels' },
                                { key: 'partner', label: 'Partenaires' },
                                { key: 'stand', label: 'Stands' },
                                { key: 'masterclass', label: 'Masterclass' },
                                { key: 'pitch', label: 'Pitch' },
                                { key: 'culinary', label: 'Culinaire' },
                                { key: 'film', label: 'Films' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setTypeFilter(opt.key)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        typeFilter === opt.key
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
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="all">Statut: tout</option>
                                <option value="new">Nouveau</option>
                                <option value="contacted">Contacte</option>
                                <option value="confirmed">Confirme</option>
                            </select>

                            {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                                <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                                    Reinitialiser
                                </AdminButton>
                            )}
                        </div>
                    }
                />

                <AdminCard className="overflow-hidden">
                    {registrations.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Inbox className="h-7 w-7" />}
                            title="Aucune inscription"
                            subtitle="Les inscriptions du site SAFEB apparaitront ici des que les visiteurs utiliseront les formulaires."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-left">
                                                <Checkbox
                                                    checked={registrations.data.length > 0 && selectedIds.length === registrations.data.length}
                                                    onCheckedChange={toggleSelectAll}
                                                    aria-label="Selectionner tout"
                                                />
                                            </th>
                                            <th className="px-5 py-3">Contact</th>
                                            <th className="px-5 py-3">Organisation</th>
                                            <th className="px-5 py-3">Type</th>
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.data.map((registration) => {
                                            const typeMeta = TYPE_META[registration.type];
                                            const statusMeta = STATUS_META[registration.status];

                                            return (
                                                <tr
                                                    key={registration.id}
                                                    className={`border-b border-gray-100 transition-colors hover:bg-primary/[0.035] dark:border-white/5 dark:hover:bg-white/[0.03] ${
                                                        selectedIds.includes(registration.id) ? 'bg-primary/[0.04] dark:bg-white/[0.04]' : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-4">
                                                        <Checkbox
                                                            checked={selectedIds.includes(registration.id)}
                                                            onCheckedChange={() => toggleSelect(registration.id)}
                                                            aria-label={`Selectionner ${registration.name}`}
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">{registration.name}</div>
                                                        <div className="mt-0.5 text-xs text-gray-500 dark:text-white/50">{registration.email}</div>
                                                        {registration.phone && (
                                                            <div className="mt-0.5 text-xs text-gray-400 dark:text-white/40">{registration.phone}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="text-gray-700 dark:text-white/80">{registration.organization || '-'}</div>
                                                        {registration.option_label && (
                                                            <div className="mt-0.5 max-w-[220px] truncate text-xs text-primary dark:text-primary">{registration.option_label}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <AdminStatusPill tone={typeMeta.tone}>
                                                            {typeMeta.icon}
                                                            {typeMeta.label}
                                                        </AdminStatusPill>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-white/60">{formatDate(registration.created_at)}</td>
                                                    <td className="px-5 py-4">
                                                        <select
                                                            value={registration.status}
                                                            onChange={(e) => changeStatus(registration, e.target.value as Registration['status'])}
                                                            className={`h-9 rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.1em] outline-none transition focus:ring-2 focus:ring-primary/20 ${
                                                                statusMeta.tone === 'success'
                                                                    ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                                    : statusMeta.tone === 'warning'
                                                                      ? 'border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                                                                      : 'border-sky-300/70 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'
                                                            }`}
                                                        >
                                                            <option value="new">Nouveau</option>
                                                            <option value="contacted">Contacte</option>
                                                            <option value="confirmed">Confirme</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <AdminButton
                                                                variant="secondary"
                                                                size="icon"
                                                                icon={<Eye className="h-4 w-4" />}
                                                                onClick={() => setSelected(registration)}
                                                                title="Voir le detail"
                                                            />
                                                            <AdminButton
                                                                variant="danger"
                                                                size="icon"
                                                                icon={<Trash2 className="h-4 w-4" />}
                                                                onClick={() => remove(registration)}
                                                                title="Supprimer"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={registrations.links} from={from} to={to} total={registrations.total} />
                        </>
                    )}
                </AdminCard>
            </div>

            {selected && <RegistrationModal registration={selected} onClose={() => setSelected(null)} onDelete={() => remove(selected)} />}
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }) {
    const tones: Record<string, string> = {
        neutral: 'from-gray-500/10 to-gray-500/5 text-gray-700 ring-gray-500/20 dark:text-gray-200',
        info: 'from-sky-500/15 to-sky-500/5 text-sky-700 ring-sky-500/20 dark:text-sky-300',
        success: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
        warning: 'from-amber-500/15 to-amber-500/5 text-amber-700 ring-amber-500/20 dark:text-amber-300',
        danger: 'from-red-500/15 to-red-500/5 text-red-700 ring-red-500/20 dark:text-red-300',
    };

    return (
        <div className={`rounded-2xl bg-gradient-to-br p-4 ring-1 ring-inset ${tones[tone]}`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.14em]">{label}</p>
                {icon}
            </div>
            <p className="mt-2 text-2xl font-black leading-none">{value}</p>
        </div>
    );
}

function RegistrationModal({
    registration,
    onClose,
    onDelete,
}: {
    registration: Registration;
    onClose: () => void;
    onDelete: () => void;
}) {
    const typeMeta = TYPE_META[registration.type];
    const statusMeta = STATUS_META[registration.status];

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Detail inscription</p>
                        <h3 className="mt-1 font-heading text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            {registration.name}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Fermer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <AdminStatusPill tone={typeMeta.tone}>
                            {typeMeta.icon}
                            {typeMeta.label}
                        </AdminStatusPill>
                        <AdminStatusPill tone={statusMeta.tone}>{statusMeta.label}</AdminStatusPill>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem label="Email" value={registration.email} />
                        <InfoItem label="Telephone" value={registration.phone ?? '-'} />
                        <InfoItem label="Organisation" value={registration.organization ?? '-'} />
                        <InfoItem label="Option choisie" value={registration.option_label ?? '-'} />
                        {(registration.type === 'culinary' || registration.type === 'film') && registration.specialty && (
                            <InfoItem
                                label={registration.type === 'culinary' ? 'Specialite culinaire' : 'Titre du film'}
                                value={registration.specialty}
                            />
                        )}
                        <InfoItem label="Date d'inscription" value={formatDate(registration.created_at)} />
                        <InfoItem label="Adresse IP" value={registration.ip_address ?? '-'} />
                    </div>

                    {registration.message && (
                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Message</p>
                            <p className="whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-white/5 dark:text-white/80">
                                {registration.message}
                            </p>
                        </div>
                    )}

                    {registration.files && registration.files.length > 0 && (
                        <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Fichiers uploades</p>
                            <div className="space-y-2">
                                {registration.files.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/30 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/[0.08]"
                                    >
                                        {file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.avi') || file.name.endsWith('.webm') ? (
                                            <Video className="h-5 w-5 shrink-0 text-primary" />
                                        ) : (
                                            <FileText className="h-5 w-5 shrink-0 text-primary" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold">{file.name}</p>
                                            <p className="text-[10px] text-gray-400">{file.url}</p>
                                        </div>
                                        <Download className="h-4 w-4 shrink-0 text-gray-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4 dark:border-white/10">
                    <AdminButton variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={onDelete}>
                        Supprimer
                    </AdminButton>
                    <AdminButton variant="primary" size="sm" onClick={onClose}>
                        Fermer
                    </AdminButton>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
