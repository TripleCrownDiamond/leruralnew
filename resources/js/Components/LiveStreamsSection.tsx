import ImageWithFallback from '@/Components/ImageWithFallback';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock3, Radio, Tv2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface LiveStream {
    id: number;
    platform: 'youtube' | 'facebook' | 'tiktok' | 'twitch' | 'obs' | 'streamyard' | 'custom';
    title: string;
    stream_url: string;
    embed_url?: string | null;
    thumbnail_url?: string | null;
    fallback_image_url?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
}

interface EmissionSource {
    id: number;
    name: string;
    playlist_url?: string | null;
}

const DEFAULT_CONTINUOUS_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';

const platformLabels: Record<string, string> = {
    youtube: 'YouTube',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    twitch: 'Twitch',
    obs: 'OBS',
    streamyard: 'StreamYard',
    custom: 'Personnalise',
};

function toDate(value?: string | null): Date | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatClock(value?: string | null): string {
    const date = toDate(value);
    if (!date) {
        return 'Bientot';
    }

    return date.toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
    });
}

function formatCountdown(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getStreamStatus(stream: LiveStream, now: number): 'current' | 'ended' | 'upcoming' {
    const startsAt = toDate(stream.starts_at);
    const endsAt = toDate(stream.ends_at);

    if (startsAt && startsAt.getTime() <= now && (!endsAt || endsAt.getTime() >= now)) {
        return 'current';
    }

    if (endsAt && endsAt.getTime() < now) {
        return 'ended';
    }

    return 'upcoming';
}

function extractYouTubeId(url?: string | null): string | null {
    if (!url) return null;

    const match =
        url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i) ??
        url.match(/[?&]v=([A-Za-z0-9_-]{11})/i);

    return match?.[1] ?? null;
}

function extractYouTubePlaylistId(url?: string | null): string | null {
    if (!url) return null;

    const match = url.match(/[?&]list=([A-Za-z0-9_-]+)/i);

    return match?.[1] ?? null;
}

function buildYouTubeEmbed(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;
}

function buildYouTubePlaylistEmbed(playlistId: string): string {
    return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;
}

function resolvePlayableSourceUrl(source?: string | null): string | null {
    if (!source) {
        return null;
    }

    const trimmed = source.trim();

    if (!trimmed) {
        return null;
    }

    const youtubeId = extractYouTubeId(trimmed);
    if (youtubeId) {
        return buildYouTubeEmbed(youtubeId);
    }

    const playlistId = extractYouTubePlaylistId(trimmed);
    if (playlistId) {
        return buildYouTubePlaylistEmbed(playlistId);
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
        return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }

    return null;
}

function resolveLivePlayerUrl(stream?: LiveStream | null): string | null {
    if (!stream) {
        return null;
    }

    return resolvePlayableSourceUrl(stream.embed_url || stream.stream_url || null);
}

