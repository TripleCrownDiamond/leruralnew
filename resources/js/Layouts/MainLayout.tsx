import AdSpace from '@/Components/AdSpace';
import AnnouncementMarquee from '@/Components/AnnouncementMarquee';
import CookieBanner from '@/Components/CookieBanner';
import LiveSearch from '@/Components/LiveSearch';
import MobileMenu from '@/Components/MobileMenu';
import { ModeToggle } from '@/Components/ModeToggle';
import NotificationBell from '@/Components/NotificationBell';
import LiveNotificationToast from '@/Components/LiveNotificationToast';
import { Button } from '@/Components/ui/button';
import useSharedContent from '@/Hooks/useSharedContent';
import { asBool, normalizeUrl, socialSettingKeys } from '@/lib/siteSettings';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Facebook,
    Instagram,
    LayoutDashboard,
    Linkedin,
    LogOut,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Radio,
    Search,
    Sparkles,
    Twitter,
    User,
    Video,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
}

interface FooterLinkItem {
    label: string;
    url: string;
}

const defaultGroupLinks: FooterLinkItem[] = [
    { label: 'Entreprise', url: '/pages/entreprise' },
    { label: 'Carrieres', url: '/pages/carrieres' },
    { label: 'Opportunites', url: '/pages/opportunites' },
    { label: 'Plurimedia', url: '/pages/plurimedia' },
    { label: 'Communication', url: '/pages/communication' },
    { label: 'EIMA', url: '/pages/eima' },
    { label: 'Fondation LE RURAL', url: '/pages/fondation-le-rural' },
];

function parseFooterLinks(rawValue?: string | null): FooterLinkItem[] {
    if (!rawValue) {
        return defaultGroupLinks;
    }

    const links = rawValue
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

    return links.length > 0 ? links : defaultGroupLinks;
}

const SITE_NAME = 'LE RURAL';
const SITE_SLOGAN = '1er groupe de presse agricole en Afrique de l\'Ouest';
const DEFAULT_DESCRIPTION = `LE RURAL - ${SITE_SLOGAN}. Actualités, analyses et informations sur l'agriculture, l'élevage et le monde rural.`;

function resolveAbsoluteUrl(
    value: string | null | undefined,
    baseUrl: string,
    fallback?: string,
): string {
    const defaultFallback = fallback || `${baseUrl}/logos/logo.png`;
    
    if (!value) {
        return defaultFallback;
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
        return value.startsWith('//') ? `https:${value}` : value;
    }

    try {
        return new URL(value, baseUrl).href;
    } catch {
        return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
    }
}

