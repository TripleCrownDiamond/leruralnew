import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { AlertCircle, ShoppingCart, Crown, ArrowRight } from 'lucide-react';

interface PendingPurchaseBannerProps {
    onPurchaseComplete?: () => void;
}

export default function PendingPurchaseBanner({ onPurchaseComplete }: PendingPurchaseBannerProps) {
    const { props, url } = usePage();
    const auth = props.auth as any;
    const [purchaseData, setPurchaseData] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Vérifier s'il y a un achat en cours
        if (auth?.user) {
            let pendingPurchase = null;
            
            // 1. Vérifier l'URL d'abord
            const urlParams = new URLSearchParams(window.location.search);
            const purchaseParam = urlParams.get('purchase');
            
            if (purchaseParam) {
                try {
                    const decodedData = atob(decodeURIComponent(purchaseParam));
                    pendingPurchase = JSON.parse(decodedData);
                    
                    // Nettoyer l'URL
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, '', cleanUrl);
                } catch (error) {
                    console.error('Erreur de décodage des données d\'achat depuis l\'URL:', error);
                }
            }
            
            // 2. Vérifier localStorage
            if (!pendingPurchase) {
                const storedPurchase = localStorage.getItem('pending_purchase');
                if (storedPurchase) {
                    try {
                        pendingPurchase = JSON.parse(storedPurchase);
                    } catch (error) {
                        console.error('Erreur de parsing des données d\'achat depuis localStorage:', error);
                        localStorage.removeItem('pending_purchase');
                    }
                }
            }
            
            // 3. Vérifier la session PHP (si disponible)
            if (!pendingPurchase && props.pending_purchase) {
                pendingPurchase = props.pending_purchase;
            }
            
            if (pendingPurchase) {
                // Vérifier si l'achat n'est pas trop vieux (30 minutes)
                const now = Date.now();
                const purchaseTime = pendingPurchase.timestamp || 0;
                const thirtyMinutes = 30 * 60 * 1000;
                
                if (now - purchaseTime < thirtyMinutes) {
                    setPurchaseData(pendingPurchase);
                    setIsVisible(true);
                } else {
                    // Achat trop vieux, nettoyer
                    localStorage.removeItem('pending_purchase');
                }
            }
        }
    }, [auth?.user, props]);

    const handleContinuePurchase = () => {
        if (!purchaseData) return;
        
        // Nettoyer les données
        localStorage.removeItem('pending_purchase');
        
        // Rediriger vers le checkout approprié
        let checkoutUrl = '/checkout';
        
        if (purchaseData.type === 'article') {
            const articleId = purchaseData.articleSlug || purchaseData.articleId;
            checkoutUrl = `/checkout?type=article&id=${articleId}`;
        } else if (purchaseData.type === 'subscription') {
            // Pour les abonnements, utiliser 'default' comme ID ou le premier plan disponible
            checkoutUrl = `/checkout?type=subscription&id=default`;
        }
        
        router.visit(checkoutUrl);
        
        if (onPurchaseComplete) {
            onPurchaseComplete();
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.removeItem('pending_purchase');
    };

    if (!isVisible || !purchaseData || !auth?.user) {
        return null;
    }

    const isArticle = purchaseData.type === 'article';
    const price = purchaseData.price ? new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
    }).format(Number(purchaseData.price)) : null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                        {isArticle ? (
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        ) : (
                            <Crown className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            {isArticle ? 'Finaliser votre achat d\'article' : 'Finaliser votre abonnement'}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            {isArticle 
                                ? 'Vous avez commencé l\'achat d\'un article. Continuez pour finaliser votre paiement.'
                                : 'Vous avez commencé le processus d\'abonnement. Continuez pour finaliser votre souscription.'
                            }
                        </p>
                        {price && (
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Montant : {price}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        Plus tard
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleContinuePurchase}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
