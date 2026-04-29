import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

interface PendingPurchase {
    type: 'article' | 'subscription';
    articleId?: number;
    articleSlug?: string;
    price?: number | string | null;
    timestamp: number;
}

const SKIP_REDIRECT_PATHS = ['/checkout', '/payment/success', '/payment/failed'];

export function usePendingPurchase() {
    const { props } = usePage();
    const auth = props.auth as any;

    useEffect(() => {
        if (!auth?.user || typeof window === 'undefined') {
            return;
        }

        const currentPath = window.location.pathname;
        if (SKIP_REDIRECT_PATHS.some((path) => currentPath.startsWith(path))) {
            return;
        }

        const pendingPurchaseStr = localStorage.getItem('pending_purchase');
        if (!pendingPurchaseStr) {
            return;
        }

        let timeoutId: number | null = null;

        try {
            const pendingPurchase: PendingPurchase = JSON.parse(pendingPurchaseStr);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000;

            if (now - pendingPurchase.timestamp >= maxAge) {
                localStorage.removeItem('pending_purchase');
                return;
            }

            const checkoutUrl = pendingPurchase.type === 'article'
                ? `/checkout?type=article&id=${pendingPurchase.articleSlug || pendingPurchase.articleId}`
                : '/checkout?type=subscription&id=default';

            localStorage.removeItem('pending_purchase');

            timeoutId = window.setTimeout(() => {
                router.visit(checkoutUrl);
            }, 100);
        } catch {
            localStorage.removeItem('pending_purchase');
        }

        return () => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [auth?.user]);

    const setPendingPurchase = (purchase: Omit<PendingPurchase, 'timestamp'>) => {
        const pendingPurchase: PendingPurchase = {
            ...purchase,
            timestamp: Date.now(),
        };

        localStorage.setItem('pending_purchase', JSON.stringify(pendingPurchase));
    };

    const clearPendingPurchase = () => {
        localStorage.removeItem('pending_purchase');
    };

    return {
        setPendingPurchase,
        clearPendingPurchase,
    };
}
