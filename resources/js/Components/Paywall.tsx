import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Lock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import AuthModal from '@/Components/AuthModal';
import AdSpace from '@/Components/AdSpace';

interface PaywallProps {
    title?: string;
    description?: string;
    price?: number | string | null;
    currency?: string;
    articleId?: number;
    articleSlug?: string;
    minSubscriptionPrice?: number | string | null;
}

export default function Paywall({
    title = "Contenu reserve aux abonnes",
    description = "Cet article fait partie de nos analyses exclusives. Debloquez l'integralite de nos enquetes et chroniques agricoles.",
    price,
    currency = "XOF",
    articleId,
    articleSlug,
    minSubscriptionPrice
}: PaywallProps) {

    const [showAuthModal, setShowAuthModal] = useState<'article' | 'subscription' | null>(null);
    const { props } = usePage();
    const auth = props.auth as any;

    const formatPrice = (amount: number | string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(Number(amount));
    };

    const handlePurchase = (type: 'article' | 'subscription') => {
        if (auth?.user) {
            const checkoutUrl = type === 'article'
                ? `/checkout?type=article&item=${articleSlug}`
                : '/checkout?type=subscription&id=default';
            window.location.href = checkoutUrl;
        } else {
            setShowAuthModal(type);
        }
    };

    return (
        <div className="not-prose my-12">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(47,106,17,0.25)] ring-1 ring-gray-200 dark:bg-gray-950 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] dark:ring-white/10">

                {/* Editorial grain + radial glow */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }} />
                <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/10" />

                {/* Top brand rule */}
                <div className="relative flex items-center gap-3 border-b border-gray-100 px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-gray-500 dark:border-white/5 dark:text-gray-400 sm:px-10">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>LE RURAL</span>
                    <span className="text-gray-300 dark:text-white/20">/</span>
                    <span>Acces Premium</span>
                    <span className="ml-auto hidden sm:inline">Edition numerique</span>
                </div>

                <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:p-14">

                    {/* LEFT - editorial headline + CTAs */}
                    <div className="flex flex-col">
                        <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary dark:border-primary/30 dark:bg-primary/10">
                            <Lock className="h-3.5 w-3.5" />
                            Article Premium
                        </div>

                        <h3 className="font-heading text-4xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                            {title}
                        </h3>

                        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                            {description}
                        </p>

                        {/* Subscriber perks */}
                        <ul className="mt-7 grid gap-2.5 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
                            {[
                                "Analyses agricoles exclusives",
                                "Archives completes",
                                "Newsletter prioritaire",
                                "Lecture sans publicite tierce",
                            ].map((perk) => (
                                <li key={perk} className="flex items-start gap-2">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <Button
                                size="lg"
                                onClick={() => handlePurchase('subscription')}
                                className="group relative inline-flex h-auto min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-3 text-center text-sm font-black uppercase leading-tight tracking-[0.14em] text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] sm:w-auto"
                            >
                                <Sparkles className="h-4 w-4 shrink-0" />
                                <span className="whitespace-normal">S'abonner a LE RURAL</span>
                                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                            </Button>

                            <button
                                onClick={() => setShowAuthModal('subscription')}
                                className="w-full text-center text-sm font-semibold text-gray-600 underline-offset-4 transition-colors hover:text-primary hover:underline dark:text-gray-400 sm:w-auto sm:text-left"
                            >
                                Deja abonne ? Se connecter
                            </button>
                        </div>
                    </div>

                    {/* RIGHT - price cards + ad */}
                    <div className="flex flex-col gap-5">

                        {/* Article single purchase */}
                        {price && (
                            <button
                                type="button"
                                onClick={() => handlePurchase('article')}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary/50"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                                            A l'unite
                                        </div>
                                        <div className="mt-1.5 font-heading text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                            {formatPrice(price)}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Acces immediat a cet article
                                        </div>
                                    </div>
                                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                </div>
                            </button>
                        )}

                        {/* Subscription highlight */}
                        <button
                            type="button"
                            onClick={() => handlePurchase('subscription')}
                            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-700 p-[1.5px] text-left shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                        >
                            <div className="relative rounded-[calc(1rem-1px)] bg-primary p-5 pr-24 text-white sm:pr-28">
                                <div className="absolute right-4 top-4 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur">
                                    Recommande
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                                    Abonnement illimite
                                </div>
                                <div className="mt-1.5 font-heading text-3xl font-black tracking-tight leading-none">
                                    {minSubscriptionPrice ? `Des ${formatPrice(minSubscriptionPrice)}` : 'Des 500 FCFA'}
                                </div>
                                <div className="mt-1 text-xs leading-relaxed text-white/80">
                                    Tout LE RURAL, sans limite, resiliable a tout moment.
                                </div>
                                <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 text-sm font-bold leading-tight">
                                    <span className="whitespace-normal">Je m'abonne</span>
                                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </button>

                        {/* Admin-manageable ad slot - seul l'admin voit le placeholder vide */}
                        <AdSpace
                            locationId="paywall_sponsor"
                            label="Sponsor (Paywall)"
                            width="100%"
                            height={140}
                            className="rounded-2xl"
                            hideWhenEmpty
                        />
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal !== null}
                onClose={() => setShowAuthModal(null)}
                purchaseType={showAuthModal || 'article'}
                articleId={articleId}
                articleSlug={articleSlug}
                price={showAuthModal === 'article' ? price : undefined}
            />
        </div>
    );
}

