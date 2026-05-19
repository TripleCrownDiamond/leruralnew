import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Radio, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface LiveStream {
    id: number;
    title: string;
    platform: string;
    starts_at: string | null;
    ends_at: string | null;
}

interface LiveNotificationToastProps {
    liveStreams: LiveStream[];
    className?: string;
}

/**
 * Composant qui affiche un toast quand un live démarre
 * Il compare les streams actifs et détecte les nouveaux
 */
export default function LiveNotificationToast({
    liveStreams,
    className = '',
}: LiveNotificationToastProps) {
    const [visibleToast, setVisibleToast] = useState<LiveStream | null>(null);
    const [previousLiveIds, setPreviousLiveIds] = useState<Set<number>>(new Set());
    const [dismissed, setDismissed] = useState<Set<number>>(new Set());

    // Détermine quels streams sont actuellement en direct
    const getActiveLiveIds = useCallback((streams: LiveStream[]): Set<number> => {
        const now = Date.now();
        const activeIds = new Set<number>();

        streams.forEach((stream) => {
            const startsAt = stream.starts_at ? new Date(stream.starts_at).getTime() : null;
            const endsAt = stream.ends_at ? new Date(stream.ends_at).getTime() : null;

            // Stream actif si : starts_at <= now ET (ends_at est null OU ends_at >= now)
            if (startsAt && startsAt <= now && (!endsAt || endsAt >= now)) {
                activeIds.add(stream.id);
            }
        });

        return activeIds;
    }, []);

    // Détecte les nouveaux lives
    useEffect(() => {
        const currentActiveIds = getActiveLiveIds(liveStreams);

        // Trouve les nouveaux streams qui viennent de commencer
        const newLiveIds = [...currentActiveIds].filter(
            (id) => !previousLiveIds.has(id) && !dismissed.has(id)
        );

        // S'il y a un nouveau live, affiche le toast
        if (newLiveIds.length > 0 && !visibleToast) {
            const newLiveId = newLiveIds[0];
            const newLive = liveStreams.find((s) => s.id === newLiveId);

            if (newLive) {
                setVisibleToast(newLive);

                // Auto-hide après 10 secondes
                setTimeout(() => {
                    setVisibleToast((current) =>
                        current?.id === newLive.id ? null : current
                    );
                }, 10000);
            }
        }

        setPreviousLiveIds(currentActiveIds);
    }, [liveStreams, getActiveLiveIds, previousLiveIds, dismissed, visibleToast]);

    const handleDismiss = () => {
        if (visibleToast) {
            setDismissed((prev) => new Set([...prev, visibleToast.id]));
            setVisibleToast(null);
        }
    };

    const handleGoToLive = () => {
        if (visibleToast) {
            setDismissed((prev) => new Set([...prev, visibleToast.id]));
            setVisibleToast(null);
            router.visit('/direct');
        }
    };

    if (!visibleToast) return null;

    return (
        <div
            className={cn(
                'fixed bottom-24 right-4 z-[80] max-w-sm animate-in fade-in slide-in-from-right-5 duration-300',
                className
            )}
        >
            <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-white shadow-[0_20px_60px_-20px_rgba(239,68,68,0.4)] dark:border-red-500/30 dark:bg-gray-900">
                {/* Header avec animation pulse */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-white">
                    <div className="relative">
                        <Radio className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                        </span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.15em]">
                        En direct maintenant
                    </span>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="ml-auto rounded-full p-1 transition hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="p-4">
                    <h4 className="font-heading text-lg font-black uppercase leading-tight text-gray-900 dark:text-white">
                        {visibleToast.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Une nouvelle émission vient de commencer sur LE RURAL.
                    </p>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={handleGoToLive}
                            className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600"
                        >
                            Regarder
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="rounded-full border border-gray-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}