export default function MainLayout({ children, title }: MainLayoutProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const { announcements, liveStreams } = useSharedContent();
    const categories = useMemo(
        () =>
            (props.categories ?? []).map((category: any) => ({
                ...category,
                name:
                    typeof category?.name === 'string' &&
                    category.name.trim().length > 0
                        ? category.name.trim()
                        : typeof category?.name_fr === 'string' &&
                            category.name_fr.trim().length > 0
                          ? category.name_fr.trim()
                          : typeof category?.slug === 'string'
                            ? category.slug
                            : '',
            })),
        [props.categories],
    );
    const footerPages = useMemo(
        () => props.footer_pages ?? [],
        [props.footer_pages],
    );
    const locale = props.locale ?? 'fr';
    const settings = props.settings ?? {};
    const seo = props.seo ?? {};
    const showAnnouncements = asBool(settings.widget_show_announcements, true);
    const socialIcons: Record<string, React.ReactNode> = {
        social_facebook_url: <Facebook className="h-4 w-4" />,
        social_x_url: <Twitter className="h-4 w-4" />,
        social_instagram_url: <Instagram className="h-4 w-4" />,
        social_tiktok_url: <Video className="h-4 w-4" />,
        social_whatsapp_url: <MessageCircle className="h-4 w-4" />,
        social_linkedin_url: <Linkedin className="h-4 w-4" />,
    };
    const socialLinks = socialSettingKeys
        .map((item) => ({ ...item, url: normalizeUrl(settings[item.key]) }))
        .filter((item) => item.url);

    const whatsappEnabled = asBool(settings.floating_whatsapp_enabled, true);
    const whatsappRawNumber = settings.floating_whatsapp_number?.trim() ?? '';
    const whatsappNumber = whatsappRawNumber.replace(/\D/g, '');
    const whatsappMessage = encodeURIComponent(
        settings.floating_whatsapp_message?.trim() ||
            "Bonjour LE RURAL, je souhaite plus d'informations.",
    );
    const whatsappHref = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
        : null;

    const [showBackToTop, setShowBackToTop] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const categoryRailRef = useRef<HTMLDivElement | null>(null);

    const scrollCategoryRail = (direction: 'left' | 'right') => {
        const rail = categoryRailRef.current;

        if (!rail) {
            return;
        }

        const amount = Math.max(rail.clientWidth * 0.7, 280);
        rail.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    const {
        data: newsletterData,
        setData: setNewsletterData,
        post: postNewsletter,
        processing: newsletterProcessing,
        reset: resetNewsletter,
        wasSuccessful: newsletterSuccess,
    } = useForm({
        email: '',
    });

    useEffect(() => {
        const onScroll = () => {
            setShowBackToTop(window.scrollY > 320);
            setHasScrolled(window.scrollY > 8);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postNewsletter('/newsletter', {
            preserveScroll: true,
            onSuccess: () => {
                resetNewsletter();
            },
        });
    };

    const editionDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
    }).format(new Date());
    const footerInfoTitle =
        settings.footer_info_title?.trim() || 'Informations';
    const footerGroupTitle = settings.footer_group_title?.trim() || 'Le Groupe';
    const footerNewsletterTitle =
        settings.footer_newsletter_title?.trim() || 'Newsletter';
    const footerNewsletterDescription =
        settings.footer_newsletter_description?.trim() ||
        "Recevez l'essentiel de l'actualite agricole chaque matin.";
    const footerTopBadge = settings.footer_top_badge?.trim() || 'LE RURAL';
    const footerTopTagline =
        settings.footer_top_tagline?.trim() || 'Media agricole';
    const footerBrandTitle = settings.footer_brand_title?.trim() || 'LE RURAL';
    const footerNewsletterPlaceholder =
        settings.footer_newsletter_placeholder?.trim() || 'Votre email';
    const footerGroupLinks = parseFooterLinks(settings.footer_group_links);
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

    const isInternalPathActive = (url: string) => {
        if (!url || url === '#') return false;

        try {
            const parsed = new URL(url, 'https://lerural.local');
            return parsed.pathname === currentPath;
        } catch {
            return false;
        }
    };

    const getFooterPageHref = (slug: string) =>
        slug === 'contact' ? route('contact') : `/pages/${slug}`;

    const isParutionsActive = route().current('press-papers.index');
    const isLiveActive = route().current('live.index');
    const isSafebActive = route().current('safeb.index');

    const isFooterPageActive = (slug: string) => {
        if (slug === 'contact') {
            return (
                route().current('contact') ||
                route().current('pages.show', { slug: 'contact' })
            );
        }

        return route().current('pages.show', { slug });
    };

    const baseUrl = (() => {
        const candidate = props.ziggy?.location;

        try {
            if (typeof candidate === 'string' && candidate.length > 0) {
                return new URL(candidate).origin;
            }
        } catch {
            // Ignore malformed URL and fallback below.
        }

        if (typeof window !== 'undefined') {
            return window.location.origin;
        }

        return 'https://lerural.bj';
    })();

    // Pour la page d'accueil, ajouter le slogan au titre
    const isHomePage = !title && (!seo.title || seo.title === SITE_NAME);
    const siteSlogan = seo.slogan?.trim() || settings.site_slogan?.trim() || SITE_SLOGAN;
    const pageTitle = isHomePage
        ? `${SITE_NAME} - ${siteSlogan}`
        : title
          ? `${title} | ${SITE_NAME}`
          : seo.title?.trim() || SITE_NAME;
    const pageDescription = seo.description?.trim() || DEFAULT_DESCRIPTION;
    // Priorité pour l'image: seo.image > settings.seo_default_image > logo
    const defaultOgImage = settings.seo_default_image || '/logos/logo.png';
    const pageImage = resolveAbsoluteUrl(
        seo.image || defaultOgImage,
        baseUrl,
    );
    const pageUrl = seo.url?.trim() || props.ziggy?.location || baseUrl;
    const pageType = seo.type?.trim() || 'website';
    const pageLocale = seo.locale?.trim() || locale.replace('_', '-');

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <Head title={pageTitle}>
                <meta
                    head-key="description"
                    name="description"
                    content={pageDescription}
                />
                <meta
                    head-key="og:type"
                    property="og:type"
                    content={pageType}
                />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content={SITE_NAME}
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={pageTitle}
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={pageDescription}
                />
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={pageImage}
                />
                <meta
                    head-key="og:image:secure_url"
                    property="og:image:secure_url"
                    content={pageImage}
                />
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content={pageTitle}
                />
                <meta head-key="og:url" property="og:url" content={pageUrl} />
                <meta
                    head-key="og:locale"
                    property="og:locale"
                    content={pageLocale}
                />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={pageTitle}
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={pageDescription}
                />
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={pageImage}
                />
                <link head-key="canonical" rel="canonical" href={pageUrl} />
            </Head>

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full text-white shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] backdrop-blur">
                {/* Top brand rail - editorial strip, matches dashboard style */}
                <div className="relative border-b border-white/10 bg-[linear-gradient(90deg,#0a140a_0%,#0d1d0c_50%,#0a140a_100%)]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #86efac 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div className="container relative mx-auto flex items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] md:px-4">
                        <div className="flex items-center gap-2.5 text-white/75">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                            </span>
                            <span>{footerTopBadge}</span>
                            <span className="hidden h-px w-6 bg-white/20 sm:inline-block" />
                            <span className="hidden text-white/50 sm:inline">
                                1<sup>er</sup> Groupe de Presse Agricole
                            </span>
                        </div>
                        <div className="hidden items-center gap-2 text-white/55 md:flex">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span>Edition du {editionDate}</span>
                            <span className="h-px w-6 bg-white/20" />
                            <Radio className="h-3 w-3 animate-pulse text-primary" />
                            <span>Afrique de l'Ouest</span>
                        </div>
                    </div>
                </div>

                {/* Main bar with gradient backdrop */}
                <div className="relative border-b border-white/10 bg-[linear-gradient(135deg,#10230f_0%,#183a13_48%,#224b17_100%)] supports-[backdrop-filter]:bg-[linear-gradient(135deg,#10230f_f2_0%,#183a13_f2_48%,#224b17_f2_100%)]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '26px 26px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 right-1/4 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
                    />
                    <div className="container relative mx-auto flex h-[84px] items-center justify-between gap-3 px-3 md:h-[92px] md:px-4">
                        {isSearchOpen ? (
                            <div className="flex w-full items-center justify-center duration-300 animate-in fade-in zoom-in">
                                <div className="relative w-full max-w-2xl">
                                    <LiveSearch
                                        isOpen={true}
                                        onClose={() => setIsSearchOpen(false)}
                                        className="w-full"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="absolute right-3 top-1/2 z-10 h-8 w-8 shrink-0 -translate-y-1/2 rounded-full border border-gray-600/50 bg-gray-800/80 text-white backdrop-blur-sm hover:bg-gray-700/90 hover:text-white"
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
                                <div className="flex items-center gap-2 md:gap-3">
                                    {/* Mobile Menu Button */}
                                    <div className="md:hidden">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setIsMobileMenuOpen(true)
                                            }
                                            className="hover:bg-white/16 h-11 w-11 rounded-full border border-white/15 bg-white/10 text-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:text-white md:h-12 md:w-12"
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
                                                <line
                                                    x1="4"
                                                    x2="20"
                                                    y1="12"
                                                    y2="12"
                                                />
                                                <line
                                                    x1="4"
                                                    x2="20"
                                                    y1="6"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="4"
                                                    x2="20"
                                                    y1="18"
                                                    y2="18"
                                                />
                                            </svg>
                                        </Button>
                                    </div>

                                    {/* Search Trigger */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsSearchOpen(true)}
                                        className="hover:bg-white/16 hidden h-11 w-11 rounded-full border border-white/15 bg-white/10 text-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:text-white md:inline-flex md:h-12 md:w-12"
                                    >
                                        <Search className="h-6 w-6" />
                                    </Button>
                                </div>

                                {/* Center Section: Logo */}
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Link
                                        href="/"
                                        className="pointer-events-auto flex items-center px-2 py-1 transition-transform duration-300 hover:-translate-y-0.5"
                                    >
                                        <img
                                            src="/logos/logo-blanc.png"
                                            alt={footerBrandTitle}
                                            className="h-12 w-auto object-contain md:h-16"
                                            width={240}
                                            height={80}
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </Link>
                                </div>

                                {/* Right Section: Actions */}
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="md:hidden">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setIsSearchOpen(true)
                                            }
                                            className="hover:bg-white/16 h-11 w-11 rounded-full border border-white/15 bg-white/10 text-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:text-white"
                                        >
                                            <Search className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Theme Switcher */}
                                    <div className="hidden md:block">
                                        <ModeToggle className="hover:bg-white/16 border-white/15 bg-white/10 text-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:text-white" />
                                    </div>

                                    {/* Notifications */}
                                    {user && (
                                        <NotificationBell className="hidden md:block" />
                                    )}

                                    {/* Auth / Profile */}
                                    {user ? (
                                        <div
                                            className="relative z-[60] ml-2"
                                            onMouseEnter={() =>
                                                setIsUserMenuOpen(true)
                                            }
                                            onMouseLeave={() =>
                                                setIsUserMenuOpen(false)
                                            }
                                        >
                                            <button className="hover:bg-white/16 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 pr-3 text-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors md:pr-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-primary">
                                                    {user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="hidden max-w-[100px] truncate text-sm font-medium md:block">
                                                    {user.name}
                                                </span>
                                                <ChevronDown className="hidden h-4 w-4 text-white/70 md:block" />
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
                                                <div className="absolute right-0 z-[100] mt-3 w-64 origin-top-right overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/5 focus:outline-none dark:border-white/10 dark:bg-gray-900 dark:ring-white/10">
                                                    {/* Header inside dropdown */}
                                                    <div className="bg-gradient-to-br from-primary to-primary/85 px-4 py-3">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/70">
                                                            LE RURAL
                                                        </p>
                                                        <p className="mt-0.5 truncate text-sm font-bold text-white">
                                                            {user.name}
                                                        </p>
                                                    </div>
                                                    <div className="p-1.5">
                                                        <Link
                                                            href={route(
                                                                'dashboard',
                                                            )}
                                                            className="group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-gray-800 transition-colors hover:bg-primary/10 hover:text-primary dark:text-gray-100"
                                                        >
                                                            <LayoutDashboard className="mr-2.5 h-4 w-4" />
                                                            Tableau de bord
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                'profile.edit',
                                                            )}
                                                            className="group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-gray-800 transition-colors hover:bg-primary/10 hover:text-primary dark:text-gray-100"
                                                        >
                                                            <User className="mr-2.5 h-4 w-4" />
                                                            Mon Profil
                                                        </Link>
                                                    </div>
                                                    <div className="border-t border-gray-100 p-1.5 dark:border-gray-800">
                                                        <Link
                                                            href={route(
                                                                'logout',
                                                            )}
                                                            method="post"
                                                            as="button"
                                                            className="group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-gray-800 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-100 dark:hover:bg-red-950/40"
                                                        >
                                                            <LogOut className="mr-2.5 h-4 w-4" />
                                                            Deconnexion
                                                        </Link>
                                                    </div>
                                                </div>
                                            </Transition>
                                        </div>
                                    ) : (
                                        <div className="ml-2 hidden items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl md:flex">
                                            <Link href={route('login')}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="hover:bg-white/12 h-10 rounded-full px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white hover:text-white"
                                                >
                                                    Connexion
                                                </Button>
                                            </Link>
                                            <Link href={route('register')}>
                                                <Button
                                                    size="sm"
                                                    className="h-10 rounded-full bg-white px-4 text-[11px] font-black uppercase tracking-[0.16em] text-primary hover:bg-white/90"
                                                >
                                                    S'inscrire
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Sticky Editorial Rails */}
            <div className="sticky top-[108px] z-40 md:top-[116px]">
                <div className="relative hidden border-b border-black/5 bg-white/90 shadow-[0_10px_30px_-20px_rgba(47,106,17,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/85 md:block">
                    <div
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent opacity-100"
                        aria-hidden="true"
                    />
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col gap-2 py-3">
                            <div className="hidden items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 lg:inline-flex lg:self-start">
                                <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                                    Rubriques
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => scrollCategoryRail('left')}
                                    aria-label="Faire defiler les rubriques vers la gauche"
                                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white/90 text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white dark:bg-gray-950/90 lg:flex"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <nav
                                    ref={categoryRailRef}
                                    className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth"
                                >
                                    {categories.length > 0 ? (
                                        categories.map((category: any) => {
                                            const isActive = route().current(
                                                'category.show',
                                                { slug: category.slug },
                                            );
                                            return (
                                                <Link
                                                    key={`category-${category.id || category.slug}`}
                                                    href={route(
                                                        'category.show',
                                                        category.slug,
                                                    )}
                                                    className={`group relative shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
                                                        isActive
                                                            ? 'border-primary bg-primary text-white shadow-[0_14px_35px_-20px_rgba(47,106,17,0.8)]'
                                                            : 'border-transparent bg-black/[0.03] text-gray-700 hover:border-primary/15 hover:bg-primary/10 hover:text-primary dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-primary/20 dark:hover:bg-primary/10'
                                                    }`}
                                                >
                                                    <span className="relative">
                                                        {category.name}
                                                    </span>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-full border border-dashed border-primary/20 bg-primary/5 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                                            Aucune rubrique disponible pour le
                                            moment
                                        </div>
                                    )}
                                    <Link
                                        href={route('press-papers.index')}
                                        className={`group relative shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
                                            isParutionsActive
                                                ? 'border-primary bg-primary text-white shadow-[0_14px_35px_-20px_rgba(47,106,17,0.8)]'
                                                : 'border-transparent bg-black/[0.03] text-gray-700 hover:border-primary/15 hover:bg-primary/10 hover:text-primary dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-primary/20 dark:hover:bg-primary/10'
                                        }`}
                                    >
                                        <span className="relative">
                                            Nos parutions
                                        </span>
                                    </Link>
                                    <Link
                                        href={route('live.index')}
                                        className={`group relative shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
                                            isLiveActive
                                                ? 'border-primary bg-primary text-white shadow-[0_14px_35px_-20px_rgba(47,106,17,0.8)]'
                                                : 'border-transparent bg-black/[0.03] text-gray-700 hover:border-primary/15 hover:bg-primary/10 hover:text-primary dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-primary/20 dark:hover:bg-primary/10'
                                        }`}
                                    >
                                        <span className="relative">Direct</span>
                                    </Link>
                                    <Link
                                        href={route('safeb.index')}
                                        className={`group relative shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
                                            isSafebActive
                                                ? 'border-amber-400 bg-amber-400 text-gray-950 shadow-[0_14px_35px_-20px_rgba(251,191,36,0.8)]'
                                                : 'border-amber-300/40 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:border-amber-400/60 dark:hover:bg-amber-400/20'
                                        }`}
                                    >
                                        <span className="relative">SAFEB 2026</span>
                                    </Link>
                                </nav>

                                <button
                                    type="button"
                                    onClick={() => scrollCategoryRail('right')}
                                    aria-label="Faire defiler les rubriques vers la droite"
                                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white/90 text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white dark:bg-gray-950/90 lg:flex"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {showAnnouncements && !hasScrolled && (
                    <AnnouncementMarquee
                        announcements={announcements}
                        compact
                        className="border-t-0 md:mx-0 md:mt-0 md:rounded-none md:border-x-0 md:border-b"
                    />
                )}
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                categories={categories}
                locale={locale}
                settings={settings}
                footerPages={footerPages}
            />

            <main className="container mx-auto flex-1 px-2 py-4 md:px-4 md:py-8">
                {children}
            </main>

            <footer className="relative overflow-hidden border-t border-border bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pb-10 pt-16 text-white">
                {/* Decorative background - radial dot pattern + primary glow */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-primary/20 blur-3xl"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -bottom-20 right-1/4 h-60 w-60 rounded-full bg-primary/10 blur-3xl"
                    aria-hidden="true"
                />

                {/* Top editorial rail */}
                <div className="container mx-auto mb-10 px-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.2)]" />
                        <span>LE RURAL</span>
                        <span className="h-px max-w-[120px] flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
                        <span className="text-gray-500">
                            {footerTopTagline}
                        </span>
                    </div>
                </div>

                <div className="container relative mx-auto grid grid-cols-1 gap-10 px-4 md:grid-cols-4">
                    <div className="space-y-5">
                        <img
                            src="/logos/logo-blanc.png"
                            alt={footerBrandTitle}
                            className="mb-4 h-14 w-auto"
                            width={240}
                            height={80}
                            loading="lazy"
                            decoding="async"
                        />
                        <p className="text-sm leading-relaxed text-gray-400">
                            {settings.footer_description ||
                                "1er groupe de presse agricole en Afrique de l'Ouest. Information fiable et pertinente pour le developpement rural."}
                        </p>
                        <div className="space-y-2 text-sm text-gray-400">
                            {settings.contact_address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span>{settings.contact_address}</span>
                                </div>
                            )}
                            {settings.contact_phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span>{settings.contact_phone}</span>
                                </div>
                            )}
                            {settings.contact_email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span>{settings.contact_email}</span>
                                </div>
                            )}
                            {!settings.contact_address &&
                                !settings.contact_phone &&
                                !settings.contact_email && (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-gray-500">
                                        Coordonnees non configurees.
                                    </div>
                                )}
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
                            {socialLinks.length > 0 ? (
                                socialLinks.map((item) => (
                                    <a
                                        key={item.key}
                                        href={item.url!}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition-all hover:border-primary hover:bg-primary hover:text-white"
                                        aria-label={item.label}
                                    >
                                        {socialIcons[item.key]}
                                    </a>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-gray-500">
                                    Reseaux sociaux non configures.
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h5 className="relative mb-5 border-b border-primary/40 pb-3 font-heading text-lg font-black uppercase tracking-tight text-white">
                            <span
                                className="absolute -left-1 bottom-3 top-0 w-1 rounded-full bg-primary"
                                aria-hidden="true"
                            />
                            <span className="pl-3">{footerInfoTitle}</span>
                        </h5>
                        <ul className="space-y-2.5 text-sm text-gray-400">
                            {footerPages.length > 0 ? (
                                footerPages.map(
                                    (page: {
                                        id: number;
                                        slug: string;
                                        title: string;
                                    }) => {
                                        const active = isFooterPageActive(
                                            page.slug,
                                        );
                                        const linkClass = active
                                            ? 'inline-flex items-center gap-2 transition-all group text-primary'
                                            : 'inline-flex items-center gap-2 transition-all group hover:text-primary hover:translate-x-1';
                                        const markerClass = active
                                            ? 'h-px w-4 bg-primary transition-all'
                                            : 'h-px w-2 bg-gray-600 transition-all group-hover:bg-primary group-hover:w-4';

                                        return (
                                            <li key={page.id}>
                                                <Link
                                                    href={getFooterPageHref(
                                                        page.slug,
                                                    )}
                                                    className={linkClass}
                                                >
                                                    <span
                                                        className={markerClass}
                                                    />
                                                    {page.title}
                                                </Link>
                                            </li>
                                        );
                                    },
                                )
                            ) : (
                                <li>
                                    <span className="inline-flex items-center gap-2 text-gray-500">
                                        <span className="h-px w-2 bg-gray-600" />
                                        Aucune page statique publiee
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h5 className="relative mb-5 border-b border-primary/40 pb-3 font-heading text-lg font-black uppercase tracking-tight text-white">
                            <span
                                className="absolute -left-1 bottom-3 top-0 w-1 rounded-full bg-primary"
                                aria-hidden="true"
                            />
                            <span className="pl-3">{footerGroupTitle}</span>
                        </h5>
                        <ul className="space-y-2.5 text-sm text-gray-400">
                            {footerGroupLinks.map((item) => {
                                const active = isInternalPathActive(item.url);
                                const linkClass = active
                                    ? 'inline-flex items-center gap-2 transition-all group text-primary'
                                    : 'inline-flex items-center gap-2 transition-all group hover:text-primary hover:translate-x-1';
                                const markerClass = active
                                    ? 'h-px w-4 bg-primary transition-all'
                                    : 'h-px w-2 bg-gray-600 transition-all group-hover:bg-primary group-hover:w-4';

                                return (
                                    <li key={item.label}>
                                        {item.url.startsWith('/') ? (
                                            <Link
                                                href={item.url}
                                                className={linkClass}
                                            >
                                                <span className={markerClass} />
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <a
                                                href={item.url}
                                                className={linkClass}
                                            >
                                                <span className={markerClass} />
                                                {item.label}
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <h5 className="relative mb-5 border-b border-primary/40 pb-3 font-heading text-lg font-black uppercase tracking-tight text-white">
                            <span
                                className="absolute -left-1 bottom-3 top-0 w-1 rounded-full bg-primary"
                                aria-hidden="true"
                            />
                            <span className="pl-3">
                                {footerNewsletterTitle}
                            </span>
                        </h5>
                        <p className="mb-4 text-sm leading-relaxed text-gray-400">
                            {footerNewsletterDescription}
                        </p>
                        {newsletterSuccess ? (
                            <div className="rounded-xl border border-primary/30 bg-primary/15 p-3 text-sm font-semibold text-primary">
                                {locale === 'en'
                                    ? 'Subscribed successfully!'
                                    : 'Merci pour votre abonnement !'}
                            </div>
                        ) : (
                            <form
                                className="flex overflow-hidden rounded-full border border-white/15 bg-white/5 shadow-lg backdrop-blur-sm transition-colors focus-within:border-primary/50"
                                onSubmit={handleNewsletterSubmit}
                            >
                                <input
                                    type="email"
                                    value={newsletterData.email}
                                    onChange={(e) =>
                                        setNewsletterData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={footerNewsletterPlaceholder}
                                    required
                                    className="w-full border-none bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                                />
                                <Button
                                    className="rounded-none bg-primary px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-primary/90"
                                    type="submit"
                                    disabled={newsletterProcessing}
                                >
                                    {newsletterProcessing ? (
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        'OK'
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
                <div className="container relative mx-auto mt-12 px-4">
                    <AdSpace
                        width="100%"
                        height={110}
                        locationId="footer_banner"
                        label="Publicite pied de page"
                        className="w-full overflow-hidden rounded-2xl"
                        hideWhenEmpty
                    />
                </div>

                <div className="container relative mx-auto mt-10 border-t border-white/10 px-4 pt-6">
                    <div className="flex flex-col items-center justify-between gap-3 text-xs text-gray-500 md:flex-row">
                        <div className="flex flex-col items-center gap-1 md:items-start">
                            <p className="font-semibold">
                                {settings.footer_copyright ||
                                    `${new Date().getFullYear()} LE RURAL - Tous droits reserves.`}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                DESIGNED BY{' '}
                                <a
                                    href="https://georgeo-agbahungba.xyz"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-extrabold tracking-[0.2em] text-primary transition-all duration-300 [text-shadow:0_0_8px_rgba(34,197,94,0.45)] hover:text-emerald-300 hover:underline hover:[text-shadow:0_0_14px_rgba(74,222,128,0.9)]"
                                >
                                    GEORGEO AGBAHUNGBA
                                </a>
                            </p>
                        </div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                            <span>
                                1<sup>er</sup> Groupe de Presse Agricole
                            </span>
                        </p>
                    </div>
                </div>
            </footer>

            <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3">
                {whatsappEnabled && whatsappHref && (
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Contacter sur WhatsApp"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_42px_-16px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:scale-[1.05]"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </a>
                )}

                <button
                    type="button"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    aria-label="Retour en haut"
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_42px_-16px_rgba(0,0,0,0.55)] transition-all duration-300 ${
                        showBackToTop
                            ? 'translate-y-0 opacity-100'
                            : 'pointer-events-none translate-y-2 opacity-0'
                    }`}
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            </div>

            <CookieBanner />

            {/* Toast de notification live */}
            {user && liveStreams && (
                <LiveNotificationToast liveStreams={liveStreams as any[]} />
            )}
        </div>
    );
}
