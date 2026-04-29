import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { X, CreditCard, Crown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchaseType: 'article' | 'subscription';
    articleId?: number;
    articleSlug?: string;
    price?: number | string | null;
}

export default function AuthModal({
    isOpen,
    onClose,
    purchaseType,
    articleId,
    articleSlug,
    price,
}: AuthModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'login' | 'register' | null>(null);
    const [mounted, setMounted] = useState(false);
    const { props } = usePage();
    const auth = props.auth as any;

    const formatPrice = (amount: number | string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const persistPurchaseAndGo = (target: 'login' | 'register') => {
        const purchaseData = {
            type: purchaseType,
            articleId,
            articleSlug,
            price,
            timestamp: Date.now(),
        };

        localStorage.setItem('pending_purchase', JSON.stringify(purchaseData));
        setIsLoading(true);
        setLoadingAction(target);

        const routeName = target === 'login' ? 'login' : 'register';
        const url = route(routeName) + '?purchase=' + encodeURIComponent(btoa(JSON.stringify(purchaseData)));

        router.visit(url, {
            onFinish: () => {
                setIsLoading(false);
                setLoadingAction(null);
                onClose();
            },
        });
    };

    if (auth?.user) return null;
    if (!isOpen || !mounted) return null;

    const isArticle = purchaseType === 'article';

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-3 pt-24 sm:items-center sm:p-4" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-gray-950/78 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_35px_120px_-40px_rgba(0,0,0,0.7)] ring-1 ring-black/5 dark:border-white/10 dark:bg-gray-950 dark:ring-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div aria-hidden="true" className="pointer-events-none absolute -top-28 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-16 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }}
                />

                <div className="relative flex items-center gap-3 border-b border-gray-100 bg-white/70 px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-gray-500 backdrop-blur dark:border-white/5 dark:bg-gray-950/70 dark:text-gray-400">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>LE RURAL</span>
                    <span className="text-gray-300 dark:text-white/20">/</span>
                    <span>{isArticle ? 'Achat article' : 'Abonnement'}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Fermer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="relative p-6 sm:p-8">
                    <div className="mb-4 flex justify-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl shadow-primary/30">
                            {isArticle ? <CreditCard className="h-6 w-6" /> : <Crown className="h-6 w-6" />}
                        </div>
                    </div>

                    <h3 className="font-heading text-center text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        {isArticle ? 'Finaliser votre achat' : 'Devenir abonne LE RURAL'}
                    </h3>

                    {isArticle && price && (
                        <div className="mt-3 text-center">
                            <span className="inline-flex items-baseline gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Prix</span>
                                <span className="font-heading text-3xl font-black leading-none text-primary">{formatPrice(price)}</span>
                            </span>
                        </div>
                    )}

                    {!isArticle && (
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                            Acces illimite a toutes nos analyses agricoles
                        </p>
                    )}

                    <div className="mx-auto mt-5 max-w-md rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs font-semibold leading-relaxed text-primary dark:border-primary/20 dark:bg-primary/10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Inscription rapide, puis redirection automatique vers le paiement.</span>
                        </div>
                    </div>

                    <p className="mt-5 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        Creer un compte prend moins d'une minute.
                    </p>

                    <Button
                        onClick={() => persistPurchaseAndGo('register')}
                        disabled={isLoading}
                        className="group mt-6 h-12 w-full rounded-full bg-primary text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01]"
                    >
                        {loadingAction === 'register' ? 'Redirection...' : (
                            <>
                                Creer un compte et payer
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </Button>

                    <div className="my-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                        <span>ou</span>
                        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                    </div>

                    <button
                        type="button"
                        onClick={() => persistPurchaseAndGo('login')}
                        disabled={isLoading}
                        className="w-full rounded-full border border-gray-200 bg-white py-3 text-sm font-black uppercase tracking-[0.14em] text-gray-700 transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:border-primary/50"
                    >
                        {loadingAction === 'login' ? 'Redirection...' : "J'ai deja un compte - Se connecter"}
                    </button>

                    <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Paiement securise - Donnees protegees</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}