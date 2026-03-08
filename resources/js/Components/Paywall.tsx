import { Link } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/Components/ui/button';

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
    title = "Contenu Payant", 
    description = "Cet article est réservé à nos abonnés. Connectez-vous ou achetez l'article pour accéder à l'intégralité de nos analyses exclusives.",
    price,
    currency = "XOF",
    articleId,
    articleSlug,
    minSubscriptionPrice
}: PaywallProps) {
    
    const formatPrice = (amount: number | string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(Number(amount));
    };

    return (
        <div className="not-prose my-12 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8 text-center shadow-xl relative overflow-hidden ring-1 ring-gray-200 dark:ring-white/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 rounded-full bg-primary/10 dark:bg-gradient-to-br dark:from-primary/20 dark:to-primary/5 p-4 backdrop-blur-md border border-primary/20 shadow-inner">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                
                <h3 className="mb-3 text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h3>
                
                <p className="mb-8 max-w-lg text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {description}
                </p>
                
                <div className="flex flex-col w-full max-w-sm gap-4">
                    {/* Option 1: Buy Single Article */}
                    {price && (
                        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-colors">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">Achat &agrave; l'unit&eacute;</div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">Acc&egrave;s imm&eacute;diat</span>
                            </div>
                            <Button size="lg" className="w-full rounded-lg font-bold shadow-lg shadow-primary/20" asChild>
                                <a href={`/checkout?type=article&id=${articleSlug || articleId}`}>
                                    Acheter cet article
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Option 2: Subscription */}
                    <div className="bg-primary/5 dark:bg-gradient-to-br dark:from-primary/10 dark:to-transparent backdrop-blur-sm rounded-xl p-4 border border-primary/20 hover:border-primary/50 transition-colors">
                        <div className="text-sm text-primary mb-1 font-medium uppercase tracking-wider">Abonnement illimit&eacute;</div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {minSubscriptionPrice ? `À partir de ${formatPrice(minSubscriptionPrice)}` : 'À partir de 500 FCFA'}
                            </span>
                            <span className="text-xs bg-primary text-white px-2 py-1 rounded font-bold">Recommand&eacute;</span>
                        </div>
                        <Button size="lg" variant="outline" className="w-full rounded-lg font-bold border-primary text-primary hover:bg-primary hover:text-white" asChild>
                            <Link href={route('register')}>
                                S'abonner maintenant
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-2 text-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">D&eacute;j&agrave; abonn&eacute; ? </span>
                        <Link href={route('login')} className="text-sm font-bold text-primary hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}