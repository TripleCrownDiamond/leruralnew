import { useState, Fragment } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { User, LogOut, LayoutDashboard, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ModeToggle } from '@/Components/ModeToggle';
import LiveSearch from '@/Components/LiveSearch';
import MobileMenu from '@/Components/MobileMenu';
import CookieBanner from '@/Components/CookieBanner';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const categories = props.categories ?? [];
    const t = props.translations ?? {};
    const locale = props.locale ?? 'fr';
    const settings = props.settings ?? {};

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { url } = usePage();
    
    const { 
        data: newsletterData, 
        setData: setNewsletterData, 
        post: postNewsletter, 
        processing: newsletterProcessing, 
        reset: resetNewsletter, 
        wasSuccessful: newsletterSuccess 
    } = useForm({
        email: '',
    });

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postNewsletter('/newsletter', {
            preserveScroll: true,
            onSuccess: () => {
                resetNewsletter();
            },
        });
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
            <Head title={title ? title : "1er Groupe de Presse Agricole"} />
            
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-white shadow-lg supports-[backdrop-filter]:bg-primary/95 backdrop-blur">
                <div className="container relative mx-auto px-4 h-20 flex items-center justify-between">
                    
                    {isSearchOpen ? (
                        <div className="w-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                            <div className="relative w-full max-w-2xl">
                                <LiveSearch isOpen={true} onClose={() => setIsSearchOpen(false)} className="w-full" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-800/80 text-white hover:bg-gray-700/90 hover:text-white shrink-0 border border-gray-600/50 backdrop-blur-sm z-10"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Left Section: Mobile Menu & Search */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Mobile Menu Button */}
                                <div className="md:hidden">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsMobileMenuOpen(true)}
                                        className="text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="4" x2="20" y1="12" y2="12" />
                                            <line x1="4" x2="20" y1="6" y2="6" />
                                            <line x1="4" x2="20" y1="18" y2="18" />
                                        </svg>
                                    </Button>
                                </div>

                                {/* Search Trigger */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="text-white hover:bg-white/10 hover:text-white"
                                >
                                    <Search className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Center Section: Logo */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Link href="/">
                                    <img
                                        src="/logos/logo-blanc.png"
                                        alt="Le Rural"
                                        className="h-12 w-auto md:h-16 object-contain"
                                    />
                                </Link>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Theme Switcher */}
                                <div className="hidden md:block">
                                    <ModeToggle className="text-white hover:bg-white/10 hover:text-white border-white/20" />
                                </div>

                                {/* Auth / Profile */}
                                {user ? (
                                    <div 
                                        className="relative ml-2 z-[60]"
                                        onMouseEnter={() => setIsUserMenuOpen(true)}
                                        onMouseLeave={() => setIsUserMenuOpen(false)}
                                    >
                                        <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 pr-3 hover:bg-white/20 transition-colors text-white">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="hidden text-sm font-medium md:block max-w-[100px] truncate">
                                                {user.name}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-white/70 hidden md:block" />
                                        </button>
                                        <Transition
                                            show={isUserMenuOpen}
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <div className="absolute right-0 z-[100] mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700">
                                                <div className="px-1 py-1">
                                                    <Link
                                                        href={route('dashboard')}
                                                        className="text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                                        Tableau de bord
                                                    </Link>
                                                    <Link
                                                        href={route('profile.edit')}
                                                        className="text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <User className="mr-2 h-4 w-4" />
                                                        Mon Profil
                                                    </Link>
                                                </div>
                                                <div className="px-1 py-1">
                                                    <Link
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        className="text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                    >
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        Déconnexion
                                                    </Link>
                                                </div>
                                            </div>
                                        </Transition>
                                    </div>
                                ) : (
                                    <div className="hidden items-center gap-2 md:flex ml-2">
                                        <Link href={route('login')}>
                                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                                                Connexion
                                            </Button>
                                        </Link>
                                        <Link href={route('register')}>
                                            <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                                                S'inscrire
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Category Nav - Centered */}
            <div className="sticky top-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 hidden md:block z-40 relative">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-center overflow-x-auto py-3 gap-6 no-scrollbar">
                        {categories.map((category: any) => (
                            <Link
                                key={category.id}
                                href={route('category.show', category.slug)}
                                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-primary ${
                                    route().current('category.show', { slug: category.slug }) 
                                        ? 'text-primary font-bold' 
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                categories={categories}
                locale={locale}
                settings={settings}
            />

            <main className="flex-1 container mx-auto px-2 md:px-4 py-4 md:py-8">
                {children}
            </main>
            
            <footer className="border-t border-border bg-gray-900 text-white py-12">
                 <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-4">
                    <div className="space-y-4">
                        <img 
                            src="/logos/logo-blanc.png" 
                            alt="Le Rural" 
                            className="h-12 w-auto mb-4"
                        />
                        <p className="text-sm text-gray-400">
                            1er Groupe de Presse Agricole en Afrique de
                            l'Ouest. Information fiable et pertinente pour
                            le développement rural.
                        </p>
                         <div className="space-y-2 text-sm text-gray-400">
                                {settings.contact_address && (
                                    <div className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span>{settings.contact_address}</span>
                                    </div>
                                )}
                                {settings.contact_phone && (
                                    <div className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span>{settings.contact_phone}</span>
                                    </div>
                                )}
                                {settings.contact_email && (
                                    <div className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                width="20"
                                                height="16"
                                                x="2"
                                                y="4"
                                                rx="2"
                                            />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                        <span>{settings.contact_email}</span>
                                    </div>
                                )}
                            </div>
                    </div>
                     <div>
                            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                                Informations
                            </h5>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li key="mentions"><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
                                <li key="cgv"><a href="#" className="hover:text-primary transition-colors">CGV</a></li>
                                <li key="privacy"><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
                                <li key="cookies"><a href="#" className="hover:text-primary transition-colors">Gestion des cookies</a></li>
                                <li key="about"><a href="/a-propos" className="hover:text-primary transition-colors">Qui sommes-nous ?</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                                Le Groupe
                            </h5>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li key="entreprise"><a href="#" className="hover:text-primary transition-colors">Entreprise</a></li>
                                <li key="carrières"><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
                                <li key="opportunités"><a href="#" className="hover:text-primary transition-colors">Opportunités</a></li>
                                <li key="plurimédia"><a href="#" className="hover:text-primary transition-colors">Plurimédia</a></li>
                                <li key="communication"><a href="#" className="hover:text-primary transition-colors">Communication</a></li>
                                <li key="eima"><a href="#" className="hover:text-primary transition-colors">EIMA</a></li>
                                <li key="fondation"><a href="#" className="hover:text-primary transition-colors">Fondation Le Rural</a></li>
                            </ul>
                        </div>
                         <div>
                            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                                Newsletter
                            </h5>
                            <p className="mb-4 text-sm text-gray-400">
                                Recevez l'essentiel de l'actualité agricole
                                chaque matin.
                            </p>
                            {newsletterSuccess ? (
                                <div className="text-sm font-medium text-green-400">
                                    {locale === 'en' ? 'Subscribed successfully!' : 'Merci pour votre abonnement !'}
                                </div>
                            ) : (
                                <form className="flex" onSubmit={handleNewsletterSubmit}>
                                    <input
                                        type="email"
                                        value={newsletterData.email}
                                        onChange={(e) => setNewsletterData('email', e.target.value)}
                                        placeholder="Votre email"
                                        required
                                        className="w-full rounded-l border-none bg-white px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-primary"
                                    />
                                    <Button
                                        className="rounded-l-none bg-primary text-white hover:bg-primary/90"
                                        type="submit"
                                        disabled={newsletterProcessing}
                                    >
                                        {newsletterProcessing ? (
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'OK'}
                                    </Button>
                                </form>
                            )}
                        </div>
                </div>
                <div className="container mx-auto mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    <p>
                        &copy; {new Date().getFullYear()} Le Rural. Tous droits
                        réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}