export default function LiveStreamsSection({
    streams,
    emissions = [],
    fallbackVideoUrl = null,
    className,
}: {
    streams: LiveStream[];
    emissions?: EmissionSource[];
    fallbackVideoUrl?: string | null;
    className?: string;
}) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const orderedStreams = useMemo(
        () =>
            [...streams].sort((a, b) => {
                const startA = toDate(a.starts_at)?.getTime() ?? Number.POSITIVE_INFINITY;
                const startB = toDate(b.starts_at)?.getTime() ?? Number.POSITIVE_INFINITY;

                if (startA !== startB) {
                    return startA - startB;
                }

                return a.id - b.id;
            }),
        [streams],
    );

    const currentStream = useMemo(
        () => orderedStreams.find((stream) => getStreamStatus(stream, now) === 'current') ?? null,
        [now, orderedStreams],
    );

    const nextStream = useMemo(
        () => orderedStreams.find((stream) => getStreamStatus(stream, now) === 'upcoming') ?? null,
        [now, orderedStreams],
    );

    const visibleStreams = useMemo(
        () => orderedStreams.filter((stream) => getStreamStatus(stream, now) !== 'ended'),
        [now, orderedStreams],
    );

    const displayStream = currentStream ?? nextStream ?? null;
    const nextStart = toDate(nextStream?.starts_at);
    const countdown = nextStart ? Math.max(0, nextStart.getTime() - now) : null;
    const startsSoon = countdown !== null && countdown > 0 && countdown <= 5 * 60 * 1000;

    const fallbackPreviewSource = useMemo(() => {
        const emissionFallback = emissions.find((emission) => Boolean(emission.playlist_url?.trim()))?.playlist_url ?? null;

        return fallbackVideoUrl || emissionFallback || DEFAULT_CONTINUOUS_PLAYLIST_URL;
    }, [emissions, fallbackVideoUrl]);

    const previewEmbedUrl = useMemo(() => {
        if (currentStream) {
            return resolveLivePlayerUrl(currentStream);
        }

        return resolvePlayableSourceUrl(fallbackPreviewSource);
    }, [currentStream, fallbackPreviewSource]);

    const previewLabel = currentStream ? 'Apercu live actif' : 'Apercu direct';

    return (
        <section className={cn('mx-0 mb-16 md:mx-4', className)}>
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-gray-950">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="border-b border-gray-200 p-5 dark:border-white/10 lg:border-b-0 lg:border-r lg:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                                <Radio className="h-4 w-4" />
                                Emissions
                            </div>
                            <Link
                                href={route('live.index')}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/30"
                            >
                                Voir direct
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 dark:border-white/10">
                                <div className="flex items-center justify-between border-b border-white/10 bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
                                    <span>{previewLabel}</span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px]">Preview</span>
                                </div>
                                <div className="aspect-video bg-black">
                                    {previewEmbedUrl ? (
                                        <iframe
                                            title={currentStream?.title ?? 'Apercu direct LE RURAL'}
                                            src={previewEmbedUrl}
                                            className="h-full w-full"
                                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                            allowFullScreen
                                            referrerPolicy="strict-origin-when-cross-origin"
                                        />
                                    ) : (
                                        <ImageWithFallback
                                            src={currentStream?.thumbnail_url ?? currentStream?.fallback_image_url ?? undefined}
                                            alt={currentStream?.title ?? 'Apercu direct'}
                                            className="h-full w-full object-cover"
                                            fallbackSrc="/images/article-placeholder.svg"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4 dark:border-primary/20 dark:bg-primary/15">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {currentStream
                                        ? 'Emission en cours'
                                        : nextStream
                                          ? startsSoon
                                              ? 'Compte a rebours'
                                              : 'Prochaine diffusion'
                                          : 'Direct'}
                                </div>
                                <h3 className="mt-2 font-heading text-2xl font-black uppercase leading-[0.98] tracking-tight text-gray-950 dark:text-white">
                                    {displayStream?.title ?? 'Direct LE RURAL'}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-white/75">
                                    {currentStream
                                        ? `Diffusion en cours depuis ${formatClock(currentStream.starts_at)}.`
                                        : nextStream
                                          ? startsSoon
                                              ? `Le direct commence dans ${formatCountdown(countdown ?? 0)}.`
                                              : `Diffusion prevue le ${formatClock(nextStream.starts_at)}.`
                                          : 'Le direct reste disponible. Consultez la page Direct pour voir le flux en cours.'}
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-600 dark:text-white/55">
                                    <span className="rounded-full border border-gray-300 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                                        {displayStream ? platformLabels[displayStream.platform] : 'Direct'}
                                    </span>
                                    <span className="rounded-full border border-gray-300 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                                        {displayStream?.starts_at ? formatClock(displayStream.starts_at) : 'Disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                            <Tv2 className="h-4 w-4" />
                            Selection
                        </div>
                        {visibleStreams.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {visibleStreams.slice(0, 4).map((stream) => {
                                    const isCurrent = stream.id === currentStream?.id;
                                    const isNext = stream.id === nextStream?.id;

                                    return (
                                        <article
                                            key={stream.id}
                                            className={cn(
                                                'rounded-2xl border p-3 transition',
                                                isCurrent
                                                    ? 'border-primary/40 bg-primary/15 ring-2 ring-primary/25'
                                                    : isNext
                                                      ? 'border-primary/25 bg-primary/10 dark:bg-primary/12'
                                                      : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.04]',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/55">
                                                <span>{platformLabels[stream.platform]}</span>
                                                <span className={isCurrent ? 'text-primary' : 'text-gray-400'}>{isCurrent ? 'En cours' : isNext ? 'A suivre' : 'Programme'}</span>
                                            </div>

                                            <h4 className={cn('mt-2 line-clamp-2 text-sm font-black leading-snug', isCurrent ? 'text-gray-950 dark:text-white' : 'text-gray-900 dark:text-white')}>
                                                {stream.title}
                                            </h4>

                                            <p className="mt-1 text-[11px] text-gray-500 dark:text-white/55">{formatClock(stream.starts_at)}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/65">
                                Contenu en attente de publication.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

