import { useEffect, useMemo, useState } from 'react';
import { Play, Clock, Radio, Users, Eye, Video, ExternalLink } from 'lucide-react';
import ImageWithFallback from '@/Components/ImageWithFallback';
import EmptySectionState from '@/Components/EmptySectionState';

type WebTvVideo = {
    title: string;
    youtube_id: string;
    thumbnail: string | null;
    emission_name: string | null;
    emission_image: string | null;
    emission_link: string | null;
    section_name?: string | null;
    published_at: string;
    is_featured: boolean;
};

type Emission = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    playlist_url: string;
};

type YouTubeChannel = {
    id: string;
    title: string | null;
    description: string | null;
    custom_url: string | null;
    thumbnail: string | null;
    banner: string | null;
    subscriber_count: number;
    hidden_subscriber_count: boolean;
    view_count: number;
    video_count: number;
    url: string;
};

type YouTubeVideo = {
    id: string;
    youtube_id: string;
    title: string;
    description: string;
    thumbnail: string;
    published_at: string;
    duration_iso: string | null;
    duration: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    url: string;
};

type YouTubePlaylist = {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    primary_video_thumbnail?: string | null;
    item_count: number;
    published_at: string;
    url: string;
};

function formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace('.0', '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace('.0', '') + 'K';
    return n.toLocaleString('fr-FR');
}

function timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "aujourd'hui";
    if (days < 7) return `il y a ${days}j`;
    if (days < 30) return `il y a ${Math.floor(days / 7)}sem`;
    if (days < 365) return `il y a ${Math.floor(days / 30)}mois`;
    return `il y a ${Math.floor(days / 365)}an${Math.floor(days / 365) > 1 ? 's' : ''}`;
}

