import HomeCategorySection from '@/Components/HomeCategorySection';
import HomeSidebar from '@/Components/HomeSidebar';
import IntroLoader from '@/Components/IntroLoader';
import WebTvSection from '@/Components/WebTvSection';
import PartnersSection from '@/Components/PartnersSection';
import MainLayout from '@/Layouts/MainLayout';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

import AdSpace from '@/Components/AdSpace';

export default function Welcome() {
    const { props } = usePage<
        PageProps<{
            categories?: { slug: string; name: string }[];
            featured?: {
                slug: string;
                title: string;
                excerpt: string;
                image: string | null;
                author: string;
                premium: boolean;
                price: number | string | null;
                published_human: string | null;
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
                    }[];
                }
            >;
            market_prices?: {
                name: string;
                price: string;
                unit: string;
                note: string | null;
            }[];
            webtv_videos?: {
                title: string;
                youtube_id: string;
                thumbnail: string | null;
                emission_name: string | null;
                emission_image: string | null;
                emission_link: string | null;
                published_at: string;
                is_featured: boolean;
            }[];
            emissions?: {
                id: number;
                name: string;
                description: string | null;
                image: string | null;
                playlist_url: string;
            }[];
            partners?: {
                id: number;
                name: string;
                logo: string;
                url: string | null;
            }[];
            latest_comments?: {
                author_name: string;
                content: string;
                article_title: string;
            }[];
        }>
    >();
    const categories = props.categories ?? [];
    const locale = props.locale ?? 'fr';
    const settings = props.settings ?? {};
    const featured = props.featured ?? [];
    const partners = props.partners ?? [];
    const comments = props.latest_comments ?? [];
    const latestByCategory = props.latest_by_category ?? {};
    const [showLoader, setShowLoader] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('skip_intro_loader') !== 'true';
        }
        return true;
    });
    const [isLoaded, setIsLoaded] = useState(!showLoader);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const featuredCount = featured.length;
    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likesCountBySlug, setLikesCountBySlug] = useState<
        Record<string, number>
    >({});

    useEffect(() => {
        const initialLiked: Record<string, boolean> = {};
        const initialCounts: Record<string, number> = {};

        // Helper to populate from articles list
        const populate = (articles: any[]) => {
            articles.forEach(article => {
                if (article.is_liked) {
                    initialLiked[article.slug] = true;
                }
                initialCounts[article.slug] = article.likes_count ?? 0;
            });
        };

        populate(featured);
        if (props.latest_articles) populate(props.latest_articles);
        
        Object.values(latestByCategory).forEach(category => {
            populate(category.articles);
        });

        setLiked(initialLiked);
        setLikesCountBySlug(initialCounts);
    }, [featured, props.latest_articles, latestByCategory]);

    const formatCfa = (value: number | undefined) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const toggleLike = async (slug: string, baseLikes: number) => {
        try {
            const currentLiked = liked[slug];
            const newLiked = !currentLiked;

            // Optimistic update
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
            // Revert on error
            setLiked((prev) => ({ ...prev, [slug]: !prev[slug] }));
            setLikesCountBySlug((prev) => ({
                ...prev,
                [slug]: (prev[slug] ?? baseLikes) + (liked[slug] ? 1 : -1),
            }));
            console.error('Like error:', error);
        }
    };

    useEffect(() => {
        if (showLoader) {
            const timer = setTimeout(() => {
                setShowLoader(false);
                setIsLoaded(true);
            }, 2500);
            return () => clearTimeout(timer);
        } else {
            setIsLoaded(true);
        }
    }, [showLoader]);

    // Featured Carousel Autoplay
    useEffect(() => {
        const interval = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % featuredCount);
        }, 5000);
        return () => clearInterval(interval);
    }, [featuredCount]);

    return (
        <MainLayout title="Accueil">
            {showLoader && <IntroLoader onComplete={() => setShowLoader(false)} />}
            
            <div className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Modern Hero Section */}
                <section className="relative mb-6 md:mb-12 overflow-hidden bg-gray-900 text-white h-[500px] md:h-[700px] rounded-2xl md:rounded-[50px] mx-0 md:mx-4 mt-0 md:mt-4 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
                    
                    {/* Background Image with Blur */}
                    {featured.length > 0 && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105"
                            style={{ backgroundImage: `url(${featured[featuredIndex].image || '/images/placeholder.jpg'})` }}
                        />
                    )}

                    <div className="relative z-20 mx-auto max-w-7xl px-4 h-full flex items-center sm:px-6 lg:px-8 py-12 md:py-0">
                        <div className="max-w-3xl space-y-6">
                            {featured.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md border border-primary/20 mb-4">
                                        <Star className="mr-1.5 h-3.5 w-3.5" /> A la une
                                    </span>
                                    <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl mb-6">
                                        {featured[featuredIndex].title}
                                    </h1>
                                    <p className="text-lg text-gray-300 line-clamp-2 mb-8 max-w-2xl leading-relaxed">
                                        {featured[featuredIndex].excerpt}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
                                                {featured[featuredIndex].author.charAt(0)}
                                            </div>
                                            <span className="font-medium text-white">{featured[featuredIndex].author}</span>
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {featured[featuredIndex].published_human}
                                        </span>
                                    </div>

                                    <div className="flex gap-4">
                                        <a 
                                            href={`/article/${featured[featuredIndex].slug}`}
                                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105"
                                        >
                                            Lire l'article
                                            <ChevronRight className="ml-2 h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Carousel Indicators */}
                        <div className="absolute bottom-8 right-8 flex gap-2 z-30">
                            {featured.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setFeaturedIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === featuredIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-16">
                            
                            {/* Latest Articles Grid (Bento Style) */}
                            {Object.entries(latestByCategory).map(([key, category], index) => (
                                <div key={key}>
                                    <HomeCategorySection
                                        id={key}
                                        name={category.name}
                                        articles={category.articles}
                                        formatCfa={formatCfa}
                                        likedBySlug={liked}
                                        likesCountBySlug={likesCountBySlug}
                                        onToggleLike={toggleLike}
                                    />
                                </div>
                            ))}

                        </div>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
                            <HomeSidebar
                                marketPrices={props.market_prices}
                                webtvVideos={props.webtv_videos}
                                partners={partners}
                                comments={comments}
                            />
                        </aside>
                    </div>
                </div>

                {/* Web TV Section (Full Width) */}
                {props.webtv_videos && props.webtv_videos.length > 0 && (
                    <div className="mt-16 bg-gray-900 py-16 rounded-[50px] mx-4 shadow-2xl overflow-hidden mb-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <WebTvSection 
                                videos={props.webtv_videos ?? []} 
                                emissions={props.emissions ?? []}
                            />
                        </div>
                    </div>
                )}

                {/* Partners Section */}
                <PartnersSection partners={partners} />
            </div>
        </MainLayout>
    );
}
