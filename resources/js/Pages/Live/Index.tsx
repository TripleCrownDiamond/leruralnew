import MainLayout from '@/Layouts/MainLayout';

import useSharedContent from '@/Hooks/useSharedContent';

import { router, usePage } from '@inertiajs/react';

import type { PageProps } from '@/types';

import { Clock3, Radio, Tv2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useEffect, useMemo, useRef, useState } from 'react';

type LiveStream = {
    id: number;

    platform:
        | 'youtube'
        | 'facebook'
        | 'tiktok'
        | 'twitch'
        | 'obs'
        | 'streamyard'
        | 'custom';

    title: string;

    stream_url: string;

    embed_url?: string | null;

    replay_url?: string | null;

    thumbnail_url?: string | null;

    fallback_image_url?: string | null;

    starts_at?: string | null;

    ends_at?: string | null;
};

type YouTubeVideo = {
    id?: string;

    youtube_id: string;

    title: string;

    thumbnail?: string | null;

    published_at?: string | null;

    url?: string | null;
};

type Emission = {
    id: number;

    name: string;

    description?: string | null;

    image?: string | null;

    playlist_url?: string | null;
};

type PlaybackItem = {
    id: string;

    title: string;

    url?: string | null;

    embedUrl: string;

    badge: string;

    kind: 'jingle' | 'emission';
};

type PlaybackCursor = {
    index: number;
    startOffsetSeconds: number;
    slotStartedAt: number;
};

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

function formatDateTime(value?: string | null): string {
    const date = toDate(value);

    if (!date) {
        return 'Programme libre';
    }

    return date.toLocaleString('fr-FR', {
        weekday: 'short',

        day: 'numeric',

        month: 'short',

        hour: '2-digit',

        minute: '2-digit',
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

function getStreamStatus(
    stream: LiveStream,
    now: number,
): 'current' | 'ended' | 'upcoming' {
    const startsAt = toDate(stream.starts_at);

    const endsAt = toDate(stream.ends_at);

    if (
        startsAt &&
        startsAt.getTime() <= now &&
        (!endsAt || endsAt.getTime() >= now)
    ) {
        return 'current';
    }

    if (endsAt && endsAt.getTime() < now) {
        return 'ended';
    }

    return 'upcoming';
}

function extractYouTubeId(url?: string | null): string | null {
    if (!url) return null;

    const patterns = [
        // Standard watch URL
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
        // Live URL format: youtube.com/live/VIDEO_ID
        /youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,
        // Channel live format: youtube.com/@channel/live -> needs special handling
        /youtube\.com\/@[^/]+\/live/i,
        // Query param
        /[?&]v=([A-Za-z0-9_-]{11})/i,
    ];

    // Check for channel live URL first (returns null, needs embed URL)
    if (/youtube\.com\/@[^/]+\/live/i.test(url)) {
        return null; // Will use the URL directly as embed
    }

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1] && match[1].length === 11) {
            return match[1];
        }
    }

    return null;
}

function buildYouTubeEmbedParams(): URLSearchParams {
    return new URLSearchParams({
        autoplay: '1',

        mute: '1',

        rel: '0',

        playsinline: '1',

        controls: '1',

        modestbranding: '1',

        fs: '1',

        loop: '1',

        enablejsapi: '1',

        origin: typeof window !== 'undefined' ? window.location.origin : '',
    });
}

function extractYouTubePlaylistId(url?: string | null): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url, 'https://www.youtube.com');
        const playlistId = parsed.searchParams.get('list')?.trim();

        if (playlistId) {
            return playlistId;
        }
    } catch {
        // Fallback to regex below.
    }

    const match = url.match(/[?&]list=([A-Za-z0-9_-]+)/i);

    return match?.[1] ?? null;
}

