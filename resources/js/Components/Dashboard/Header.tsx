import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, ChevronDown, LogOut, Menu as MenuIcon, Search, Settings, Sparkles, User as UserIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { User as UserType } from '@/types';
import { ModeToggle } from '@/Components/ModeToggle';

interface HeaderProps {
    user: UserType & { avatar?: string };
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

function safeRoute(name: string): string {
    try {
        if (typeof route === 'function' && route().has(name)) return route(name);
        return '#';
    } catch {
        return '#';
    }
}

function roleLabel(role?: string): string {
    switch ((role || '').toLowerCase()) {
        case 'admin':
            return 'Administration';
        case 'editor':
            return 'Rédaction';
        case 'user':
            return 'Abonné';
        default:
            return 'Compte';
    }
}

export default function Header({ user, sidebarOpen, setSidebarOpen }: HeaderProps) {
    const initial = user.name?.charAt(0).toUpperCase() ?? 'U';
    const now = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long' }).format(new Date());

    return (
        <header className="relative z-30 shrink-0 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80">
            {/* Top brand rail — ultra thin, editorial */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-white/70 dark:border-white/5 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span>LE RURAL</span>
                    <span className="hidden h-px w-6 bg-white/20 sm:inline-block" />
                    <span className="hidden text-white/50 sm:inline">{roleLabel(user.role)} · {now}</span>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Desk numérique · Afrique de l'Ouest</span>
                </div>
            </div>

            {/* Main bar */}
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-primary/50 lg:hidden"
                        aria-label="Ouvrir le menu"
                    >
                        <MenuIcon className="h-5 w-5" />
                    </button>

                    {/* Editorial search */}
                    <div className="group relative hidden w-full max-w-xl md:block">
                        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-gray-400 dark:text-white/40">
                            <Search className="h-4 w-4" />
                            <span className="hidden lg:inline">Rechercher</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Article, catégorie, abonné, paiement..."
                            className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50/70 pl-[6.5rem] pr-16 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/[0.08] lg:pl-[7.5rem]"
                        />
                        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-black tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50 lg:block">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Date pill — desktop only */}
                    <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gradient-to-r from-primary/5 to-emerald-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:border-white/10 dark:from-primary/10 dark:to-emerald-500/10 xl:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Édition du jour
                    </div>
                    <ModeToggle />

                    <span className="mx-1 hidden h-8 w-px bg-gray-200 dark:bg-white/10 sm:block" />

                    {/* Notification bell with primary dot */}
                    <button
                        type="button"
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-primary dark:text-white/70 dark:hover:border-white/10 dark:hover:bg-white/5"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-gray-950" />
                        </span>
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-1">
                        <Menu.Button className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-1.5 py-1.5 pr-3 transition-all hover:border-primary/40 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/50 dark:hover:bg-white/[0.08]">
                            <span className="sr-only">Menu utilisateur</span>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-primary/30"
                                />
                            ) : (
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-black text-white shadow-lg shadow-primary/30">
                                    {initial}
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-950" />
                                </div>
                            )}
                            <div className="hidden flex-col items-start text-left leading-none lg:flex">
                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                    {user.name}
                                </span>
                                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-primary">
                                    {roleLabel(user.role)}
                                </span>
                            </div>
                            <ChevronDown className="hidden h-4 w-4 text-gray-400 transition-transform group-data-[headlessui-state=open]:rotate-180 lg:block" />
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95 translate-y-2"
                            enterTo="transform opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100 translate-y-0"
                            leaveTo="transform opacity-0 scale-95 translate-y-2"
                        >
                            <Menu.Items className="absolute right-0 z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_25px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5 focus:outline-none dark:border-white/10 dark:bg-gray-950 dark:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)]">
                                {/* Header block */}
                                <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/30 px-4 py-4 text-white dark:border-white/5">
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 opacity-[0.08]"
                                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }}
                                    />
                                    <div className="relative flex items-center gap-3">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/20"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-base font-black text-white shadow-lg shadow-primary/40">
                                                {initial}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black">{user.name}</p>
                                            <p className="mt-0.5 truncate text-[10px] font-medium text-white/60">
                                                {user.email}
                                            </p>
                                            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-primary">
                                                <span className="h-1 w-1 rounded-full bg-primary" />
                                                {roleLabel(user.role)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={safeRoute('profile.edit')}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                                    active
                                                        ? 'bg-primary/10 text-primary dark:bg-primary/15'
                                                        : 'text-gray-700 dark:text-white/80'
                                                }`}
                                            >
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/60'}`}>
                                                    <UserIcon className="h-4 w-4" />
                                                </span>
                                                Mon profil
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={safeRoute('dashboard')}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                                    active
                                                        ? 'bg-primary/10 text-primary dark:bg-primary/15'
                                                        : 'text-gray-700 dark:text-white/80'
                                                }`}
                                            >
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/60'}`}>
                                                    <Settings className="h-4 w-4" />
                                                </span>
                                                Tableau de bord
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>

                                <div className="border-t border-gray-100 p-2 dark:border-white/5">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={safeRoute('logout')}
                                                method="post"
                                                as="button"
                                                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                                                    active
                                                        ? 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-red-500/20' : 'bg-red-500/10'} text-red-600 dark:text-red-400`}>
                                                    <LogOut className="h-4 w-4" />
                                                </span>
                                                Déconnexion
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
}
