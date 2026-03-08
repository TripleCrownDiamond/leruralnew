import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface IntroLoaderProps {
    onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
    const { props } =
        usePage<PageProps<{ translations: Record<string, string> }>>();
    const t = props.translations ?? {};
    const [videoReady, setVideoReady] = useState(false);
    const [error, setError] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15); // Default duration if we can't get it
    const [skip, setSkip] = useState(false);
    const loadTimeoutRef = useRef<number | null>(null);

    // Timeout de sécurité au cas où la vidéo ne charge pas
    useEffect(() => {
        if (!videoReady) {
            loadTimeoutRef.current = window.setTimeout(() => {
                if (!videoReady) {
                    console.warn('Video load timeout, forcing complete');
                    setError(true);
                    setVideoReady(true);
                }
            }, 5000); // 5 secondes max pour le chargement
        }

        // Countdown timer
        let interval: NodeJS.Timeout;
        if (videoReady && !error) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
            }
            if (interval) clearInterval(interval);
        };
    }, [videoReady, error, onComplete]);

    const handleVideoLoad = () => {
        console.log('Video loaded via iframe');
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
        }
        setError(false);
        setVideoReady(true);
    };

    const handleAccess = () => {
        if (skip) {
            localStorage.setItem('skip_intro_loader', 'true');
        }
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
            {/* Video Background Container */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 h-full w-full">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/F6yv6lkzI3c?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=F6yv6lkzI3c&modestbranding=1&playsinline=1&enablejsapi=1&vq=hd1080"
                        title="Le Rural Intro"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={handleVideoLoad}
                        className="absolute left-1/2 top-1/2 h-[300%] w-[300%] -translate-x-1/2 -translate-y-1/2 object-cover sm:h-full sm:w-full sm:scale-150"
                        style={{ pointerEvents: 'none' }}
                    ></iframe>
                </div>
                {/* Overlay to darken video */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Content Overlay */}
            <div
                className={cn(
                    'relative z-40 flex h-full w-full flex-col items-center justify-center p-4 text-center transition-opacity duration-1000',
                    'opacity-100',
                )}
            >
                {/* Logo Blanc */}
                <div className="mb-2">
                    <img
                        src="/logos/logo-blanc.png"
                        alt="Le Rural"
                        className="h-auto w-64 drop-shadow-xl md:w-96"
                    />
                </div>

                {/* Slogan removed as requested */}

                <div className="mb-4 flex items-center gap-2 text-sm text-white/90">
                    <input
                        id="skip-intro"
                        type="checkbox"
                        checked={skip}
                        onChange={(e) => setSkip(e.target.checked)}
                        className="h-4 w-4 rounded border-white/30 bg-transparent"
                    />
                    <label htmlFor="skip-intro">
                        {t.loader_skip ?? 'Ne plus afficher au démarrage'}
                    </label>
                </div>

                <div className="pt-6">
                    <Button
                        size="lg"
                        onClick={handleAccess}
                        className="transform rounded-md border-2 border-white/20 bg-primary px-12 py-6 text-xl font-bold text-white shadow-2xl backdrop-blur-sm transition hover:scale-105 hover:bg-primary/90"
                    >
                        {t.loader_access ?? 'Accéder au site'}
                    </Button>
                </div>

                {/* Timer moved to top right with better style */}
                <div className="absolute right-6 top-6">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                        {!error ? (
                            <span>
                                {(t.loader_opening_in ?? 'Ouverture dans') +
                                    ' '}
                                <span className="font-bold text-white">
                                    {timeLeft}s
                                </span>
                            </span>
                        ) : (
                            <span className="text-red-400">
                                {t.video_unavailable ?? 'Vidéo indisponible'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
