import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

interface PendingPurchaseCheckerProps {
    children?: React.ReactNode;
}

export default function PendingPurchaseChecker({ children }: PendingPurchaseCheckerProps) {
    const { props, url } = usePage();
    const auth = props.auth as any;

    useEffect(() => {
        // Vérifier s'il y a un achat en cours après connexion/inscription
        if (auth?.user) {
            let purchaseData = null;
            
            // 1. Vérifier d'abord l'URL (priorité)
            const urlParams = new URLSearchParams(window.location.search);
            const purchaseParam = urlParams.get('purchase');
            
            if (purchaseParam) {
                try {
                    // Décoder les données de l'URL
                    const decodedData = atob(decodeURIComponent(purchaseParam));
                    purchaseData = JSON.parse(decodedData);
                    
                    // Nettoyer l'URL
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, '', cleanUrl);
                } catch (error) {
                    console.error('Erreur de décodage des données d\'achat depuis l\'URL:', error);
                }
            }
            
            // 2. Si pas dans l'URL, vérifier localStorage
            if (!purchaseData) {
                const pendingPurchase = localStorage.getItem('pending_purchase');
                
                if (pendingPurchase) {
                    try {
                        purchaseData = JSON.parse(pendingPurchase);
                    } catch (error) {
                        console.error('Erreur de parsing des données d\'achat depuis localStorage:', error);
                        localStorage.removeItem('pending_purchase');
                    }
                }
            }
            
            // 3. Vérifier la session PHP (backup)
            if (!purchaseData && props.pending_purchase) {
                purchaseData = props.pending_purchase;
            }
            
            // 4. Traiter les données d'achat trouvées
            if (purchaseData) {
                // Vérifier si l'achat n'est pas trop vieux (max 30 minutes)
                const now = Date.now();
                const purchaseTime = purchaseData.timestamp || 0;
                const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en ms
                
                if (now - purchaseTime < thirtyMinutes) {
                    // Nettoyer le localStorage
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
                    
                    console.log('🛒 Redirection automatique vers le checkout:', checkoutUrl);
                    
                    // Petite pause pour que la page se charge complètement
                    setTimeout(() => {
                        router.visit(checkoutUrl);
                    }, 2000); // Augmenté à 2 secondes pour laisser le temps de voir la bannière
                } else {
                    // Achat trop vieux, le supprimer
                    localStorage.removeItem('pending_purchase');
                }
            }
        }
    }, [auth?.user]);

    return <>{children}</>;
}
