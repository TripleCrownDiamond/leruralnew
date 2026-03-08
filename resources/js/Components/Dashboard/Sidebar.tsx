import { Link } from '@inertiajs/react';
import { User } from '@/types';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    Settings, 
    Bookmark, 
    LogOut,
    Menu,
    X,
    UserPlus,
    CreditCard,
    ShoppingBag,
    Percent,
    MessageSquare,
    Globe,
    File,
    Layout,
    BarChart2
} from 'lucide-react';

interface SidebarProps {
    user: User & { avatar?: string };
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ user, isOpen, setIsOpen }: SidebarProps) {
    const role = user.role;

    const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-6">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {title}
            </h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    const renderMenu = () => {
        switch(role) {
            case 'admin':
                return (
                    <>
                        <MenuSection title="Général">
                            <MenuItem href={route('dashboard')} icon={<LayoutDashboard size={20} />} label="Vue d'ensemble" active={route().current('dashboard')} />
                        </MenuSection>
                        
                        <MenuSection title="Gestion du contenu">
                            <MenuItem href={route('dashboard.articles.index')} icon={<FileText size={20} />} label="Articles" active={route().current('dashboard.articles.*')} />
                            <MenuItem href={route('dashboard.categories.index')} icon={<Layout size={20} />} label="Catégories" active={route().current('dashboard.categories.*')} />
                            <MenuItem href={route('dashboard.comments.index')} icon={<MessageSquare size={20} />} label="Commentaires" active={route().current('dashboard.comments.*')} />
                            <MenuItem href={route('dashboard.polls.index')} icon={<BarChart2 size={20} />} label="Sondages" active={route().current('dashboard.polls.*')} />
                            <MenuItem href={route('dashboard.pages.index')} icon={<File size={20} />} label="Pages" active={route().current('dashboard.pages.*')} />
                        </MenuSection>

                        <MenuSection title="Commerce">
                            <MenuItem href={route('dashboard.subscription-plans.index')} icon={<Percent size={20} />} label="Plans d'abonnement" active={route().current('dashboard.subscription-plans.*')} />
                            <MenuItem href={route('dashboard.payments.index')} icon={<CreditCard size={20} />} label="Paiements" active={route().current('dashboard.payments.*')} />
                            <MenuItem href={route('dashboard.subscriptions.index')} icon={<ShoppingBag size={20} />} label="Souscriptions" active={route().current('dashboard.subscriptions.*')} />
                        </MenuSection>

                        <MenuSection title="Configuration">
                            <MenuItem href={route('dashboard.settings.payment')} icon={<CreditCard size={20} />} label="Paiements" active={route().current('dashboard.settings.payment')} />
                            <MenuItem href={route('dashboard.widgets.index')} icon={<Layout size={20} />} label="Widgets" active={route().current('dashboard.widgets.*')} />
                            <MenuItem href={route('dashboard.footer.index')} icon={<Globe size={20} />} label="Pied de page" active={route().current('dashboard.footer.*')} />
                            <MenuItem href={route('profile.edit')} icon={<Users size={20} />} label="Mon Profil" active={route().current('profile.edit')} />
                        </MenuSection>
                    </>
                );
            case 'editor':
                return (
                    <>
                        <MenuItem href={route('dashboard')} icon={<LayoutDashboard size={20} />} label="Vue d'ensemble" active={route().current('dashboard')} />
                        
                        <MenuSection title="Rédaction">
                            <MenuItem href={route('dashboard.articles.index')} icon={<FileText size={20} />} label="Mes Articles" active={route().current('dashboard.articles.*')} />
                            <MenuItem href="#" icon={<UserPlus size={20} />} label="Brouillons" />
                        </MenuSection>

                        <MenuSection title="Compte">
                            <MenuItem href={route('profile.edit')} icon={<Settings size={20} />} label="Mon Profil" active={route().current('profile.edit')} />
                        </MenuSection>
                    </>
                );
            default: // Client & User
                return (
                    <>
                        <MenuItem href={route('dashboard')} icon={<LayoutDashboard size={20} />} label="Mon Espace" active={route().current('dashboard')} />
                        
                        <MenuSection title="Achats & Abonnements">
                            <MenuItem href={route('user.subscription')} icon={<CreditCard size={20} />} label="Mes Abonnements" active={route().current('user.subscription')} />
                            <MenuItem href={route('user.purchases')} icon={<ShoppingBag size={20} />} label="Historique d'achats" active={route().current('user.purchases')} />
                        </MenuSection>

                        <MenuSection title="Favoris">
                            <MenuItem href={route('user.saved-articles')} icon={<Bookmark size={20} />} label="Articles Sauvegardés" active={route().current('user.saved-articles')} />
                        </MenuSection>

                        <MenuSection title="Compte">
                            <MenuItem href={route('profile.edit')} icon={<Settings size={20} />} label="Paramètres" active={route().current('profile.edit')} />
                        </MenuSection>
                    </>
                );
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col transform bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 border-r border-gray-100 dark:border-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Area */}
                <div className="flex h-20 items-center justify-center border-b border-gray-100 dark:border-gray-800 px-6 shrink-0">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto" />
                    </Link>
                </div>

                {/* User Profile Summary */}
                <div className="px-6 py-8 shrink-0">
                    <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                        {user.avatar ? (
                            <img 
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm" 
                                src={user.avatar} 
                                alt={user.name} 
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-white shadow-lg shadow-primary/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h3>
                            <span className="truncate text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                {user.role === 'admin' ? 'Administrateur' : user.role === 'editor' ? 'Éditeur' : 'Membre'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    <nav>
                        {renderMenu()}
                    </nav>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-4 shrink-0">
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:shadow-md dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Déconnexion
                    </Link>
                </div>
            </aside>
        </>
    );
}

function MenuItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            }`}
        >
            <span className={`mr-3 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}