function buildYouTubeVideoEmbed(videoId: string): string {
    const params = buildYouTubeEmbedParams();

    params.set('playlist', videoId);

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function buildYouTubePlaylistEmbed(playlistId: string): string {
    const params = buildYouTubeEmbedParams();

    params.set('list', playlistId);
    params.set('playlist', playlistId);

    return `https://www.youtube.com/embed/videoseries?${params.toString()}`;
}

function resolvePlayableSourceUrl(source?: string | null): string | null {
    if (!source) {
        return null;
    }

    const trimmed = source.trim();

    if (!trimmed) {
        return null;
    }

    const videoId = extractYouTubeId(trimmed);

    if (videoId) {
        return buildYouTubeVideoEmbed(videoId);
    }

    const playlistId = extractYouTubePlaylistId(trimmed);

    if (playlistId) {
        return buildYouTubePlaylistEmbed(playlistId);
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
        return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }

    return trimmed;
}

function resolveLivePlayerUrl(
    stream?: LiveStream | null,
    mode: 'live' | 'replay' = 'live',
): string | null {
    if (!stream) {
        return null;
    }

    const source =
        mode === 'replay'
            ? stream.replay_url || stream.embed_url || stream.stream_url
            : stream.embed_url || stream.stream_url || stream.replay_url;

    return resolvePlayableSourceUrl(source);
}

function getPlaybackDurationMs(
    item: PlaybackItem,
    jingleDurationSeconds: number,
    emissionDurationSeconds: number,
): number {
    const rawDurationSeconds =
        item.kind === 'emission'
            ? emissionDurationSeconds
            : jingleDurationSeconds;

    const safeDurationSeconds = Number.isFinite(rawDurationSeconds)
        ? Math.max(1, Math.floor(rawDurationSeconds))
        : 90;

    return safeDurationSeconds * 1000;
}

function resolveSynchronizedPlaybackCursor(
    queue: PlaybackItem[],
    jingleDurationSeconds: number,
    emissionDurationSeconds: number,
    nowMs: number,
): PlaybackCursor {
    if (queue.length === 0) {
        return {
            index: 0,
            startOffsetSeconds: 0,
            slotStartedAt: nowMs,
        };
    }

    const slotDurations = queue.map((item) =>
        getPlaybackDurationMs(item, jingleDurationSeconds, emissionDurationSeconds),
    );
    const cycleDuration = slotDurations.reduce(
        (acc, duration) => acc + duration,
        0,
    );

    if (cycleDuration <= 0) {
        return {
            index: 0,
            startOffsetSeconds: 0,
            slotStartedAt: nowMs,
        };
    }

    const anchorMs = Date.UTC(2024, 0, 1, 0, 0, 0);
    const elapsedSinceAnchor =
        ((nowMs - anchorMs) % cycleDuration + cycleDuration) % cycleDuration;

    let cursor = elapsedSinceAnchor;
    let accumulated = 0;

    for (let index = 0; index < slotDurations.length; index += 1) {
        const slotDuration = slotDurations[index];

        if (cursor < slotDuration) {
            return {
                index,
                startOffsetSeconds: Math.max(0, Math.floor(cursor / 1000)),
                slotStartedAt: nowMs - cursor,
            };
        }

        cursor -= slotDuration;
        accumulated += slotDuration;
    }

    return {
        index: 0,
        startOffsetSeconds: 0,
        slotStartedAt: nowMs - accumulated,
    };
}

function withYouTubeStartOffset(
    embedUrl: string,
    startOffsetSeconds: number,
): string {
    const safeOffset = Math.max(0, Math.floor(startOffsetSeconds));

    if (safeOffset <= 0) {
        return embedUrl;
    }

    try {
        const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://lerural.bj';
        const parsed = new URL(embedUrl, baseOrigin);

        if (!parsed.hostname.includes('youtube.com')) {
            return embedUrl;
        }

        parsed.searchParams.set('start', String(safeOffset));

        return parsed.toString();
    } catch {
        return embedUrl;
    }
}

function buildFallbackPlayback(url: string): PlaybackItem {
    const source = url.trim() || 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';
    const videoId = extractYouTubeId(source);
    const playlistId = extractYouTubePlaylistId(source);
    const embedUrl = resolvePlayableSourceUrl(source) || buildYouTubePlaylistEmbed('PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5');

    return {
        id: videoId ? `video-${videoId}` : playlistId ? `playlist-${playlistId}` : 'fallback-jingle',
        title: 'Jingle LE RURAL',
        url: videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : playlistId
              ? `https://www.youtube.com/playlist?list=${playlistId}`
              : source,
        embedUrl,
        badge: playlistId ? 'Jingle playlist' : 'Jingle',
        kind: 'jingle',
    };
}

function buildEmissionPlayback(emission: Emission): PlaybackItem | null {
    const source = emission.playlist_url?.trim();

    if (!source) {
        return null;
    }

    const embedUrl = resolvePlayableSourceUrl(source);

    if (!embedUrl) {
        return null;
    }

    return {
        id: `emission-${emission.id}`,

        title: emission.name?.trim() || 'Emission par defaut',

        url: source,

        embedUrl,

        badge: 'Emission',

        kind: 'emission',
    };
}

export default function LiveIndex() {
    const { liveStreams, liveReplays, youtubeChannel, emissions } = useSharedContent();

    const { props } =
        usePage<PageProps<{ settings?: Record<string, string> }>>();

    const fallbackVideoUrl =
        props.settings?.live_fallback_video_url?.trim() ||
        'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';

    const [now, setNow] = useState(() => Date.now());

    const [playbackCursor, setPlaybackCursor] = useState<PlaybackCursor>(() => ({
        index: 0,
        startOffsetSeconds: 0,
        slotStartedAt: Date.now(),
    }));

    const [playerReady, setPlayerReady] = useState(false);
    const [playerError, setPlayerError] = useState(false);
    const [selectedReplayUrl, setSelectedReplayUrl] = useState<string | null>(
        null,
    );

    const playerRef = useRef<HTMLIFrameElement | null>(null);
    const errorTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    const streams = useMemo(
        () =>
            [...(liveStreams as LiveStream[])].sort((a, b) => {
                const startA =
                    toDate(a.starts_at)?.getTime() ?? Number.POSITIVE_INFINITY;

                const startB =
                    toDate(b.starts_at)?.getTime() ?? Number.POSITIVE_INFINITY;

                if (startA !== startB) {
                    return startA - startB;
                }

                return a.id - b.id;
            }),

        [liveStreams],
    );

    const defaultPlaybackQueue = useMemo<PlaybackItem[]>(() => {
        const queue: PlaybackItem[] = [];
        const fallbackItem = buildFallbackPlayback(fallbackVideoUrl);
        const emissionQueue = (emissions as Emission[])
            .map((emission) => buildEmissionPlayback(emission))
            .filter((item): item is PlaybackItem => Boolean(item));

        if (emissionQueue.length === 0) {
            return [fallbackItem];
        }

        queue.push(fallbackItem);

        emissionQueue.forEach((emission) => {
            queue.push(emission);
            queue.push(fallbackItem);
        });

        return queue;
    }, [emissions, fallbackVideoUrl]);

    const fallbackPlayback = useMemo(
        () => buildFallbackPlayback(fallbackVideoUrl),
        [fallbackVideoUrl],
    );

    const activePlaybackQueue = defaultPlaybackQueue;

    const jingleDurationSeconds =
        Number(props.settings?.live_jingle_duration_seconds) || 90;
    const emissionDurationSeconds = Number(props.settings?.live_emission_duration_seconds) || 720;

    useEffect(() => {
        setPlaybackCursor(
            resolveSynchronizedPlaybackCursor(
                activePlaybackQueue,
                jingleDurationSeconds,
                emissionDurationSeconds,
                Date.now(),
            ),
        );
    }, [
        activePlaybackQueue,
        emissionDurationSeconds,
        jingleDurationSeconds,
    ]);

    useEffect(() => {
        if (activePlaybackQueue.length <= 1) {
            return;
        }

        const activePlayback =
            activePlaybackQueue[playbackCursor.index] ?? fallbackPlayback;
        const slotDurationMs = getPlaybackDurationMs(
            activePlayback,
            jingleDurationSeconds,
            emissionDurationSeconds,
        );
        const elapsedMs = Math.max(
            0,
            Date.now() - playbackCursor.slotStartedAt,
        );
        const remainingMs = Math.max(1000, slotDurationMs - elapsedMs);

        const timer = window.setTimeout(() => {
            setPlaybackCursor((current) => ({
                index: (current.index + 1) % activePlaybackQueue.length,
                startOffsetSeconds: 0,
                slotStartedAt: Date.now(),
            }));
        }, remainingMs);

        return () => window.clearTimeout(timer);
    }, [
        activePlaybackQueue,
        emissionDurationSeconds,
        fallbackPlayback,
        jingleDurationSeconds,
        playbackCursor.index,
        playbackCursor.slotStartedAt,
    ]);

    const liveNow = useMemo(
        () =>
            streams.find((stream) => {
                const startsAt = toDate(stream.starts_at);

                const endsAt = toDate(stream.ends_at);

                if (!startsAt || startsAt.getTime() > now) {
                    return false;
                }

                return !endsAt || endsAt.getTime() >= now;
            }) ?? null,

        [now, streams],
    );

    const nextStream = useMemo(
        () =>
            streams.find((stream) => {
                const startsAt = toDate(stream.starts_at);

                return startsAt ? startsAt.getTime() > now : false;
            }) ?? null,

        [now, streams],
    );

    const nextStartsAt = toDate(nextStream?.starts_at);

    const countdownMs = nextStartsAt
        ? Math.max(0, nextStartsAt.getTime() - now)
        : null;

    const startingSoon =
        countdownMs !== null && countdownMs <= 5 * 60 * 1000 && countdownMs > 0;

    const latestReplay = useMemo(
        () =>
            [...(liveReplays as LiveStream[])]

                .filter((stream) => Boolean(stream.replay_url))

                .sort((a, b) => {
                    const endA =
                        toDate(a.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    const endB =
                        toDate(b.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    if (endA !== endB) {
                        return endB - endA;
                    }

                    return b.id - a.id;
                })[0] ?? null,

        [liveReplays],
    );

    useEffect(() => {
        if (liveNow || startingSoon || selectedReplayUrl) {
            return;
        }

        const timer = window.setInterval(() => {
            router.reload();
        }, 60_000);

        return () => window.clearInterval(timer);
    }, [liveNow, selectedReplayUrl, startingSoon]);

    const programmingByDay = useMemo(() => {
        const groups = new Map<string, LiveStream[]>();

        streams.forEach((stream) => {
            if (getStreamStatus(stream, now) === 'ended') {
                return;
            }

            const key = stream.starts_at
                ? new Date(stream.starts_at).toISOString().slice(0, 10)
                : 'unscheduled';

            const current = groups.get(key) ?? [];

            current.push(stream);

            groups.set(key, current);
        });

        return Array.from(groups.entries())

            .map(([key, items]) => ({
                key,

                label:
                    key === 'unscheduled'
                        ? 'Sans date'
                        : new Date(`${key}T12:00:00`).toLocaleDateString(
                              'fr-FR',
                              {
                                  weekday: 'long',

                                  day: 'numeric',

                                  month: 'long',
                              },
                          ),

                items,
            }))

            .sort((a, b) => a.key.localeCompare(b.key, 'fr'));
    }, [now, streams]);

    const currentProgramId = liveNow?.id ?? null;

    const activePlayback =
        activePlaybackQueue[playbackCursor.index] ?? fallbackPlayback;

    const scheduledPlaybackUrl = useMemo(() => {
        if (!activePlayback?.embedUrl) {
            return activePlayback?.embedUrl;
        }

        return withYouTubeStartOffset(
            activePlayback.embedUrl,
            playbackCursor.startOffsetSeconds,
        );
    }, [
        activePlayback?.embedUrl,
        playbackCursor.startOffsetSeconds,
    ]);

    const replayPlayerUrl = selectedReplayUrl;

    const heroPlayerUrl =
        resolveLivePlayerUrl(liveNow, 'live') ||
        replayPlayerUrl ||
        scheduledPlaybackUrl;

    const heroStream =
        liveNow ??
        (replayPlayerUrl ? latestReplay : null) ??
        (startingSoon ? nextStream : null) ??
        (!liveNow && !replayPlayerUrl && activePlayback.kind === 'emission'
            ? activePlayback
            : null);

    const heroStreamStartAt =
        heroStream && 'starts_at' in heroStream
            ? heroStream.starts_at
            : null;

    const heroModeLabel = liveNow
        ? 'En direct'
        : replayPlayerUrl
          ? 'Rediffusion'
          : startingSoon
            ? 'Emission a venir'
            : activePlayback.kind === 'emission'
              ? 'Emission par defaut'
              : 'Jingle en boucle';

    const isYoutubePlayer = heroPlayerUrl.includes('youtube.com/embed');

    useEffect(() => {
        setPlayerReady(false);
        setPlayerError(false);
        
        // Clear any existing error timeout
        if (errorTimeoutRef.current) {
            window.clearTimeout(errorTimeoutRef.current);
        }
        
        // Set a timeout to detect if iframe fails to load
        errorTimeoutRef.current = window.setTimeout(() => {
            if (!playerReady) {
                console.warn('Player load timeout - may have failed');
            }
        }, 15000);
        
        return () => {
            if (errorTimeoutRef.current) {
                window.clearTimeout(errorTimeoutRef.current);
            }
        };
    }, [heroPlayerUrl]);

    useEffect(() => {
        if (!playerReady || !isYoutubePlayer) {
            return;
        }

        const timer = window.setTimeout(() => {
            const frame = playerRef.current;

            if (!frame?.contentWindow) {
                return;
            }

            const send = (func: string, args: unknown[] = []) => {
                frame.contentWindow?.postMessage(
                    JSON.stringify({ event: 'command', func, args }),
                    '*',
                );
            };

            send('playVideo');

            send('unMute');

            send('setVolume', [100]);
        }, 800);

        return () => window.clearTimeout(timer);
    }, [isYoutubePlayer, playerReady]);

    return (
        <MainLayout title="Direct">
            <section className="mx-auto max-w-7xl px-2 py-4 sm:px-4 lg:px-8 lg:py-8">
                <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />

                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        Direct
                    </span>

                    <span>LE RURAL</span>

                    <span className="h-px w-8 bg-primary/30" />

                    <span>Diffusion continue 24h</span>

                    {youtubeChannel?.title && (
                        <span className="text-primary/70">
                            {youtubeChannel.title}
                        </span>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-35px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-gray-950">
                            <div className="relative min-h-[440px] overflow-hidden bg-gray-950 lg:min-h-[760px]">
                                {heroPlayerUrl && !playerError ? (
                                    <iframe
                                        key={heroPlayerUrl}
                                        ref={playerRef}
                                        src={heroPlayerUrl}
                                        title={
                                            heroStream?.title ||
                                            activePlayback.title ||
                                            'Diffusion LE RURAL'
                                        }
                                        className="absolute inset-0 z-0 h-full w-full"
                                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        onLoad={() => {
                                            setPlayerReady(true);
                                            setPlayerError(false);
                                            if (errorTimeoutRef.current) {
                                                window.clearTimeout(errorTimeoutRef.current);
                                            }
                                        }}
                                        onError={() => {
                                            console.error('Iframe load error');
                                            setPlayerError(true);
                                        }}
                                    />
                                ) : playerError ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-white">
                                        <div className="flex flex-col items-center text-center px-6 max-w-md">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                                                <Radio className="h-8 w-8" />
                                            </div>
                                            <p className="mt-4 text-lg font-bold">
                                                Impossible de charger la diffusion
                                            </p>
                                            <p className="mt-2 text-sm text-gray-400">
                                                La source video n'est pas disponible. Veuillez reessayer ou patienter.
                                            </p>
                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPlayerError(false);
                                                        setPlayerReady(false);
                                                    }}
                                                    className="rounded-full bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-gray-900 transition hover:bg-gray-100"
                                                >
                                                    Reessayer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedReplayUrl(null);
                                                        setPlayerError(false);
                                                        // Force switch to next in queue
                                                        setPlaybackCursor((current) => ({
                                                            index: (current.index + 1) % activePlaybackQueue.length,
                                                            startOffsetSeconds: 0,
                                                            slotStartedAt: Date.now(),
                                                        }));
                                                    }}
                                                    className="rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                                                >
                                                    Contenu suivant
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-white">
                                        <div className="flex flex-col items-center text-center">
                                            <Radio className="h-10 w-10" />

                                            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em]">
                                                Diffusion en cours
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {startingSoon && nextStartsAt && (
                                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-sm">
                                        <div className="flex flex-col items-center text-center text-white">
                                            <div className="relative flex h-28 w-28 items-center justify-center">
                                                <div className="absolute inset-0 animate-ping rounded-full border border-primary/25" />

                                                <div className="absolute inset-3 animate-pulse rounded-full border border-white/20" />

                                                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/30">
                                                    <Radio className="h-9 w-9" />
                                                </div>
                                            </div>

                                            <div className="mt-4 max-w-md space-y-2 px-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                                                    Preparation emission
                                                </p>

                                                <p className="font-heading text-4xl font-black uppercase tabular-nums leading-none sm:text-5xl">
                                                    {formatCountdown(
                                                        countdownMs ?? 0,
                                                    )}
                                                </p>

                                                <p className="text-white/78 text-sm leading-relaxed">
                                                    La prochaine emission
                                                    arrive. La diffusion reste
                                                    active pendant la
                                                    transition.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pointer-events-none absolute left-5 top-5 z-20 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                                        <Radio className="h-3.5 w-3.5" />

                                        {heroModeLabel}
                                    </span>

                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                                        {formatDateTime(heroStreamStartAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-950 sm:p-6">
                            <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                                <Clock3 className="h-4 w-4" />
                                Statut
                            </div>

                            {liveNow ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-white/70">
                                        Diffusion en cours
                                    </p>

                                    <p className="font-heading text-2xl font-black uppercase leading-tight text-gray-950 dark:text-white">
                                        {liveNow.title}
                                    </p>

                                    <p className="text-sm text-gray-600 dark:text-white/70">
                                        Le lecteur ouvre la diffusion en
                                        autoplay avec volume relance quand
                                        YouTube le permet.
                                    </p>
                                </div>
                            ) : nextStream ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-white/70">
                                        Prochaine emission
                                    </p>

                                    <p className="font-heading text-2xl font-black uppercase leading-tight text-gray-950 dark:text-white">
                                        {nextStream.title}
                                    </p>

                                    <p className="text-sm text-gray-600 dark:text-white/70">
                                        {countdownMs !== null
                                            ? `Debut dans ${formatCountdown(countdownMs)}`
                                            : 'Debut bientot'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-white/70">
                                        Jingle en boucle
                                    </p>

                                    <p className="font-heading text-2xl font-black uppercase leading-tight text-gray-950 dark:text-white">
                                        LE RURAL
                                    </p>

                                    <p className="text-sm text-gray-600 dark:text-white/70">
                                        Le jingle tourne tant quaucune emission
                                        nest programmee.
                                    </p>
                                </div>
                            )}

                            {latestReplay && !liveNow && (
                                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                                        <Radio className="h-3.5 w-3.5" />
                                        Rediffusion disponible
                                    </div>

                                    <p className="mt-2 font-heading text-xl font-black uppercase leading-tight text-gray-950 dark:text-white">
                                        {latestReplay.title}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700 dark:text-white/70">
                                        Archive publiee apres la diffusion du{' '}
                                        {formatDateTime(latestReplay.ends_at)}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedReplayUrl(
                                                    resolveLivePlayerUrl(
                                                        latestReplay,
                                                        'replay',
                                                    ),
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white"
                                        >
                                            Lire la rediffusion
                                        </button>

                                        {selectedReplayUrl && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedReplayUrl(null)
                                                }
                                                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-700 dark:border-white/15 dark:text-white/70"
                                            >
                                                Retour jingle
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {programmingByDay.length > 0 && (
                            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-950 sm:p-6">
                                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                                    <Tv2 className="h-4 w-4" />
                                    Programmation
                                </div>

                                <div className="space-y-3">
                                    {programmingByDay.map((group) => (
                                        <div
                                            key={group.key}
                                            className="rounded-2xl border border-gray-200 p-3 dark:border-white/10"
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/55">
                                                {group.label}
                                            </p>

                                            <div className="mt-2 space-y-2">
                                                {group.items
                                                    .slice(0, 3)
                                                    .map((stream) => {
                                                        const isCurrent =
                                                            stream.id ===
                                                            currentProgramId;

                                                        const isNext =
                                                            !isCurrent &&
                                                            getStreamStatus(
                                                                stream,
                                                                now,
                                                            ) === 'upcoming';

                                                        return (
                                                            <div
                                                                key={stream.id}
                                                                className={cn(
                                                                    'rounded-xl border p-3 transition',

                                                                    isCurrent
                                                                        ? 'border-primary/40 bg-primary/15 shadow-[0_0_0_1px_rgba(47,106,17,0.12)] ring-2 ring-primary/25'
                                                                        : isNext
                                                                          ? 'dark:bg-primary/12 border-primary/25 bg-primary/10'
                                                                          : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.04]',
                                                                )}
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <p
                                                                        className={cn(
                                                                            'line-clamp-1 text-xs font-semibold',
                                                                            isCurrent
                                                                                ? 'text-gray-950 dark:text-white'
                                                                                : 'text-gray-900 dark:text-white',
                                                                        )}
                                                                    >
                                                                        {
                                                                            stream.title
                                                                        }
                                                                    </p>

                                                                    <span
                                                                        className={cn(
                                                                            'shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]',
                                                                            isCurrent
                                                                                ? 'border-primary/20 bg-primary/10 text-primary'
                                                                                : isNext
                                                                                  ? 'border-gray-300 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                                                                                  : 'border-gray-300 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60',
                                                                        )}
                                                                    >
                                                                        {isCurrent
                                                                            ? 'En cours'
                                                                            : isNext
                                                                              ? 'A suivre'
                                                                              : (platformLabels[
                                                                                    stream
                                                                                        .platform
                                                                                ] ??
                                                                                'Live')}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1 text-[10px] text-gray-500 dark:text-white/55">
                                                                    {formatDateTime(
                                                                        stream.starts_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </MainLayout>
    );
}



