import MainLayout from '@/Layouts/MainLayout';
import { Link, Head, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { Calendar, Eye, ThumbsUp, MessageSquare, Facebook, Twitter, Phone, Lock, ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ArticleCard from '@/Components/ArticleCard';
import HomeSidebar from '@/Components/HomeSidebar';
import AdSpace from '@/Components/AdSpace';
import CommentItem from '@/Components/CommentItem';
import ImageWithFallback from '@/Components/ImageWithFallback';
import Paywall from '@/Components/Paywall';

interface ArticleShowProps {
    article: {
        id: number;
        slug: string;
        title: string;
        content: string | null;
        excerpt: string | null;
        image: string | null;
        author: string;
        published_at: string | null;
        published_human: string | null;
        category: any;
        likes_count: number;
        views_count: number;
        comments_count: number;
        is_liked: boolean;
        is_saved?: boolean;
        premium: boolean;
        can_read?: boolean;
        price: number | string | null;
        comments: any[];
        read_time?: number;
    };
    similar_articles: any[];
    market_prices?: any[];
    webtv_videos?: any[];
    partners?: any[];
    latest_comments?: any[];
    min_subscription_price?: number | null;
}

export default function ArticleShow({ article, similar_articles, min_subscription_price }: ArticleShowProps) {
    const { props } = usePage<any>();
    const locale = props.locale ?? 'fr';
    const flash = props.flash ?? {};
    const marketPrices = props.market_prices ?? [];
    const webtvVideos = props.webtv_videos ?? [];
    const partners = props.partners ?? [];
    const latestComments = props.latest_comments ?? [];
    
    const [likesCount, setLikesCount] = useState(article.likes_count);
    const [isLiked, setIsLiked] = useState(article.is_liked);
    const [isSaved, setIsSaved] = useState(article.is_saved ?? false);

    // Similar articles state
    const [similarLiked, setSimilarLiked] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        similar_articles.forEach(article => {
            if (article.is_liked) {
                initial[article.slug] = true;
            }
        });
        return initial;
    });
    const [similarLikesCount, setSimilarLikesCount] = useState<Record<string, number>>({});
    
    const auth = props.auth?.user;
    
    // Comment Form with Inertia useForm
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        author_name: auth ? auth.name : '',
        author_email: auth ? auth.email : '',
        rating: 5,
    });

    const formatCfa = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const handleLike = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        const prevLiked = isLiked;
        const prevCount = likesCount;
        
        setIsLiked(!prevLiked);
        setLikesCount(prevCount + (!prevLiked ? 1 : -1));

        try {
            await axios.post(`/articles/${article.slug}/like`);
        } catch {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const handleSimilarLike = async (slug: string, baseLikes: number) => {
        const currentLiked = similarLiked[slug];
        const newLiked = !currentLiked;
        
        setSimilarLiked(prev => ({ ...prev, [slug]: newLiked }));
        setSimilarLikesCount(prev => ({ ...prev, [slug]: (prev[slug] ?? baseLikes) + (newLiked ? 1 : -1) }));

        try {
            await axios.post(`/articles/${slug}/like`);
        } catch {
            setSimilarLiked(prev => ({ ...prev, [slug]: currentLiked }));
            setSimilarLikesCount(prev => ({ ...prev, [slug]: (prev[slug] ?? baseLikes) + (currentLiked ? 1 : -1) }));
        }
    };

    const handleSave = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!auth) {
            window.location.href = '/login';
            return;
        }
        
        const prevSaved = isSaved;
        setIsSaved(!prevSaved);

        try {
            await axios.post(`/articles/${article.slug}/save`);
        } catch {
            setIsSaved(prevSaved);
        }
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/articles/${article.id}/comments`, {
            onSuccess: () => reset('content'),
            preserveScroll: true,
        });
    };

    // Fix category display if it's not an object with name
    const categoryName = typeof article.category === 'object' && article.category !== null 
        ? (article.category.name_fr || article.category.name) 
        : (typeof article.category === 'string' ? article.category : 'Catégorie');

    const categorySlug = typeof article.category === 'object' && article.category !== null 
        ? article.category.slug 
        : '#';

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <MainLayout title={article.title}>
            <Head>
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.excerpt || ''} />
                <meta property="og:image" content={article.image || ''} />
                <meta property="og:url" content={shareUrl} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gray-900 pb-16 pt-16 lg:pt-20 rounded-2xl md:rounded-[50px] mx-0 md:mx-4 mt-0 md:mt-4 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 z-10" />
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-105"
                    style={{ backgroundImage: `url(${article.image || '/images/placeholder.jpg'})` }}
                />
                
                <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                            {(article.categories && article.categories.length > 0) ? (
                                article.categories.map((cat: any) => (
                                    <Link 
                                        key={cat.slug}
                                        href={`/categorie/${cat.slug}`}
                                        className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition-colors shadow-sm"
                                    >
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (article.category && typeof article.category === 'object') ? (
                                <Link 
                                    href={`/categorie/${article.category.slug}`}
                                    className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition-colors shadow-sm"
                                >
                                    {article.category.name_fr || article.category.name}
                                </Link>
                            ) : (typeof article.category === 'string') ? (
                                <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-md border border-white/20 shadow-sm">
                                    {article.category}
                                </span>
                            ) : null}
                            
                            {article.premium ? (
                                <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
                                    <Lock className="w-3 h-3 mr-1" />
                                    {article.price ? `${formatCfa(article.price)}` : 'PAYANT'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-green-500/90 px-3 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
                                    GRATUIT
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl mb-8 drop-shadow-lg">
                            {article.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white border-2 border-gray-600">
                                    {article.author ? article.author.charAt(0) : '?'}
                                </div>
                                <span className="font-bold text-white">{article.author || 'Auteur inconnu'}</span>
                            </div>
                            <span className="hidden sm:inline text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {article.published_at || article.published_human}
                            </span>
                            <span className="hidden sm:inline text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                {new Intl.NumberFormat(locale).format(article.views_count)} vues
                            </span>
                            {article.read_time && (
                                <>
                                    <span className="hidden sm:inline text-gray-600">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="h-1 w-1 rounded-full bg-current" />
                                        {article.read_time} min de lecture
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-0 md:px-4 sm:px-6 lg:px-8 mt-8 relative z-30 pb-16">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
                    
                    {/* Main Article Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-none md:rounded-2xl shadow-xl border-y md:border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {/* Featured Image */}
                            {article.image && (
                                <div className="aspect-[21/9] w-full overflow-hidden">
                                    <ImageWithFallback 
                                        src={article.image} 
                                        alt={article.title} 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-6 sm:p-10">
                                {/* Actions Bar */}
                                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6 mb-8 gap-4">
                                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-500'}`}
                                            onClick={handleLike}
                                        >
                                            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                            {likesCount} <span className="hidden sm:inline">J'aime</span>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={`gap-2 ${isSaved ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-gray-500'}`}
                                            onClick={handleSave}
                                        >
                                            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                                            <span className="hidden sm:inline">{isSaved ? 'Enregistré' : 'Sauvegarder'}</span>
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                                                <Facebook className="h-4 w-4 text-blue-600" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                                            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${article.title}`} target="_blank" rel="noopener noreferrer">
                                                <Twitter className="h-4 w-4 text-sky-500" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                                            <a href={`https://wa.me/?text=${article.title} ${shareUrl}`} target="_blank" rel="noopener noreferrer">
                                                <Phone className="h-4 w-4 text-green-500" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="prose prose-lg prose-indigo max-w-none dark:prose-invert">
                                    {article.excerpt && (
                                        <p className="lead font-medium text-gray-700 dark:text-gray-300 border-l-4 border-primary pl-4 italic bg-gray-50 dark:bg-gray-900/50 p-4 rounded-r-lg">
                                            {article.excerpt}
                                        </p>
                                    )}
                                    
                                    <div 
                                        className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-primary hover:prose-a:text-primary/80"
                                        dangerouslySetInnerHTML={{ __html: article.content || '' }}
                                    />
                                    
                                    {/* Paywall */}
                            {!article.can_read && article.premium && (
                                <Paywall 
                                    price={article.price} 
                                    articleId={article.id} 
                                    articleSlug={article.slug}
                                    title="Contenu Payant"
                                    minSubscriptionPrice={min_subscription_price}
                                />
                            )}
                                </div>

                                {/* Tags & Navigation */}
                                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <Button variant="link" className="pl-0 text-gray-500 hover:text-primary transition-colors" asChild>
                                            <Link href={`/categorie/${article.category.slug}`} className="flex items-center gap-2">
                                                <ArrowLeft className="h-4 w-4" />
                                                Retour à {article.category.name}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Space Article Bottom */}
                        <AdSpace 
                            width="100%" 
                            height={150} 
                            locationId={`article_${article.slug}_bottom`} 
                            className="my-12 rounded-xl overflow-hidden shadow-sm"
                        />

                        {/* Author Bio */}
                        <div className="mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center sm:text-left">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-4 ring-gray-50 dark:ring-gray-700">
                                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-white">
                                    {article.author.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">À propos de {article.author}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                                    Rédacteur expert sur Le Rural. Passionné par l'agriculture durable et les innovations technologiques dans le secteur agro-alimentaire en Afrique de l'Ouest.
                                </p>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mb-12 rounded-xl bg-white p-6 sm:p-10 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700" id="comments">
                            <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                Commentaires ({article.comments?.length || 0})
                            </h3>

                            {/* Flash Message */}
                            {flash.success && (
                                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                                    {flash.success}
                                </div>
                            )}

                            {/* Comment Form */}
                            <form onSubmit={submitComment} className="mb-10 rounded-xl bg-gray-50 p-6 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Laisser un commentaire</h4>
                                {!auth && (
                                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            className="w-full rounded-lg border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                            required
                                            value={data.author_name}
                                            onChange={(e) => setData('author_name', e.target.value)}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full rounded-lg border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                            required
                                            value={data.author_email}
                                            onChange={(e) => setData('author_email', e.target.value)}
                                        />
                                    </div>
                                )}
                                <textarea
                                    rows={4}
                                    placeholder="Partagez votre avis..."
                                    className="mb-4 w-full rounded-lg border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                    required
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing} className="rounded-full px-6">
                                        {processing ? 'Envoi...' : 'Publier le commentaire'}
                                    </Button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-8">
                                {article.comments && article.comments.length > 0 ? (
                                    article.comments.map((comment) => (
                                        <CommentItem 
                                            key={comment.id} 
                                            comment={comment} 
                                            articleId={article.id} 
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 italic py-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl">Soyez le premier à commenter cet article !</p>
                                )}
                            </div>
                        </div>

                        {/* Similar Articles */}
                        {similar_articles.length > 0 && (
                            <section>
                                <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4">
                                    Articles similaires
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {similar_articles.map((article) => (
                                        <ArticleCard
                                            key={article.slug}
                                            a={article}
                                            priceLabel={formatCfa(article.price)}
                                            liked={Boolean(similarLiked[article.slug])}
                                            onToggleLike={() => handleSimilarLike(article.slug, article.likes_count ?? 0)}
                                            likesCount={similarLikesCount[article.slug]}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
                        <HomeSidebar
                            marketPrices={marketPrices}
                            webtvVideos={webtvVideos}
                            partners={partners}
                            comments={latestComments}
                        />
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}
