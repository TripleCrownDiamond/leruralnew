import { Button } from '@/Components/ui/button';
import { useEffect, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User, LogOut, LayoutDashboard, Sun, Moon, Facebook, Instagram, Linkedin, MessageCircle, Twitter, Video } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import { normalizeUrl, socialSettingKeys } from '@/lib/siteSettings';

interface FooterLinkItem {
    label: string;
    url: string;
}

function parseFooterLinks(rawValue?: string | null): FooterLinkItem[] {
    if (!rawValue) {
        return [];
    }

    return rawValue
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [labelPart, urlPart] = line.split('|');
            const label = labelPart?.trim() ?? '';
            const url = urlPart?.trim() || '#';

            if (!label) {
                return null;
            }

            return { label, url };
        })
        .filter((item): item is FooterLinkItem => Boolean(item));
}

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: { slug: string; name: string }[];
    locale: string;
    settings?: Record<string, string>;
    footerPages?: { id: number; slug: string; title: string }[];
}

export default function MobileMenu({
    isOpen,
    onClose,
    categories,
    locale,
    settings = {},
    footerPages = [],
}: MobileMenuProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const { theme, setTheme } = useTheme();
    const stableCategories = useMemo(() => categories, [categories]);
    const stableFooterPages = useMemo(() => footerPages, [footerPages]);
    const socialIcons: Record<string, React.ReactNode> = {
        social_facebook_url: <Facebook className="h-5 w-5" />,
        social_x_url: <Twitter className="h-5 w-5" />,
        social_instagram_url: <Instagram className="h-5 w-5" />,
        social_tiktok_url: <Video className="h-5 w-5" />,
        social_whatsapp_url: <MessageCircle className="h-5 w-5" />,
        social_linkedin_url: <Linkedin className="h-5 w-5" />,
    };
    const socialLinks = socialSettingKeys
        .map((item) => ({ ...item, url: normalizeUrl(settings[item.key]) }))
        .filter((item) => item.url);
    const footerGroupLinks = parseFooterLinks(settings.footer_group_links);
    const mobileMenuLinksTitle = settings.mobile_menu_links_title?.trim() || 'Liens utiles';
    const currentPath = useMemo(() => {
        const candidate = props.ziggy?.location;

        try {
            if (typeof candidate === 'string' && candidate.length > 0) {
                return new URL(candidate).pathname;
            }
        } catch {
            // Ignore malformed URL and fallback below.
        }

        if (typeof window !== 'undefined') {
            return window.location.pathname;
        }

        return '/';
    }, [props.ziggy?.location]);

    const getFooterPageHref = (slug: string) => (slug === 'contact' ? route('contact') : `/pages/${slug}`);

    const isFooterPageActive = (slug: string) => {
        if (slug === 'contact') {
            return route().current('contact') || route().current('pages.show', { slug: 'contact' });
        }

        return route().current('pages.show', { slug });
    };

    const isPressEcriteActive = route().current('press-papers.index');

    const isInternalPathActive = (url: string) => {
        if (!url || url === '#') return false;

        try {
            const parsed = new URL(url, 'https://lerural.local');
            return parsed.pathname === currentPath;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[linear-gradient(180deg,rgba(10,18,10,0.97)_0%,rgba(15,34,14,0.96)_100%)] text-white backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-4 bg-primary/40" />
                    <span className="text-gray-500 dark:text-gray-400">Menu</span>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" x2="6" y1="6" y2="18" />
                        <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-full border-white/10 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                    >
                        {theme === 'light' ? (
                            <>
                                <Sun className="h-4 w-4" />
                                <span>Mode clair</span>
                            </>
                        ) : (
                            <>
                                <Moon className="h-4 w-4" />
                                <span>Mode sombre</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="mb-8 space-y-4">
                    {user ? (
                        <div className="space-y-3">
                            <div className="mb-4 flex items-center gap-3 px-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-white/60">{user.email}</span>
                                </div>
                            </div>
                            <Link href={route('dashboard')} className="flex h-12 w-full items-center justify-start rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-primary hover:bg-primary hover:text-white" onClick={onClose}>
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                Tableau de bord
                            </Link>
                            <Link href={route('profile.edit')} className="flex h-12 w-full items-center justify-start rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-primary hover:bg-primary hover:text-white" onClick={onClose}>
                                <User className="mr-3 h-5 w-5" />
                                {locale === 'en' ? 'Profile' : 'Mon profil'}
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex h-12 w-full items-center justify-start rounded-2xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700" onClick={onClose}>
                                <LogOut className="mr-3 h-5 w-5" />
                                {locale === 'en' ? 'Logout' : 'Deconnexion'}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Link href={route('login')} className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/14 hover:text-white" onClick={onClose}>
                                {locale === 'en' ? 'Login' : 'Connexion'}
                            </Link>
                            <Link href={route('register')} className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/85 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/20 transition-opacity hover:opacity-90" onClick={onClose}>
                                {locale === 'en' ? 'Subscribe' : "S'abonner"}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="mb-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/30" />
                        <span className="text-gray-500 dark:text-gray-400">Rubriques</span>
                    </h3>
                    <nav className="space-y-1.5">
                        {stableCategories.length > 0 ? (
                            stableCategories.map((c, idx) => (
                                <a
                                    key={`mobile-category-${c.slug}`}
                                    href={route('category.show', c.slug)}
                                    onClick={onClose}
                                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition-all hover:border-primary hover:bg-primary hover:text-white"
                                >
                                    <span className="inline-block w-6 text-[10px] font-black tabular-nums text-white/45 group-hover:text-white/70">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="flex-1">{c.name}</span>
                                    <span className="h-px w-4 bg-white/20 transition-all group-hover:w-8 group-hover:bg-white" />
                                </a>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                                Aucune rubrique disponible pour le moment.
                            </div>
                                                )}
                        <Link
                            href={route('press-papers.index')}
                            onClick={onClose}
                            className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition-all ${
                                isPressEcriteActive
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-white/10 bg-white/5 text-white hover:border-primary hover:bg-primary hover:text-white'
                            }`}
                        >
                            <span className={`h-px transition-all ${isPressEcriteActive ? 'w-8 bg-white' : 'w-4 bg-white/20 group-hover:w-8 group-hover:bg-white'}`} />
                            <span className="flex-1">Nos parutions</span>
                        </Link>
                    </nav>
                </div>

                <div className="mb-8">
                    <h3 className="mb-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/30" />
                        <span className="text-gray-500 dark:text-gray-400">Pages statiques</span>
                    </h3>
                    {stableFooterPages.length > 0 ? (
                        <div className="space-y-2">
                            {stableFooterPages.map((page) => {
                                const active = isFooterPageActive(page.slug);
                                const railClass = active ? 'h-px w-8 bg-white transition-all' : 'h-px w-4 bg-white/20 transition-all group-hover:w-8 group-hover:bg-white';

                                return (
                                    <Link
                                        key={page.id}
                                        href={getFooterPageHref(page.slug)}
                                        onClick={onClose}
                                        className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition-all ${
                                            active
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-white/10 bg-white/5 text-white hover:border-primary hover:bg-primary hover:text-white'
                                        }`}
                                    >
                                        <span className={railClass} />
                                        <span className="flex-1">{page.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                            Aucune page statique publiee.
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="mb-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/30" />
                        <span className="text-gray-500 dark:text-gray-400">{mobileMenuLinksTitle}</span>
                    </h3>
                    {footerGroupLinks.length > 0 ? (
                        <div className="space-y-2">
                            {footerGroupLinks.map((item) => {
                                const active = isInternalPathActive(item.url);
                                const itemClass = `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition-all ${
                                    active
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-white/10 bg-white/5 text-white hover:border-primary hover:bg-primary hover:text-white'
                                }`;
                                const railClass = active ? 'h-px w-8 bg-white transition-all' : 'h-px w-4 bg-white/20 transition-all group-hover:w-8 group-hover:bg-white';

                                return item.url.startsWith('/') ? (
                                    <Link key={item.label} href={item.url} onClick={onClose} className={itemClass}>
                                        <span className={railClass} />
                                        <span className="flex-1">{item.label}</span>
                                    </Link>
                                ) : (
                                    <a key={item.label} href={item.url} onClick={onClose} className={itemClass}>
                                        <span className={railClass} />
                                        <span className="flex-1">{item.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                            Aucun lien configure.
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="mb-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/30" />
                        <span className="text-gray-500 dark:text-gray-400">Infos et reseaux</span>
                    </h3>

                    {settings.mobile_menu_description && (
                        <p className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/75">
                            {settings.mobile_menu_description}
                        </p>
                    )}

                    <div className="mb-6 space-y-3 text-sm text-white/85">
                        {settings.contact_address && (
                            <div className="flex items-center gap-3">
                                <span className="text-primary">&bull;</span>
                                <span>{settings.contact_address}</span>
                            </div>
                        )}
                        {settings.contact_phone && (
                            <div className="flex items-center gap-3">
                                <span className="text-primary">&bull;</span>
                                <span>{settings.contact_phone}</span>
                            </div>
                        )}
                        {settings.contact_email && (
                            <div className="flex items-center gap-3">
                                <span className="text-primary">&bull;</span>
                                <span>{settings.contact_email}</span>
                            </div>
                        )}
                        {!settings.contact_address && !settings.contact_phone && !settings.contact_email && (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                                Coordonnees non configurees.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {socialLinks.length > 0 ? (
                            socialLinks.map((item) => (
                                <a
                                    key={item.key}
                                    href={item.url!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary hover:text-white"
                                    aria-label={item.label}
                                >
                                    {socialIcons[item.key]}
                                </a>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                                Reseaux sociaux non configures.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


