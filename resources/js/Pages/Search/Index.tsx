import ArticleCard from '@/Components/ArticleCard';
import AuthModal from '@/Components/AuthModal';
import { Button } from '@/Components/ui/button';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchProps {
    query: string;
    results: {
        data: any[];
        links: any[];
        total: number;
    };
    min_subscription_price?: number | null;
}

export default function SearchIndex({ query, results, min_subscription_price }: SearchProps) {
    const { props } = usePage<any>();
    const authUser = props.auth?.user;
    const hasActiveSubscription = Boolean(props.auth?.has_active_subscription);
    const isElevatedUser = Boolean(authUser && ['admin', 'editor'].includes(String(authUser.role ?? '')));
    const [showSubscriptionAuthModal, setShowSubscriptionAuthModal] = useState(false);
    const subscriptionCtaLabel = hasActiveSubscription ? 'Tableau de bord' : "S'abonner";

    const formatCfa = (value: number | null | undefined) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const handleSubscriptionCta = () => {
        if (!authUser) {
            setShowSubscriptionAuthModal(true);
            return;
        }

        if (isElevatedUser) {
            window.location.href = '/dashboard';
            return;
        }

        if (hasActiveSubscription) {
            window.location.href = route('user.subscription');
            return;
        }

        window.location.href = '/checkout?type=subscription&id=default';
    };

    return (
        <MainLayout title={`Recherche : ${query}`}>
            <AuthModal
                isOpen={showSubscriptionAuthModal}
                onClose={() => setShowSubscriptionAuthModal(false)}
                purchaseType="subscription"
            />
            <Head title={`Recherche : ${query}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">Resultats de recherche</h1>
                    <p className="text-muted-foreground">
                        {results.total} resultat(s) pour "<span className="font-semibold text-foreground">{query}</span>"
                    </p>
                </div>

                {!isElevatedUser && (
                    <section className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-emerald-700 to-emerald-800 p-[1px] shadow-[0_20px_60px_-35px_rgba(47,106,17,0.45)]">
                        <div className="rounded-3xl bg-gray-950 px-5 py-6 text-white sm:px-7 sm:py-7">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">Abonnement LE RURAL</p>
                            <h2 className="mt-2 font-heading text-2xl font-black tracking-tight sm:text-3xl">
                                {hasActiveSubscription ? 'Votre abonnement est actif' : 'Accedez a tous les contenus premium'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-300">
                                {hasActiveSubscription
                                    ? 'Retrouvez vos articles, factures et parametres dans votre tableau de bord.'
                                    : 'Abonnez-vous pour lire les analyses payantes et les dossiers exclusifs.'}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Button onClick={handleSubscriptionCta} className="rounded-full px-6 text-[11px] font-black uppercase tracking-[0.14em]">
                                    {subscriptionCtaLabel} {!hasActiveSubscription && min_subscription_price ? `des ${formatCfa(min_subscription_price)}` : ''}
                                </Button>
                                {!authUser && (
                                    <Link
                                        href={route('register')}
                                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-white/40 hover:bg-white/10"
                                    >
                                        Creer un compte
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {results.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {results.data.map((article) => (
                            <ArticleCard key={article.id || article.slug} a={article} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-muted/50 p-6">
                            <Search className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Aucun resultat trouve</h3>
                        <p className="max-w-md text-muted-foreground">
                            Nous n'avons trouve aucun article correspondant a votre recherche. Essayez d'autres mots-cles.
                        </p>
                    </div>
                )}

                {results.links.length > 3 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex flex-wrap items-center gap-2">
                            {results.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}



