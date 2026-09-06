import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRight, Radio, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const DEFAULT_FALLBACK_URL =
    'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';

interface LiveStream {
    id: number;
    platform?: string;
    title?: string;
    stream_url?: string;
    embed_url?: string | null;
    thumbnail_url?: string | null;
    fallback_image_url?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
}

interface LiveDirectPopupProps {
    streams?: LiveStream[];
    fallbackVideoUrl?: string | null;
    onClose: () => void;
}

function toDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function extractYouTubeId(url?: string | null): string | null {
    if (!url) return null;
    const match =
        url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i) ??
        url.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
    return match?.[1] ?? null;
}

function extractYouTubePlaylistId(url?: string | null): string | null {
    if (!url) return null;
    const match = url.match(/[?&]list=([A-Za-z0-9_-]+)/i);
    return match?.[1] ?? null;
}

function resolveEmbedUrl(source?: string | null): string | null {
    if (!source) return null;
    const trimmed = source.trim();
    if (!trimmed) return null;

    const videoId = extractYouTubeId(trimmed);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;
    }

    const playlistId = extractYouTubePlaylistId(trimmed);
    if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
        return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }

    return null;
}

export default function LiveDirectPopup({
    streams = [],
    fallbackVideoUrl = null,
    onClose,
}: LiveDirectPopupProps) {
    const now = useMemo(() => Date.now(), []);

    const currentStream = useMemo(() => {
        const active = streams.find((stream) => {
            const startsAt = toDate(stream.starts_at);
            const endsAt = toDate(stream.ends_at);
            return (
                startsAt &&
                startsAt.getTime() <= now &&
                (!endsAt || endsAt.getTime() >= now)
            );
        });

        return active ?? null;
    }, [now, streams]);

    const upcomingStream = useMemo(() => {
        const upcoming = streams.find((stream) => {
            const startsAt = toDate(stream.starts_at);
            return startsAt ? startsAt.getTime() > now : false;
        });

        return upcoming ?? null;
    }, [now, streams]);

    const displayStream = currentStream ?? upcomingStream ?? null;

    const embedUrl = useMemo(() => {
        if (currentStream) {
            return resolveEmbedUrl(currentStream.embed_url || currentStream.stream_url);
        }

        return resolveEmbedUrl(fallbackVideoUrl || DEFAULT_FALLBACK_URL);
    }, [currentStream, fallbackVideoUrl]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose]);

    const isLive = Boolean(currentStream);

    return (
        <div
            className="fixed bottom-4 right-4 z-[120] w-[calc(100vw-2rem)] max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-500"
            role="dialog"
            aria-modal="false"
            aria-label="Apercu du direct"
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-950 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.75)]">
                {/* Ambient glow */}
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />

                {/* Header */}
                <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-white/70">
                        <span className={cn('relative flex h-2 w-2', isLive && 'animate-pulse')}>
                            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-70', isLive ? 'animate-ping bg-red-500' : 'bg-primary')} />
                            <span className={cn('relative inline-flex h-2 w-2 rounded-full', isLive ? 'bg-red-500' : 'bg-primary')} />
                        </span>
                        <span className="text-primary">LE RURAL</span>
                        <span className="text-white/25">/</span>
                        <span className={isLive ? 'text-red-400' : 'text-white/50'}>
                            {isLive ? 'En direct' : 'Direct'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white hover:text-gray-900"
                        aria-label="Fermer"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Compact preview */}
                <div className="relative aspect-video w-full bg-black">
                    {embedUrl ? (
                        <iframe
                            title={displayStream?.title || 'Apercu direct LE RURAL'}
                            src={embedUrl}
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
                            <Radio className="h-8 w-8 animate-pulse text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.24em]">
                                Direct en cours de preparation
                            </span>
                        </div>
                    )}

                    {/* Live badge overlay */}
                    {isLive && (
                        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-lg">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            LIVE
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="relative px-4 pb-4 pt-3.5">
                    <h2 className="line-clamp-1 font-heading text-sm font-black uppercase tracking-tight text-white">
                        {displayStream?.title || 'Direct LE RURAL'}
                    </h2>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                        {isLive
                            ? 'La diffusion est en cours. Rejoignez le direct pour suivre l\u2019emission en temps reel.'
                            : upcomingStream
                              ? 'L\u2019emission arrive bientot. Ouvrez le direct pour ne rien manquer.'
                              : 'La chaine diffuse en continu. Decouvrez le direct, les replays et la grille.'}
                    </p>

                    <div className="mt-3.5 flex items-center gap-2">
                        <Link
                            href={route('live.index')}
                            onClick={onClose}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/30 transition hover:scale-[1.02]"
                        >
                            Voir le direct
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/10"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