export default function WebTvSection({
    videos,
    emissions = [],
    youtubeChannel = null,
    youtubeVideos = [],
    youtubePlaylists = [],
}: {
    videos: WebTvVideo[];
    emissions?: Emission[];
    youtubeChannel?: YouTubeChannel | null;
    youtubeVideos?: YouTubeVideo[];
    youtubePlaylists?: YouTubePlaylist[];
}) {
    // Merge local editorial videos with YouTube items instead of dropping one source.
    const mergedVideos = useMemo<Array<WebTvVideo | YouTubeVideo>>(() => {
        const merged = [...youtubeVideos, ...videos];
        const seen = new Set<string>();

        return merged.filter((video, index) => {
            const videoId = String((video as any).youtube_id ?? '').trim();
            const url = String((video as any).url ?? (video as any).emission_link ?? '').trim();
            const title = String((video as any).title ?? '').trim().toLowerCase();
            const key = videoId ? `id:${videoId}` : url ? `url:${url}` : `title:${title || index}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }, [videos, youtubeVideos]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const activeVideo = mergedVideos[activeIdx] ?? null;

    useEffect(() => {
        if (mergedVideos.length === 0) {
            setActiveIdx(0);
            return;
        }

        if (activeIdx >= mergedVideos.length) {
            setActiveIdx(0);
        }
    }, [activeIdx, mergedVideos.length]);

    const getVideoId = (v: WebTvVideo | YouTubeVideo | null): string | null => {
        if (!v) return null;
        return (v as any).youtube_id ?? (v as any).id ?? null;
    };

    const getVideoTitle = (v: WebTvVideo | YouTubeVideo) => v.title || '';
    const getVideoThumbnail = (v: WebTvVideo | YouTubeVideo | null): string | null => {
        if (!v) return null;
        const thumb = (v as any).thumbnail;
        if (thumb) {
            if (typeof thumb === 'string' && thumb.includes('maxresdefault.jpg')) {
                return thumb.replace('maxresdefault.jpg', 'hqdefault.jpg');
            }

            return thumb;
        }
        const id = getVideoId(v);
        return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    };
    const getVideoPublished = (v: WebTvVideo | YouTubeVideo) => (v as any).published_at;
    const getVideoViews = (v: WebTvVideo | YouTubeVideo): number | null => (v as any).view_count ?? null;
    const getVideoDuration = (v: WebTvVideo | YouTubeVideo): string | null => (v as any).duration ?? null;
    const hasAnyWebTvData =
        mergedVideos.length > 0 ||
        Boolean(youtubeChannel) ||
        youtubePlaylists.length > 0 ||
        emissions.length > 0;

    if (!hasAnyWebTvData) {
        return (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <header className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-red-500">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/15 px-2.5 py-1">
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            <span>Web TV</span>
                        </span>
                        <span>LE RURAL</span>
                        <span className="h-px w-8 bg-red-500/40" />
                        <span className="text-gray-400">Dernieres videos et playlists YouTube</span>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-white/20 pb-5">
                        <h2 className="font-heading text-4xl font-black uppercase leading-[0.9] tracking-tight text-white lg:text-6xl">
                            LE RURAL<span className="relative ml-3 inline-block">
                                <span className="relative z-10 text-white">TV</span>
                                <span className="absolute inset-0 -inset-x-1 z-0 -skew-x-6 bg-red-600" aria-hidden="true" />
                            </span>
                        </h2>
                    </div>
                </header>

                <EmptySectionState
                    eyebrow="Web TV"
                    title="Aucune video YouTube disponible"
                    description="Les videos, playlists et emissions YouTube apparaitront ici des qu'une source Web TV sera active en base ou synchronisee."
                    tone="red"
                    theme="dark"
                    className="border-white/10 bg-white/[0.05]"
                />
            </section>
        );
    }

    const activeVideoId = getVideoId(activeVideo);
    const activeVideoThumbnail = getVideoThumbnail(activeVideo);
    const otherVideos = mergedVideos.filter((v, i) => i !== activeIdx);
    const playlistVideos = otherVideos.length > 0 ? otherVideos : mergedVideos.slice(0, 6);

    const sectionedVideos = useMemo(() => {
        const map = new Map<string, Array<WebTvVideo | YouTubeVideo>>();

        videos.forEach((video) => {
            const rawName = (video as any).section_name;
            const sectionName = typeof rawName === 'string' ? rawName.trim() : '';
            if (!sectionName) return;

            const current = map.get(sectionName) ?? [];
            current.push(video);
            map.set(sectionName, current);
        });

        return Array.from(map.entries())
            .map(([name, items]) => ({ name, items: items.slice(0, 4) }))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [videos]);

    useEffect(() => {
        setIsPlayerReady(false);
    }, [activeIdx]);

    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Editorial header - red rail */}
            <header className="mb-8">
                <div className="mb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-red-500 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 border border-red-500/30 px-2.5 py-1">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        <span>Replay YouTube</span>
                    </span>
                    <span>LE RURAL</span>
                    <span className="h-px w-8 bg-red-500/40" />
                    <span className="text-gray-400">Web TV / Replay / {mergedVideos.length} videos</span>
                    {youtubeChannel && (
                        <a
                            href={youtubeChannel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            YouTube
                        </a>
                    )}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-white/20 pb-5">
                    <h2 className="font-heading text-4xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[0.9]">
                        LE RURAL<span className="ml-3 relative inline-block">
                            <span className="relative z-10 text-white">TV</span>
                            <span className="absolute inset-0 -inset-x-1 bg-red-600 -skew-x-6 z-0" aria-hidden="true" />
                        </span>
                    </h2>

                    <a
                        href={youtubeChannel?.url ?? 'https://www.youtube.com/@leruralbenintv9989'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/40 hover:-translate-y-0.5"
                    >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        S'abonner
                    </a>
                </div>
            </header>

            {/* Channel stats card */}
            {youtubeChannel && (
                <div className="mb-10 relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/40 p-5 lg:p-7 shadow-2xl shadow-red-900/30">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" aria-hidden="true" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Channel identity */}
                        <div className="flex items-center gap-4 min-w-0">
                            {youtubeChannel.thumbnail && (
                                <div className="relative shrink-0">
                                    <ImageWithFallback
                                        src={youtubeChannel.thumbnail}
                                        alt={youtubeChannel.title ?? 'LE RURAL TV'}
                                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-red-500/60 shadow-xl shadow-red-900/50"
                                        fallbackSrc="/images/article-placeholder.svg"
                                        loading="lazy"
                                    />
                                    {/* Verified badge */}
                                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 ring-4 ring-gray-900">
                                        <Play className="h-3 w-3 text-white fill-current" />
                                    </div>
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/80">
                                    <Radio className="h-3 w-3" />
                                    Chaine officielle
                                </div>
                                <h3 className="font-heading text-2xl lg:text-3xl font-black uppercase tracking-tight text-white leading-tight truncate">
                                    {youtubeChannel.title ?? 'LE RURAL TV'}
                                </h3>
                                {youtubeChannel.custom_url && (
                                    <a
                                        href={youtubeChannel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        {youtubeChannel.custom_url}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-3 lg:gap-5">
                            <StatTile
                                icon={<Users className="h-4 w-4" />}
                                label="Abonnes"
                                value={youtubeChannel.hidden_subscriber_count ? '-' : formatCount(youtubeChannel.subscriber_count)}
                                accent="red"
                            />
                            <StatTile
                                icon={<Eye className="h-4 w-4" />}
                                label="Vues totales"
                                value={formatCount(youtubeChannel.view_count)}
                                accent="red"
                            />
                            <StatTile
                                icon={<Video className="h-4 w-4" />}
                                label="Videos"
                                value={formatCount(youtubeChannel.video_count)}
                                accent="red"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Player + Playlist */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-16">
                <div className="lg:col-span-2">
                    {activeVideoId ? (
                        <div className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-red-900/30 ring-1 ring-white/10">
                            {isPlayerReady ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                                    title={activeVideo ? getVideoTitle(activeVideo) : ''}
                                    className="absolute inset-0 h-full w-full"
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsPlayerReady(true)}
                                    className="absolute inset-0 h-full w-full"
                                    aria-label="Lancer la lecture de la video"
                                >
                                    <ImageWithFallback
                                        src={activeVideoThumbnail ?? undefined}
                                        alt={activeVideo ? getVideoTitle(activeVideo) : 'Video'}
                                        className="h-full w-full object-cover"
                                        loading="eager"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                                            <Play className="h-4 w-4 fill-current" />
                                            Lire
                                        </span>
                                    </div>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-3xl bg-gray-800 text-gray-500">
                            Video non disponible
                        </div>
                    )}
                    {activeVideo && (
                        <div className="mt-6">
                            <div className="mb-3 flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-400 border border-red-500/30">
                                    <Radio className="h-3 w-3" />
                                    {(activeVideo as any).emission_name ?? 'LE RURAL TV'}
                                </span>
                                {getVideoPublished(activeVideo) && (
                                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-gray-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(getVideoPublished(activeVideo)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                )}
                                {getVideoViews(activeVideo) !== null && (
                                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-gray-400">
                                        <Eye className="h-3.5 w-3.5" />
                                        {formatCount(getVideoViews(activeVideo) as number)} vues
                                    </span>
                                )}
                                {getVideoDuration(activeVideo) && (
                                    <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-black tabular-nums text-white">
                                        {getVideoDuration(activeVideo)}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-heading text-2xl lg:text-3xl font-black leading-[1.1] text-white">
                                {getVideoTitle(activeVideo)}
                            </h3>
                        </div>
                    )}
                </div>

                {/* Side Playlist */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">
                            Dernieres videos
                        </h3>
                        <span className="h-px flex-1 bg-gradient-to-r from-red-500/30 to-transparent" />
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {playlistVideos.length === 0 && (
                            <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-gray-400'>
                                Aucune video recente disponible pour le moment.
                            </div>
                        )}

                        {playlistVideos.map((video, idx) => {
                            const vid = getVideoId(video);
                            if (!vid) return null;
                            const duration = getVideoDuration(video);
                            const views = getVideoViews(video);
                            return (
                                <button
                                    key={vid + '-' + idx}
                                    onClick={() => setActiveIdx(mergedVideos.indexOf(video))}
                                    className="group flex w-full gap-3 rounded-2xl p-2 text-left transition-all hover:bg-white/5 hover:translate-x-1"
                                >
                                    <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-gray-800 ring-1 ring-white/10 group-hover:ring-red-500/50 transition-all">
                                        <ImageWithFallback
                                            src={getVideoThumbnail(video) ?? undefined}
                                            alt={getVideoTitle(video)}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/50">
                                                <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                                            </div>
                                        </div>
                                        {duration ? (
                                            <div className="absolute bottom-1 right-1 rounded-md bg-black/90 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-white">
                                                {duration}
                                            </div>
                                        ) : (
                                            <div className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                                TV
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center gap-1 min-w-0">
                                        <h4 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-200 group-hover:text-red-400 transition-colors">
                                            {getVideoTitle(video)}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] font-black text-gray-500">
                                            {getVideoPublished(video) && (
                                                <span>{timeAgo(getVideoPublished(video))}</span>
                                            )}
                                            {views !== null && (
                                                <>
                                                    <span className="h-1 w-1 rounded-full bg-gray-600" />
                                                    <span>{formatCount(views as number)} vues</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: 'red' }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 px-3 py-3 lg:px-4 lg:py-3.5 backdrop-blur-sm hover:bg-white/10 hover:border-red-500/40 transition-all">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-red-400 mb-1.5">
                {icon}
                <span>{label}</span>
            </div>
            <div className="font-heading text-xl lg:text-2xl font-black tabular-nums text-white leading-none">
                {value}
            </div>
        </div>
    );
}
















