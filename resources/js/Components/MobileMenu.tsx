import { Button } from '@/Components/ui/button';
import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User, LogOut, LayoutDashboard, Sun, Moon, Globe } from 'lucide-react';
import LiveSearch from '@/Components/LiveSearch';
import { useTheme } from '@/Components/ThemeProvider';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: { slug: string; name: string }[];
    locale: string;
    settings?: Record<string, string>;
}

export default function MobileMenu({
    isOpen,
    onClose,
    categories,
    locale,
    settings = {},
}: MobileMenuProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md transition-all duration-300">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="text-xl font-bold text-primary">Menu</div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="text-foreground hover:bg-muted"
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
                        <line x1="18" x2="6" y1="6" y2="18" />
                        <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* Theme & Language Switchers */}
                <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="h-9 px-4 w-full flex items-center justify-center gap-2"
                        >
                            {theme === 'light' ? (
                                <>
                                    <Sun className="h-4 w-4" /> 
                                    <span>Mode Clair</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="h-4 w-4" /> 
                                    <span>Mode Sombre</span>
                                </>
                            )}
                        </Button>
                    </div>
                    
                    <div className="h-6 w-px bg-border" />
                    
                    <a
                        href={locale === 'en' ? '/' : '/en'}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                        <Globe className="h-4 w-4" />
                        {locale === 'en' ? 'FR' : 'EN'}
                    </a>
                </div>

                {/* Actions */}
                <div className="mb-8 space-y-4">
                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-2 mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                            <Link href={route('dashboard')} className="flex w-full items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground h-12" onClick={onClose}>
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                Tableau de bord
                            </Link>
                            <Link href={route('profile.edit')} className="flex w-full items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground h-12" onClick={onClose}>
                                <User className="mr-3 h-5 w-5" />
                                {locale === 'en' ? 'Profile' : 'Mon Profil'}
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex w-full items-center justify-start rounded-md bg-destructive px-4 py-2 text-base font-medium text-destructive-foreground hover:bg-destructive/90 h-12" onClick={onClose}>
                                <LogOut className="mr-3 h-5 w-5" />
                                {locale === 'en' ? 'Logout' : 'Déconnexion'}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Link href={route('login')} className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground h-12" onClick={onClose}>
                                {locale === 'en' ? 'Login' : 'Connexion'}
                            </Link>
                            <Link href={route('register')} className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary/90 h-12" onClick={onClose}>
                                {locale === 'en' ? 'Subscribe' : "S'abonner"}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h3 className="mb-4 text-sm font-bold uppercase text-muted-foreground">
                        Rubriques
                    </h3>
                    <nav className="space-y-2">
                        {categories.map((c) => (
                            <a
                                key={c.slug}
                                href={`#${c.slug}`}
                                onClick={onClose}
                                className="block rounded-md px-4 py-2 text-lg font-medium text-foreground hover:bg-muted hover:text-primary"
                            >
                                {c.name}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Other Info */}
                <div>
                    <h3 className="mb-4 text-sm font-bold uppercase text-muted-foreground">
                        Infos & Réseaux
                    </h3>

                    {/* Contact Info */}
                    <div className="mb-6 space-y-3 text-sm text-foreground">
                        {settings.contact_address && (
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary"
                                >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{settings.contact_address}</span>
                            </div>
                        )}
                        {settings.contact_phone && (
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{settings.contact_phone}</span>
                            </div>
                        )}
                        {settings.contact_email && (
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary"
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

                    <div className="flex gap-4">
                        <a
                            href="#"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary hover:text-white"
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
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary hover:text-white"
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
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary hover:text-white"
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
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary hover:text-white"
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
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                                <path d="m10 15 5-3-5-3z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
