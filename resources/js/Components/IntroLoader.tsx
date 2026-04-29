import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { ArrowRight, Check, Leaf, Loader2, Tractor, Wheat } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface IntroLoaderProps {
    onComplete: () => void;
}

const YT_VIDEO_ID = 'MhqYJkTZ-0M';
const FALLBACK_DURATION_MS = 18000;
const MIN_AUTO_DISPLAY_MS = 12000;

const LOADING_STEPS = [
    { label: 'Synchronisation', detail: 'Connexion au desk LE RURAL' },
    { label: 'Chargement', detail: 'Preparation de la une du jour' },
    { label: 'Indexation', detail: 'Dernieres analyses agricoles' },
    { label: 'Diffusion', detail: 'Ouverture de la redaction' },
];

declare global {
    interface Window {
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let ytApiPromise: Promise<any> | null = null;
function loadYouTubeAPI(): Promise<any> {
    if (typeof window === 'undefined') return Promise.reject();
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;

    ytApiPromise = new Promise((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-yt-api="1"]');
        if (!existing) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.setAttribute('data-yt-api', '1');
            document.head.appendChild(tag);
        }
        const prior = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prior?.();
            resolve(window.YT);
        };
        // Safety: if API was already ready just before the handler swap
        const poll = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(poll);
                resolve(window.YT);
            }
        }, 100);
        setTimeout(() => clearInterval(poll), 10000);
    });
    return ytApiPromise;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
    const { props } = usePage<PageProps<{ translations: Record<string, string> }>>();
    const t = props.translations ?? {};
    const [progress, setProgress] = useState(0);
    const [playerReady, setPlayerReady] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const playerRef = useRef<any>(null);
    const rafRef = useRef<number>(0);
    const deferFinishRef = useRef<number | null>(null);
    const mountRef = useRef<HTMLDivElement | null>(null);
    const startedAtRef = useRef<number>(0);
    const completedRef = useRef(false);

    const finish = useCallback((force = false) => {
        if (completedRef.current) return;

        const elapsed = performance.now() - startedAtRef.current;
        if (!force && elapsed < MIN_AUTO_DISPLAY_MS) {
            if (deferFinishRef.current) {
                window.clearTimeout(deferFinishRef.current);
            }
            deferFinishRef.current = window.setTimeout(() => finish(false), MIN_AUTO_DISPLAY_MS - elapsed);
            return;
        }
        if (deferFinishRef.current) {
            window.clearTimeout(deferFinishRef.current);
            deferFinishRef.current = null;
        }
        completedRef.current = true;
        if (dontShowAgain && typeof window !== 'undefined') {
            try {
                localStorage.setItem('skip_intro_loader', 'true');
            } catch {
                void 0;
            }
        }
        try {
            playerRef.current?.stopVideo?.();
            playerRef.current?.destroy?.();
        } catch {
            void 0;
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onComplete();
    }, [dontShowAgain, onComplete]);

    const handleSkipNow = useCallback(() => {
        finish(true);
    }, [finish]);

    // YouTube Player init
    useEffect(() => {
        let cancelled = false;
        startedAtRef.current = performance.now();

        loadYouTubeAPI()
            .then((YT) => {
                if (cancelled || !mountRef.current) return;
                playerRef.current = new YT.Player(mountRef.current, {
                    videoId: YT_VIDEO_ID,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        mute: 1,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        disablekb: 1,
                        fs: 0,
                        cc_load_policy: 0,
                    },
                    events: {
                        onReady: (e: any) => {
                            setPlayerReady(true);
                            try {
                                e.target.mute();
                                e.target.playVideo();
                            } catch {
                                void 0;
                            }
                        },
                        onStateChange: (e: any) => {
                            // 0 = ended
                            if (e.data === 0) finish();
                            // -1 unstarted, 3 buffering - nothing special
                        },
                        onError: () => {
                            setVideoFailed(true);
                        },
                    },
                });
            })
            .catch(() => setVideoFailed(true));

        // Progress ticker - uses real video playback when ready, otherwise fallback timer
        const tick = () => {
            try {
                const p = playerRef.current;
                if (p && typeof p.getDuration === 'function' && typeof p.getCurrentTime === 'function') {
                    const dur = p.getDuration();
                    const cur = p.getCurrentTime();
                    if (dur > 0) {
                        const pct = Math.min(cur / dur, 1);
                        setProgress(pct);
                        if (pct >= 0.999) {
                            finish();
                            return;
                        }
                    }
                } else {
                    const elapsed = performance.now() - startedAtRef.current;
                    const pct = Math.min(elapsed / FALLBACK_DURATION_MS, 1);
                    setProgress(pct);
                    if (videoFailed && pct >= 1) {
                        finish();
                        return;
                    }
                }
            } catch {
                void 0;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelled = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (deferFinishRef.current) {
                window.clearTimeout(deferFinishRef.current);
                deferFinishRef.current = null;
            }
            try {
                playerRef.current?.destroy?.();
            } catch {
                void 0;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoFailed]);

    const percent = Math.round(progress * 100);
    const activeStep = Math.min(LOADING_STEPS.length - 1, Math.floor(progress * LOADING_STEPS.length));
    const now = useMemo(
        () => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
        [],
    );
    const secondsLeft = useMemo(() => {
        const p = playerRef.current;
        try {
            if (p && typeof p.getDuration === 'function' && typeof p.getCurrentTime === 'function') {
                const dur = p.getDuration();
                const cur = p.getCurrentTime();
                if (dur > 0) return Math.max(0, Math.ceil(dur - cur));
            }
        } catch {
            void 0;
        }
        return Math.max(0, Math.ceil(((1 - progress) * FALLBACK_DURATION_MS) / 1000));
    }, [progress, playerReady]);

    return (
        <div className="fixed inset-0 z-[120] overflow-hidden bg-gray-950 text-white">
            {/* YouTube background video - scaled to cover viewport */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    ref={mountRef}
                    className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 opacity-60"
                />
                {!playerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                        <div className="flex flex-col items-center gap-3 text-white/60">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.28em]">Chargement de la diffusion</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-950/70 to-primary/30" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />

            {/* Floating agricultural icons */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute left-[12%] top-[18%] animate-pulse">
                    <Wheat className="h-8 w-8 text-primary/30" />
                </div>
                <div className="absolute right-[14%] top-[28%] animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <Leaf className="h-6 w-6 text-emerald-400/40" />
                </div>
                <div className="absolute left-[20%] bottom-[20%] animate-pulse" style={{ animationDelay: '1.2s' }}>
                    <Tractor className="h-10 w-10 text-primary/25" />
                </div>
                <div className="absolute right-[22%] bottom-[22%] animate-pulse" style={{ animationDelay: '0.9s' }}>
                    <Wheat className="h-7 w-7 text-primary/35" />
                </div>
            </div>

            {/* Vertical rail - desktop */}
            <div className="pointer-events-none absolute inset-y-0 left-6 hidden flex-col justify-between py-8 lg:flex">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>LE RURAL</span>
                </div>
                <div
                    className="text-[9px] font-black uppercase tracking-[0.28em] text-white/40"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    1<sup>er</sup> Groupe de Presse Agricole - {now}
                </div>
            </div>

            {/* Top-right progress ring */}
            <div className="absolute right-5 top-5 sm:right-8 sm:top-8 z-10">
                <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                        <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="url(#introGrad)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                            style={{ transition: 'stroke-dashoffset 200ms linear', filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.5))' }}
                        />
                        <defs>
                            <linearGradient id="introGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#86efac" />
                                <stop offset="100%" stopColor="#2f6a11" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-black/50 backdrop-blur-xl border border-white/10">
                        <span className="font-heading text-xl font-black tabular-nums text-white sm:text-2xl">
                            {percent}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.22em] text-primary">%</span>
                    </div>
                </div>
            </div>

            {/* Center content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 sm:p-12">
                {/* Eyebrow rail */}
                <div className="mb-6 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary sm:text-[11px]">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/40" />
                    <span className="text-white/60">Edition du jour</span>
                </div>

                {/* Masthead */}
                <h1 className="font-heading text-center text-5xl font-black uppercase tracking-tight leading-[0.9] text-white sm:text-7xl md:text-8xl">
                    <span className="text-white">LE </span>
                    <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-b from-white via-white to-primary/70 bg-clip-text text-transparent">
                            RURAL
                        </span>
                        <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-4 bg-primary/30 -skew-x-6 blur-sm" />
                    </span>
                </h1>

                <div className="mt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.28em] text-white/70 sm:text-[10px]">
                    <span className="h-px w-8 bg-white/30" />
                    <span>Presse agricole - Afrique de l'Ouest</span>
                    <span className="h-px w-8 bg-white/30" />
                </div>

                {/* Step indicator */}
                <div className="mt-10 w-full max-w-md">
                    <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em]">
                        <span className="text-primary">{LOADING_STEPS[activeStep]?.label}</span>
                        <span className="text-white/50 tabular-nums">
                            {String(activeStep + 1).padStart(2, '0')} / {String(LOADING_STEPS.length).padStart(2, '0')}
                        </span>
                    </div>
                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-emerald-400 to-primary shadow-[0_0_18px_rgba(74,222,128,0.6)]"
                            style={{ width: `${percent}%`, transition: 'width 220ms linear' }}
                        />
                    </div>
                    <div className="mt-2 text-center text-[11px] text-white/55">
                        {LOADING_STEPS[activeStep]?.detail}
                    </div>
                </div>

                {/* Don't show again checkbox */}
                <label className="mt-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/80 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/10 sm:text-[11px]">
                    <span
                        className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            dontShowAgain
                                ? 'border-primary bg-primary shadow-[0_0_12px_rgba(74,222,128,0.6)]'
                                : 'border-white/30 bg-white/5'
                        }`}
                    >
                        {dontShowAgain && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="sr-only"
                    />
                    Ne plus afficher prochainement
                </label>

                {/* Skip button */}
                <button
                    type="button"
                    onClick={handleSkipNow}
                    className="group mt-4 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-xl ring-1 ring-white/20 transition-all hover:bg-white hover:text-gray-950 hover:ring-white sm:text-[11px]"
                >
                    {t.loader_access ?? 'Entrer maintenant'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 tabular-nums">
                    Fin de la diffusion dans {secondsLeft}s
                </div>
            </div>

            {/* Footer progress bar */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
                <div
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary shadow-[0_0_20px_rgba(74,222,128,0.6)]"
                    style={{ width: `${percent}%`, transition: 'width 220ms linear' }}
                />
            </div>
        </div>
    );
}