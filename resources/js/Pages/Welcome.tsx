import EmptySectionState from '@/Components/EmptySectionState';
import JournalShelf from '@/Components/JournalShelf';
import AuthModal from '@/Components/AuthModal';
import HomeCategorySection from '@/Components/HomeCategorySection';
import HomeSidebar from '@/Components/HomeSidebar';
import AdSpace from '@/Components/AdSpace';
import IntroLoader from '@/Components/IntroLoader';
import ImageWithFallback from '@/Components/ImageWithFallback';
import RelaunchSplash from '@/Components/RelaunchSplash';
import useInViewMount from '@/Hooks/useInViewMount';
import useSharedContent from '@/Hooks/useSharedContent';
import MainLayout from '@/Layouts/MainLayout';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { asBool } from '@/lib/siteSettings';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';

const LazyWebTvSection = lazy(() => import('@/Components/WebTvSection'));
const LazyPartnersSection = lazy(() => import('@/Components/PartnersSection'));
const LazySocialMediaSection = lazy(() => import('@/Components/SocialMediaSection'));
const LazyLiveStreamsSection = lazy(() => import('@/Components/LiveStreamsSection'));

const SPLASH_STORAGE_KEY = 'le_rural_relaunch_splash_seen_v1';

export default function Welcome() {
    const { props } = usePage<
        PageProps<{
            featured?: {
                slug: string;
                title: string;
                excerpt: string;
                image: string | null;
                author: string;
                premium: boolean;
                price: number | string | null;
                published_human: string | null;
                likes_count?: number;
                is_liked?: boolean;
            }[];
            latest_articles?: {
                slug: string;
                title: string;
                excerpt: string;
                image: string | null;
                author: string;
                premium: boolean;
                price: number | string | null;
                published_human: string | null;
                likes_count?: number;
                views_count?: number;
                comments_count?: number;
                is_liked?: boolean;
            }[];
            latest_by_category?: Record<
                string,
                {
                    name: string;
                    articles: {
                        slug: string;
                        title: string;
                        excerpt: string;
                        image: string | null;
                        author: string;
                        premium: boolean;
                        price: number | string | null;
                        published_human: string | null;
                        likes_count?: number;
                        views_count?: number;
                        comments_count?: number;
                        is_liked?: boolean;
                    }[];
                }
            >;
            min_subscription_price?: number | null;
            promo_offer?: {
                code: string;
                name?: string | null;
                description?: string | null;
                discount_type: 'percent' | 'fixed';
                discount_value: number;
                min_amount?: number | null;
                applies_to_all_subscriptions?: boolean;
                checkout_plan_id?: string | null;
                target_subscription_plans?: { id: number; slug: string; name: string; price: number }[];
            } | null;
        }>
    >();

    const {
        marketPrices,
        webtvVideos,
        youtubeChannel,
        youtubeVideos,
        youtubePlaylists,
        emissions,
        partners,
        latestComments,
        liveStreams,
        pressPapers,
    } = useSharedContent();

    const settings = (props.settings ?? {}) as Record<string, string>;
    const showWebtv = asBool(settings.widget_show_webtv, true);
    const showPartners = asBool(settings.widget_show_partners, true);
    const showSocials = asBool(settings.widget_show_socials, true);
    const minSubscriptionPrice = props.min_subscription_price ?? null;
    const promoOffer = props.promo_offer ?? null;
    const authUser = props.auth?.user;
    const hasActiveSubscription = Boolean(props.auth?.has_active_subscription);
    const isElevatedUser = Boolean(authUser && ['admin', 'editor'].includes(String(authUser.role ?? '')));
    const isAdminUser = Boolean(authUser && String(authUser.role ?? '') === 'admin');
    const rawFeatured = props.featured ?? [];
    const latestArticles = props.latest_articles ?? [];
    const featured = rawFeatured.length > 0 ? rawFeatured : latestArticles.slice(0, 5);
    const latestByCategory = props.latest_by_category ?? {};
    const categorySections = Object.entries(latestByCategory).filter(([, category]) => category.articles.length > 0);
    const hasCategoryContent = categorySections.length > 0;
    const topQuickArticles = latestArticles.slice(0, 10);

    const categoryNameMap: Record<string, string> = {
        economy: 'Economie',
        environment: 'Environnement',
        'value chains': 'Filieres',
        policies: 'Politiques',
    };

    const resolveCategoryName = (slug: string, name: string) => {
        const key = (name || '').trim().toLowerCase();
        if (categoryNameMap[key]) {
            return categoryNameMap[key];
        }

        return (name || slug || '').trim();
    };

    const [showLoader, setShowLoader] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('skip_intro_loader') !== 'true';
        }

        return true;
    });
    const [isLoaded, setIsLoaded] = useState(!showLoader);
    const [showRelaunchSplash, setShowRelaunchSplash] = useState(false);
    const [showSubscriptionAuthModal, setShowSubscriptionAuthModal] = useState(false);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likesCountBySlug, setLikesCountBySlug] = useState<Record<string, number>>({});

    const webtvSectionRef = useRef<HTMLDivElement | null>(null);
    const partnersSectionRef = useRef<HTMLDivElement | null>(null);
    const socialsSectionRef = useRef<HTMLDivElement | null>(null);
    const liveSectionRef = useRef<HTMLDivElement | null>(null);
    const latestArticlesScrollerRef = useRef<HTMLDivElement | null>(null);
    const splashTriggeredRef = useRef(false);

    const mountWebtv = useInViewMount(webtvSectionRef);
    const mountPartners = useInViewMount(partnersSectionRef);
    const mountSocials = useInViewMount(socialsSectionRef);
    const mountLive = useInViewMount(liveSectionRef);

    const featuredCount = featured.length;
    const featuredTitle = featured[featuredIndex]?.title ?? '';
    const isFeaturedTitleLong = featuredTitle.length > 85;
    const featuredExcerpt = featured[featuredIndex]?.excerpt ?? '';

    useEffect(() => {
        const initialLiked: Record<string, boolean> = {};
        const initialCounts: Record<string, number> = {};

        const populate = (articles: any[]) => {
            articles.forEach((article) => {
                if (article.is_liked) {
                    initialLiked[article.slug] = true;
                }

                initialCounts[article.slug] = article.likes_count ?? 0;
            });
        };

        populate(featured);

        if (props.latest_articles) {
            populate(props.latest_articles);
        }

        Object.values(latestByCategory).forEach((category) => {
            populate(category.articles);
        });

        setLiked(initialLiked);
        setLikesCountBySlug(initialCounts);
    }, [featured, props.latest_articles, latestByCategory]);

    useEffect(() => {
        if (!showLoader) {
            setIsLoaded(true);
        }
    }, [showLoader]);

    const triggerSplashOnce = () => {
        if (splashTriggeredRef.current || typeof window === 'undefined') {
            return;
        }

        try {
            if (localStorage.getItem(SPLASH_STORAGE_KEY) === '1') {
                splashTriggeredRef.current = true;
                return;
            }

            localStorage.setItem(SPLASH_STORAGE_KEY, '1');
        } catch {
            // In private mode or blocked storage, we still show once per runtime.
        }

        splashTriggeredRef.current = true;
        setShowRelaunchSplash(true);
    };

    useEffect(() => {
        if (!showLoader) {
            triggerSplashOnce();
        }
    }, [showLoader]);

    useEffect(() => {
        if (featuredCount <= 1 || isFeaturedPaused) {
            return;
        }

        const interval = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % featuredCount);
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredCount, isFeaturedPaused]);

    useEffect(() => {
        if (featuredCount === 0 || featuredIndex < featuredCount) {
            return;
        }

        setFeaturedIndex(0);
    }, [featuredCount, featuredIndex]);

    const handleIntroComplete = () => {
        setShowLoader(false);
        triggerSplashOnce();
    };

    const formatCfa = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) {
            return null;
        }

        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const toggleLike = async (slug: string, baseLikes: number) => {
        try {
            const currentLiked = liked[slug];
            const newLiked = !currentLiked;

            setLiked((prev) => ({ ...prev, [slug]: newLiked }));
            setLikesCountBySlug((prev) => ({
                ...prev,
                [slug]: (prev[slug] ?? baseLikes) + (newLiked ? 1 : -1),
            }));

            await axios.post(
                `/articles/${slug}/like`,
                {},
                {
                    headers: {
                        'X-Session-ID': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content'),
                    },
                },
            );
        } catch (error) {
            setLiked((prev) => ({ ...prev, [slug]: !prev[slug] }));
            setLikesCountBySlug((prev) => ({
                ...prev,
                [slug]: (prev[slug] ?? baseLikes) + (liked[slug] ? 1 : -1),
            }));
            console.error('Like error:', error);
        }
    };

    const editionDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const scrollLatestArticles = (direction: 'left' | 'right') => {
        if (!latestArticlesScrollerRef.current) {
            return;
        }

        const amount = direction === 'left' ? -320 : 320;
        latestArticlesScrollerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handleSubscriptionCta = () => {
        if (!authUser) {
            setShowSubscriptionAuthModal(true);
            return;
        }

        if (isElevatedUser || hasActiveSubscription) {
            window.location.href = route('dashboard');
            return;
        }

        window.location.href = '/checkout?type=subscription&id=default';
    };

    return (
        <MainLayout title="Accueil">
            {showLoader && <IntroLoader onComplete={handleIntroComplete} />}
            {showRelaunchSplash && <RelaunchSplash onComplete={() => setShowRelaunchSplash(false)} />}
            <AuthModal
                isOpen={showSubscriptionAuthModal}
                onClose={() => setShowSubscriptionAuthModal(false)}
                purchaseType="subscription"
            />

            <div className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <section onMouseEnter={() => setIsFeaturedPaused(true)} onMouseLeave={() => setIsFeaturedPaused(false)} className="mx-3 mb-10 mt-3 md:mx-4 md:mb-14 md:mt-4">
                    <div className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-gray-950 shadow-[0_26px_70px_-42px_rgba(15,23,42,0.45)] dark:border-white/10">
                        {featured.length > 0 ? (
                            <div className="relative aspect-[16/9] min-h-[260px] w-full overflow-hidden sm:min-h-[300px] md:min-h-[340px]">
                                <ImageWithFallback
                                    key={featuredIndex}
                                    src={featured[featuredIndex].image || undefined}
                                    alt={featured[featuredIndex].title}
                                    className="absolute inset-0 h-full w-full animate-in zoom-in-[102] fade-in duration-1000 object-cover"
                                    fallbackSrc="/images/article-placeholder.svg"
                                    loading="eager"
                                />

                                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-gray-950/64 via-gray-950/24 to-transparent" />
                                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-gray-950/54 via-transparent to-transparent" />

                                <div className="absolute left-0 right-0 top-0 z-20 border-b border-white/10 bg-gray-950/80 px-5 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/85 sm:px-10">
                                    <span className="flex items-center gap-3">
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>LE RURAL</span>
                                        <span className="text-white/20">/</span>
                                        <span>MIS EN AVANT</span>
                                    </span>
                                </div>

                                {featuredCount > 1 && (
                                    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-4 pb-4 pt-14 sm:px-6 sm:pb-6">
                                        <button
                                            type="button"
                                            onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredCount) % featuredCount)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-black/55 hover:text-primary"
                                            aria-label="Precedent"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <div className="flex flex-1 items-center justify-center gap-1.5">
                                            {featured.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setFeaturedIndex(idx)}
                                                    className={`h-1 rounded-full transition-all duration-500 ${idx === featuredIndex ? 'w-10 bg-primary' : 'w-5 bg-gray-300 hover:bg-gray-400 dark:bg-white/30 dark:hover:bg-white/50'}`}
                                                    aria-label={`Aller a la mise en avant ${idx + 1}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredCount)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-black/55 hover:text-primary"
                                            aria-label="Suivant"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden sm:min-h-[300px] md:min-h-[340px]">
                                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-gray-950/64 via-gray-950/24 to-transparent" />
                                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-gray-950/54 via-transparent to-transparent" />
                                <div className="relative z-10 mx-auto max-w-xl px-5 text-center sm:px-8">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-white/85">
                                        <Star className="h-3.5 w-3.5" />
                                        MIS EN AVANT
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-white/80">
                                        Aucune une disponible pour le moment.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 px-4 py-2 text-center sm:px-6 sm:py-3">
                        {featured.length > 0 ? (
                            <div className="mx-auto flex max-w-3xl flex-col items-center">
                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-primary">
                                    <Star className="h-3.5 w-3.5" />
                                    MIS EN AVANT
                                </div>

                                <h1
                                    className={
                                        isFeaturedTitleLong
                                            ? 'mt-4 w-full font-heading text-2xl font-black uppercase leading-[1.06] tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl'
                                            : 'mt-4 w-full font-heading text-2xl font-black uppercase leading-[1.06] tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-[3rem]'
                                    }
                                >
                                    {featuredTitle}
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-white/72 sm:text-base">
                                    {featuredExcerpt}
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                    <Link
                                        href={featured[featuredIndex]?.slug ? `/article/${featured[featuredIndex].slug}` : '#'}
                                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
                                    >
                                        Lire
                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    {featured[featuredIndex].premium && !isElevatedUser && (
                                        <button
                                            type="button"
                                            onClick={handleSubscriptionCta}
                                            className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/15 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-700 transition-all hover:scale-[1.02] hover:border-amber-200/60 hover:bg-amber-400/25 dark:text-amber-50"
                                        >
                                            {hasActiveSubscription ? 'Tableau de bord' : "S'abonner"}
                                        </button>
                                    )}
                                </div>

                                {featuredCount > 1 && (
                                    <div className="mt-6 flex w-full items-center justify-center gap-1.5">
                                        {featured.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setFeaturedIndex(idx)}
                                                className={`h-1 rounded-full transition-all duration-500 ${idx === featuredIndex ? 'w-10 bg-primary' : 'w-5 bg-gray-300 hover:bg-gray-400 dark:bg-white/25 dark:hover:bg-white/40'}`}
                                                aria-label={`Aller a la mise en avant ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mx-auto max-w-3xl animate-in fade-in duration-700">
                                <EmptySectionState
                                    eyebrow="MIS EN AVANT"
                                    title="Aucun contenu mis en avant"
                                    description="La une s'affichera ici des qu'un article featured sera publie dans la base de donnees."
                                    tone="amber"
                                    theme="auto"
                                    className="border-stone-200/80 bg-white/90 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/5"
                                />
                            </div>
                        )}
                    </div>
                </section>
                <div className="mx-auto max-w-7xl animate-in fade-in duration-700 px-4 sm:px-6 lg:px-8">
                    {promoOffer && !isAdminUser && !(authUser && hasActiveSubscription) && (
                        <section className="mb-6 overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/90 p-[1px] shadow-[0_20px_50px_-30px_rgba(180,83,9,0.55)] dark:border-amber-500/25 dark:from-amber-500/20 dark:via-orange-500/10 dark:to-amber-500/20">
                            <div className="rounded-3xl bg-white/90 px-5 py-4 dark:bg-gray-950/85 sm:px-7 sm:py-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-700 dark:text-amber-300">Promo active</p>
                                        <h3 className="mt-1 font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                            Code {promoOffer.code}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-white/75">
                                            {promoOffer.description || (promoOffer.discount_type === 'percent'
                                                ? promoOffer.discount_value + '% de reduction immediatement au checkout.'
                                                : promoOffer.discount_value + ' FCFA de reduction immediatement au checkout.')}
                                        </p>
                                        {promoOffer.applies_to_all_subscriptions === false && (promoOffer.target_subscription_plans?.length ?? 0) > 0 && (
                                            <p className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
                                                Offre ciblee: {promoOffer.target_subscription_plans?.map((plan) => plan.name).join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={route('payment.checkout', { type: 'subscription', id: promoOffer.checkout_plan_id || 'default', promo_code: promoOffer.code })}
                                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-amber-500/30 transition hover:scale-[1.02]"
                                    >
                                        Activer l'offre
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="mb-12 flex justify-center overflow-hidden">
                        <AdSpace
                            width="100%"
                            height={250}
                            locationId="home_inline_feature"
                            label="Publicite mise en avant"
                            className="w-full rounded-3xl"
                            hideWhenEmpty
                        />
                    </div>

                    <JournalShelf
                        items={pressPapers.map((paper: any) => ({
                            id: paper.id,
                            title: paper.title,
                            cover_url: paper.cover_url,
                            published_human: paper.published_human,
                            price_label: paper.price_label,
                            action_url: paper.action_url,
                            action_label: paper.action_label,
                            badge: paper.badge,
                        }))}
                        eyebrow="Nos parutions"
                        title="Nos parutions"
                        description="Apercu des dernieres couvertures imprimees avec acces rapide au PDF ou au checkout."
                        emptyTitle="Aucune parution disponible"
                        emptyDescription="Nos parutions apparaitront ici des qu'une edition papier sera publiee."
                        tone="dark"
                        className="mb-12"
                    />

                    {!isElevatedUser && (
                        <section id="abonnement" className="mb-12 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary via-emerald-700 to-emerald-800 p-[1px] shadow-[0_24px_70px_-30px_rgba(47,106,17,0.5)] animate-in fade-in slide-in-from-bottom-3 duration-700">
                            <div className="relative rounded-3xl bg-gray-950 px-6 py-8 text-white sm:px-8 md:px-10 md:py-10">
                                <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                                <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

                                <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                    <div className="max-w-2xl">
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary-foreground/70">Abonnement LE RURAL</p>
                                        <h2 className="mt-3 font-heading text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                                            {hasActiveSubscription ? 'Votre abonnement est actif' : 'Accedez en illimite a nos contenus premium'}
                                        </h2>
                                        <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
                                            {hasActiveSubscription
                                                ? 'Retrouvez vos achats, factures et parametres depuis votre tableau de bord.'
                                                : 'Abonnez-vous pour lire toutes nos analyses, dossiers et editions numeriques sans restriction.'}
                                        </p>
                                    </div>

                                    <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
                                        {!hasActiveSubscription && (
                                            <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur">
                                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">A partir de</p>
                                                <p className="mt-1 font-heading text-3xl font-black leading-none text-white">
                                                    {minSubscriptionPrice ? formatCfa(minSubscriptionPrice) : '500 FCFA'}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSubscriptionCta}
                                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-primary/40 transition-transform hover:scale-[1.02]"
                                        >
                                            {hasActiveSubscription ? 'Tableau de bord' : "S'abonner maintenant"}
                                        </button>

                                        {authUser ? (
                                            <Link href={route('user.subscription')} className="text-xs font-semibold text-gray-300 underline-offset-4 hover:text-white hover:underline">
                                                Gerer mon abonnement
                                            </Link>
                                        ) : (
                                            <p className="text-xs text-gray-400">Connexion ou inscription requise avant paiement.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="mb-8 rounded-2xl border border-gray-200/70 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                            <span className="text-gray-500 dark:text-white/50">Acces rapide</span>
                            <a href="#home-widgets" className="rounded-full bg-primary/10 px-3 py-1 text-primary transition hover:bg-primary/20">Widgets</a>
                            <a href="#home-webtv" className="rounded-full bg-primary/10 px-3 py-1 text-primary transition hover:bg-primary/20">Web TV</a>
                            <a href="#home-direct" className="rounded-full bg-primary/10 px-3 py-1 text-primary transition hover:bg-primary/20">Direct</a>
                        </div>
                    </section>

                    {topQuickArticles.length > 0 && (
                        <section id="actualites" className="mb-8">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-2xl">Derniers articles</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => scrollLatestArticles('left')}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/20 dark:bg-white/5 dark:text-white"
                                        aria-label="Defiler a gauche"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollLatestArticles('right')}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/20 dark:bg-white/5 dark:text-white"
                                        aria-label="Defiler a droite"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <Link href="/search" className="text-[11px] font-black uppercase tracking-[0.14em] text-primary hover:underline">Voir tout</Link>
                                </div>
                            </div>
                            <div ref={latestArticlesScrollerRef} className="no-scrollbar -mx-1 overflow-x-auto pb-2">
                                <div className="flex min-w-max gap-3 px-1">
                                    {topQuickArticles.map((item) => (
                                        <Link key={item.slug} href={`/article/${item.slug}`} className="group w-[260px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
                                            <div className="aspect-[16/9] overflow-hidden bg-gray-200 dark:bg-gray-800">
                                                <img
                                                    src={item.image || '/images/article-placeholder.svg'}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <p className="line-clamp-2 text-sm font-black leading-snug text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-white/60">{item.published_human || 'Recemment'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="order-2 space-y-16 lg:order-1 lg:col-span-8 xl:col-span-9">
                            {hasCategoryContent ? (
                                categorySections.map(([key, category]) => (
                                    <HomeCategorySection
                                        key={key}
                                        id={key}
                                        name={resolveCategoryName(key, category.name)}
                                        articles={category.articles.map((item: any) => ({
                                            ...item,
                                            excerpt:
                                                typeof item?.excerpt === 'string' && item.excerpt.trim() !== ''
                                                    ? item.excerpt
                                                    : typeof item?.content === 'string'
                                                        ? item.content
                                                        : '',
                                        }))}
                                        formatCfa={formatCfa}
                                        likedBySlug={liked}
                                        likesCountBySlug={likesCountBySlug}
                                        onToggleLike={toggleLike}
                                    />
                                ))
                            ) : (
                                <EmptySectionState
                                    eyebrow="Rubriques"
                                    title="Aucun article disponible"
                                    description="Les dernieres publications par rubrique apparaitront ici des qu'au moins une categorie contiendra des articles en base."
                                    tone="primary"
                                />
                            )}
                        </div>

                        <aside id="home-widgets" className="order-1 space-y-8 lg:order-2 lg:col-span-4 xl:col-span-3">
                            <HomeSidebar
                                marketPrices={marketPrices}
                                webtvVideos={webtvVideos}
                                partners={partners}
                                comments={latestComments}
                            />
                        </aside>
                    </div>
                </div>

                {showWebtv && (
                    <div id="home-webtv" ref={webtvSectionRef} className="mt-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {(mountWebtv || emissions.length > 0 || webtvVideos.length > 0 || youtubeVideos.length > 0 || youtubePlaylists.length > 0) && (
                            <Suspense fallback={<div className="h-[280px] animate-pulse rounded-[40px] bg-gray-900/40 md:mx-4" />}>
                                <div className="bg-gray-950 py-16 shadow-2xl md:mx-4 md:rounded-[40px]">
                                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                        <LazyWebTvSection
                                            videos={webtvVideos}
                                            emissions={emissions}
                                            youtubeChannel={youtubeChannel}
                                            youtubeVideos={youtubeVideos}
                                            youtubePlaylists={youtubePlaylists}
                                        />
                                    </div>
                                </div>
                            </Suspense>
                        )}
                    </div>
                )}

                <div id="home-direct" ref={liveSectionRef} className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-700 md:mt-12">
                    {mountLive && (
                        <Suspense fallback={<div className="mx-4 mb-10 h-[260px] animate-pulse rounded-3xl bg-primary/10" />}>
                            <LazyLiveStreamsSection streams={liveStreams} emissions={emissions} fallbackVideoUrl={settings.live_fallback_video_url ?? null} jingleDurationSeconds={Number(settings.live_jingle_duration_seconds) || 90} />
                        </Suspense>
                    )}
                </div>

                {showPartners && (
                    <div ref={partnersSectionRef} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {mountPartners && (
                            <Suspense fallback={<div className="mx-4 my-8 h-[220px] animate-pulse rounded-[2rem] bg-stone-200/70 dark:bg-white/5" />}>
                                <LazyPartnersSection partners={partners} />
                            </Suspense>
                        )}
                    </div>
                )}
                {showSocials && (
                    <div ref={socialsSectionRef} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {mountSocials && (
                            <Suspense fallback={<div className="mx-4 mb-16 h-[320px] animate-pulse rounded-3xl bg-primary/10" />}>
                                <LazySocialMediaSection settings={settings} />
                            </Suspense>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}


