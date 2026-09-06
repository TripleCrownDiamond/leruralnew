import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { User } from '@/types';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    Bookmark,
    LogOut,
    CreditCard,
    ShoppingBag,
    Percent,
    MessageSquare,
    Globe,
    Share2,
    File,
    Layout,
    BarChart2,
    DollarSign,
    Megaphone,
    Newspaper,
    Youtube,
    X,
    Sparkles,
    Clock,
    Radio,
    FileImage,
    CalendarCheck,
} from 'lucide-react';

interface SidebarProps {
    user: User & { avatar?: string };
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

type MenuLink = {
    label: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
};

type MenuGroup = {
    title: string;
    eyebrow: string;
    items: MenuLink[];
};

function safeRoute(name: string, params?: any): string {
    try {
        if (route().has(name)) return route(name, params);
        return '#';
    } catch {
        return '#';
    }
}

function safeCurrent(pattern: string): boolean {
    try {
        return Boolean(route().current(pattern));
    } catch {
        return false;
    }
}

export default function Sidebar({ user, isOpen, setIsOpen }: SidebarProps) {
    const role = user.role;
    const permissions = user.permissions ?? [];
    const canWriteArticles = role === 'admin'
        || role === 'editor'
        || permissions.includes('create_articles')
        || permissions.includes('edit_articles')
        || permissions.includes('manage_articles')
        || permissions.includes('manage_own_content');
    const navRef = useRef<HTMLElement | null>(null);

    const adminGroups: MenuGroup[] = [
        {
            title: 'Vue globale',
            eyebrow: '01',
            items: [
                { label: 'Tableau de bord', href: safeRoute('dashboard'), icon: <LayoutDashboard size={18} />, active: safeCurrent('dashboard') },
                { label: 'Statistiques', href: safeRoute('dashboard.stats.index'), icon: <BarChart2 size={18} />, active: safeCurrent('dashboard.stats.*') },
            ],
        },
        {
            title: 'Redaction',
            eyebrow: '02',
            items: [
                                { label: 'Articles', href: safeRoute('dashboard.articles.index'), icon: <FileText size={18} />, active: safeCurrent('dashboard.articles.*') },
                { label: 'Categories', href: safeRoute('dashboard.categories.index'), icon: <Layout size={18} />, active: safeCurrent('dashboard.categories.*') },
                { label: 'Parutions', href: safeRoute('dashboard.press-papers.index'), icon: <FileText size={18} />, active: safeCurrent('dashboard.press-papers.*') },
                { label: 'Commentaires', href: safeRoute('dashboard.comments.index'), icon: <MessageSquare size={18} />, active: safeCurrent('dashboard.comments.*') },
                { label: 'Sondages', href: safeRoute('dashboard.polls.index'), icon: <BarChart2 size={18} />, active: safeCurrent('dashboard.polls.*') },
                { label: 'Annonces', href: safeRoute('dashboard.announcements.index'), icon: <Megaphone size={18} />, active: safeCurrent('dashboard.announcements.*') },
                { label: 'Pages statiques', href: safeRoute('dashboard.static-pages.index'), icon: <File size={18} />, active: safeCurrent('dashboard.static-pages.*') },
            ],
        },
        {
            title: 'Medias et diffusion',
            eyebrow: '03',
            items: [
                { label: 'Emissions', href: safeRoute('dashboard.emissions.index'), icon: <Newspaper size={18} />, active: safeCurrent('dashboard.emissions.*') },
                { label: 'Web TV / YouTube', href: safeRoute('dashboard.web-tv.index'), icon: <Newspaper size={18} />, active: safeCurrent('dashboard.web-tv.*') },
                { label: 'Prix des marches', href: safeRoute('dashboard.commodity-prices.index'), icon: <DollarSign size={18} />, active: safeCurrent('dashboard.commodity-prices.*') },
                { label: 'Agenda', href: safeRoute('dashboard.agendas.index'), icon: <Clock size={18} />, active: safeCurrent('dashboard.agendas.*') },
                { label: 'SAFEB 2026', href: safeRoute('dashboard.safeb-registrations.index'), icon: <CalendarCheck size={18} />, active: safeCurrent('dashboard.safeb-registrations.*') },
                { label: 'Publicites', href: safeRoute('dashboard.advertisements.index'), icon: <Megaphone size={18} />, active: safeCurrent('dashboard.advertisements.*') },
                { label: 'Partenaires', href: safeRoute('dashboard.partners.index'), icon: <Share2 size={18} />, active: safeCurrent('dashboard.partners.*') },
                { label: 'Lives', href: safeRoute('dashboard.live-streams.index'), icon: <Radio size={18} />, active: safeCurrent('dashboard.live-streams.*') },
                { label: 'Media', href: safeRoute('dashboard.media.index'), icon: <FileImage size={18} />, active: safeCurrent('dashboard.media.*') },
            ],
        },
        {
            title: 'Commerce',
            eyebrow: '04',
            items: [
                { label: "Plans d'abonnement", href: safeRoute('dashboard.subscription-plans.index'), icon: <Percent size={18} />, active: safeCurrent('dashboard.subscription-plans.*') },
                { label: 'Souscriptions', href: safeRoute('dashboard.subscriptions.index'), icon: <ShoppingBag size={18} />, active: safeCurrent('dashboard.subscriptions.*') },
                { label: 'Paiements', href: safeRoute('dashboard.payments.index'), icon: <DollarSign size={18} />, active: safeCurrent('dashboard.payments.*') },
                                { label: 'Moyens de paiement', href: safeRoute('dashboard.settings.payment'), icon: <CreditCard size={18} />, active: safeCurrent('dashboard.settings.payment*') },
                { label: 'Codes promo', href: safeRoute('dashboard.promo-codes.index'), icon: <Percent size={18} />, active: safeCurrent('dashboard.promo-codes.*') },
            ],
        },
        {
            title: 'Configuration',
            eyebrow: '05',
            items: [
                { label: 'Utilisateurs', href: safeRoute('dashboard.users.index'), icon: <Users size={18} />, active: safeCurrent('dashboard.users.*') },
                { label: 'Widgets', href: safeRoute('dashboard.widgets.index'), icon: <Layout size={18} />, active: safeCurrent('dashboard.widgets.*') },
                { label: 'Reseaux sociaux', href: safeRoute('dashboard.settings.socials'), icon: <Share2 size={18} />, active: safeCurrent('dashboard.settings.socials*') },
                { label: 'WhatsApp flottant', href: safeRoute('dashboard.settings.whatsapp'), icon: <MessageSquare size={18} />, active: safeCurrent('dashboard.settings.whatsapp*') },
                { label: 'Tracking & pixels', href: safeRoute('dashboard.settings.integrations'), icon: <Globe size={18} />, active: safeCurrent('dashboard.settings.integrations*') },
                { label: 'Pied de page', href: safeRoute('dashboard.footer.index'), icon: <Globe size={18} />, active: safeCurrent('dashboard.footer.*') },
                { label: 'Mon profil', href: safeRoute('profile.edit'), icon: <Settings size={18} />, active: safeCurrent('profile.edit') },
            ],
        },
    ];

    const editorGroups: MenuGroup[] = [
        {
            title: 'Redaction',
            eyebrow: '01',
            items: [
                { label: "Tableau de bord", href: safeRoute('dashboard'), icon: <LayoutDashboard size={18} />, active: safeCurrent('dashboard') },
                { label: 'Mes articles', href: safeRoute('dashboard.articles.index'), icon: <FileText size={18} />, active: safeCurrent('dashboard.articles.*') },
            ],
        },
        {
            title: 'Compte',
            eyebrow: '02',
            items: [
                { label: 'Mon profil', href: safeRoute('profile.edit'), icon: <Settings size={18} />, active: safeCurrent('profile.edit') },
            ],
        },
    ];

    const userGroups: MenuGroup[] = [
        {
            title: 'Mon espace',
            eyebrow: '01',
            items: [
                { label: 'Accueil', href: safeRoute('dashboard'), icon: <LayoutDashboard size={18} />, active: safeCurrent('dashboard') },
            ],
        },
        {
            title: 'Achats & abonnements',
            eyebrow: '02',
            items: [
                { label: 'Mes abonnements', href: safeRoute('user.subscription'), icon: <CreditCard size={18} />, active: safeCurrent('user.subscription') },
                { label: "Historique d'achats", href: safeRoute('user.purchases'), icon: <ShoppingBag size={18} />, active: safeCurrent('user.purchases') },
            ],
        },
        {
            title: 'Favoris',
            eyebrow: '03',
            items: [
                { label: 'Articles sauvegardes', href: safeRoute('user.saved-articles'), icon: <Bookmark size={18} />, active: safeCurrent('user.saved-articles') },
            ],
        },
        {
            title: 'Compte',
            eyebrow: '04',
            items: [
                { label: 'Parametres', href: safeRoute('profile.edit'), icon: <Settings size={18} />, active: safeCurrent('profile.edit') },
            ],
        },
    ];

    const groups = role === 'admin' ? adminGroups : canWriteArticles ? editorGroups : userGroups;
    const roleLabel = role === 'admin' ? 'Administration' : canWriteArticles ? 'Redaction' : 'Abonne';

    useEffect(() => {
        const container = navRef.current;
        if (!container) return;

        const active = container.querySelector<HTMLElement>('[data-active=\"true\"]');
        if (!active) return;

        const targetTop = active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
        container.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
    }, [isOpen, role]);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-gray-950/60 backdrop-blur-sm transition-opacity lg:hidden ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-gray-950 text-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Dot texture */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
                />
                <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-10 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative flex h-full flex-col">
                    {/* Brand rail header */}
                    <div className="flex h-20 items-center justify-between border-b border-white/10 px-6 shrink-0">
                        <Link href="/" className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-primary">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                                </span>
                                <span>LE RURAL</span>
                            </div>
                            <span className="font-heading text-xl font-black uppercase tracking-tight text-white leading-none">
                                {roleLabel}
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                            aria-label="Fermer le menu"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* User profile card */}
                    <div className="px-4 py-5 shrink-0">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div aria-hidden="true" className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
                            <div className="relative flex items-center gap-3">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/60"
                                    />
                                ) : (
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 font-heading text-base font-black text-white shadow-lg shadow-primary/30">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-bold text-white">{user.name}</div>
                                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        {roleLabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav ref={navRef} className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-4">
                        {groups.map((group) => (
                            <MenuGroupBlock key={group.title} group={group} />
                        ))}
                    </nav>

                    {/* Footer logout */}
                    <div className="border-t border-white/10 p-4 shrink-0">
                        <Link
                            href={safeRoute('logout')}
                            method="post"
                            as="button"
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200"
                        >
                            <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Deconnexion
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

function MenuGroupBlock({ group }: { group: MenuGroup }) {
    return (
        <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 px-3 text-[9px] font-black uppercase tracking-[0.28em] text-white/40">
                <span className="tabular-nums text-primary">{group.eyebrow}</span>
                <span className="h-px w-4 bg-white/10" />
                <span>{group.title}</span>
            </div>
            <div className="space-y-0.5">
                {group.items.map((item) => (
                    <MenuItem key={item.label} {...item} />
                ))}
            </div>
        </div>
    );
}

function MenuItem({ href, icon, label, active = false }: MenuLink) {
    return (
        <Link
            href={href}
            data-active={active ? "true" : "false"}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                    ? 'bg-gradient-to-r from-primary/25 via-primary/15 to-transparent text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
            }`}
        >
            {active && (
                <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
            )}
            <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                    active
                        ? 'bg-primary text-white shadow-lg shadow-primary/40'
                        : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
                }`}
            >
                {icon}
            </span>
            <span className="flex-1 truncate">{label}</span>
            {active && <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
        </Link>
    );
}





