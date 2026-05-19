import { Button } from '@/Components/ui/button';
import MarketWidget from '@/Components/MarketWidget';
import WeatherWidget from '@/Components/WeatherWidget';
import { usePage, router, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AdSpace from '@/Components/AdSpace';
import { Mail, Send, CheckCircle2, ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';
import EmptySectionState from '@/Components/EmptySectionState';
import { asBool } from '@/lib/siteSettings';

const WidgetShell = ({
    eyebrow,
    title,
    accent = 'primary',
    action,
    children,
    className = '',
}: {
    eyebrow: string;
    title: string;
    accent?: 'primary' | 'red';
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) => {
    const accentClass = accent === 'red' ? 'bg-red-600 shadow-[0_0_0_4px_rgba(220,38,38,0.15)]' : 'bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]';
    const accentText = accent === 'red' ? 'text-red-600' : 'text-primary';

    return (
        <div className={`relative w-full overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-[0_10px_30px_-15px_rgba(47,106,17,0.15)] dark:border-gray-800 dark:bg-gray-900 ${className}`}>
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] ${accentText}`}>
                        <span className={`inline-block h-2 w-2 rounded-full ${accentClass}`} />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-current opacity-40" />
                        <span className="text-gray-400 dark:text-gray-500">{eyebrow}</span>
                    </div>
                    {action}
                </div>
                <h3 className="mb-5 border-b-2 border-gray-900 pb-3 font-heading text-2xl font-black uppercase tracking-tight leading-tight text-gray-900 dark:border-white dark:text-white">
                    {title}
                </h3>
                {children}
            </div>
        </div>
    );
};

const PollWidget = ({ poll }: { poll: any }) => {
    const [voted, setVoted] = useState(poll.user_has_voted);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [pollProcessing, setPollProcessing] = useState(false);

    React.useEffect(() => {
        setVoted(poll.user_has_voted);
    }, [poll]);

    const handleVote = () => {
        if (selectedOption && poll) {
            router.post(
                `/polls/${poll.id}/vote`,
                { option_id: selectedOption },
                {
                    preserveScroll: true,
                    onStart: () => setPollProcessing(true),
                    onFinish: () => setPollProcessing(false),
                    onSuccess: () => setVoted(true),
                },
            );
        }
    };

    return (
        <WidgetShell eyebrow="Sondage" title={poll.question} accent="primary">
            {!voted ? (
                <div className="space-y-3">
                    {poll.options.map((option: any) => (
                        <label
                            key={option.id}
                            className={`group flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 text-sm transition-all ${
                                selectedOption === option.id
                                    ? 'border-primary bg-primary/5 shadow-[0_6px_18px_-8px_rgba(47,106,17,0.35)]'
                                    : 'border-gray-200 bg-gray-50/60 hover:border-primary/40 hover:bg-white dark:border-gray-700 dark:bg-gray-800/60 dark:hover:bg-gray-800'
                            }`}
                        >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                selectedOption === option.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                                {selectedOption === option.id && <span className="h-2 w-2 rounded-full bg-white" />}
                            </span>
                            <input
                                type="radio"
                                name={`poll_option_${poll.id}`}
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={() => setSelectedOption(option.id)}
                                className="sr-only"
                            />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{option.label}</span>
                        </label>
                    ))}
                    <Button
                        className="mt-2 h-11 w-full bg-gradient-to-r from-primary to-primary/85 text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:opacity-90"
                        onClick={handleVote}
                        disabled={!selectedOption || pollProcessing}
                    >
                        {pollProcessing ? 'Envoi...' : 'Voter maintenant'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {poll.options.map((option: any) => {
                        const totalVotes = poll.options.reduce((acc: number, curr: any) => acc + curr.votes, 0);
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                        return (
                            <div key={option.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <span>{option.label}</span>
                                    <span className="font-black tabular-nums text-primary">{percentage}%</span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/5 py-2.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Merci pour votre vote !
                    </div>
                </div>
            )}
        </WidgetShell>
    );
};

const AgendaWidget = ({ agendas }: { agendas: any[] }) => {
    return (
        <WidgetShell eyebrow="Agenda" title="Programmation" accent="primary">
            {agendas.length > 0 ? (
                <div className="space-y-3">
                    {agendas.slice(0, 4).map((item, index) => (
                        <div
                            key={`agenda-${item.id ?? index}`}
                            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-white/5"
                        >
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>{item.date ?? '-'}</span>
                                <span className="text-gray-300 dark:text-white/20">/</span>
                                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-white/60">
                                    <Clock3 className="h-3 w-3" />
                                    {item.time || '-'}
                                </span>
                            </div>
                            <p className="mt-1.5 text-sm font-bold leading-snug text-gray-900 dark:text-white">
                                {item.title ?? 'Element agenda'}
                            </p>
                            {item.location && (
                                <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-white/60">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptySectionState
                    eyebrow="Agenda"
                    title="Aucun rendez-vous"
                    description="Les prochains points de programmation apparaitront ici des qu'un agenda actif sera ajoute."
                    compact
                    tone="primary"
                    className="border-black/5 bg-black/[0.02] shadow-none"
                />
            )}
        </WidgetShell>
    );
};

type SidebarWebTvItem = {
    id: string;
    href: string;
    title: string;
    subtitle: string | null;
    thumbnail: string | null;
    badge: 'TV' | 'Playlist';
};

const resolveCollection = (pageValue?: any[] | null, sharedValue?: any[] | null): any[] => {
    if (Array.isArray(pageValue) && pageValue.length > 0) return pageValue;
    if (Array.isArray(sharedValue) && sharedValue.length > 0) return sharedValue;
    if (Array.isArray(pageValue)) return pageValue;
    if (Array.isArray(sharedValue)) return sharedValue;
    return [];
};

const resolveCollectionPreferShared = (sharedValue?: any[] | null, pageValue?: any[] | null): any[] => {
    if (Array.isArray(sharedValue) && sharedValue.length > 0) return sharedValue;
    if (Array.isArray(pageValue) && pageValue.length > 0) return pageValue;
    if (Array.isArray(sharedValue)) return sharedValue;
    if (Array.isArray(pageValue)) return pageValue;
    return [];
};

const extractPlaylistId = (url?: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
};

const fallbackThumbnailFromPlaylist = (playlistId?: string | null): string | null => {
    if (!playlistId) return null;
    return 'https://i.ytimg.com/vi_webp/videoseries/hqdefault.webp?list=' + encodeURIComponent(playlistId);
};

const playlistSeriesThumbnail = (playlistId?: string | null): string | null => {
    if (!playlistId) return null;
    return 'https://i.ytimg.com/vi_webp/videoseries/hqdefault.webp?list=' + encodeURIComponent(playlistId);
};

const fallbackThumbnailFromYoutubeId = (youtubeId?: string | null): string | null => {
    if (!youtubeId) return null;
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
};
export default function HomeSidebar({
    marketPrices,
    webtvVideos,
}: {
    marketPrices?: any[];
    webtvVideos?: any[];
    partners?: any[];
    comments?: any[];
}) {
    const { props } = usePage<any>();
    const widgets = props.widgets ?? {};
    const settings = props.settings ?? {};
    const polls = widgets.polls || (widgets.poll ? [widgets.poll] : []);
    const agendas = widgets.agenda || [];
    const showAds = asBool(settings.widget_show_sidebar_ads, true);
    const showMarketPrices = asBool(settings.widget_show_market_prices, true);
    const showWebtv = asBool(settings.widget_show_webtv, true);
    const showNewsletter = asBool(settings.widget_show_newsletter, true);
    const sharedContent = props.shared_content ?? {};
    const emissions = resolveCollectionPreferShared(sharedContent.emissions, props.emissions);
    const youtubePlaylists = resolveCollectionPreferShared(sharedContent.youtube_playlists, props.youtube_playlists);

    const sidebarWebTvItems = React.useMemo<SidebarWebTvItem[]>(() => {
        const playlistThumbnailMap = new Map<string, string>();

        youtubePlaylists.forEach((playlist: any) => {
            const id = playlist?.id ? String(playlist.id) : '';
            const thumbnail = playlist?.thumbnail ? String(playlist.thumbnail) : '';
            if (id && thumbnail) {
                playlistThumbnailMap.set(id, thumbnail);
            }
        });

        const playlistItems = (youtubePlaylists ?? []).map((playlist: any, index: number): SidebarWebTvItem | null => {
            const playlistUrl = playlist?.url ? String(playlist.url) : '';
            const playlistId = playlist?.id ? String(playlist.id) : extractPlaylistId(playlistUrl);
            const thumbnail =
                (playlist?.thumbnail ? String(playlist.thumbnail) : null) ||
                (playlistId ? playlistThumbnailMap.get(playlistId) ?? null : null) ||
                playlistSeriesThumbnail(playlistId) ||
                fallbackThumbnailFromYoutubeId(playlist?.youtube_id ? String(playlist.youtube_id) : null);

            if (!playlistUrl) return null;

            return {
                id: `playlist-${playlistId || index}`,
                href: playlistUrl,
                title: playlist?.title ? String(playlist.title) : 'Playlist',
                subtitle: playlist?.description ? String(playlist.description) : 'YouTube',
                thumbnail,
                badge: 'Playlist',
            };
        }).filter(Boolean) as SidebarWebTvItem[];

        const emissionItems = (emissions ?? []).map((emission: any, index: number): SidebarWebTvItem | null => {
            const playlistUrl = emission?.playlist_url ? String(emission.playlist_url) : '';
            if (!playlistUrl) return null;

            const playlistId = extractPlaylistId(playlistUrl);
            const thumbnail =
                (emission?.image ? String(emission.image) : null) ||
                (playlistId ? playlistThumbnailMap.get(playlistId) ?? null : null) ||
                fallbackThumbnailFromPlaylist(playlistId);

            return {
                id: `emission-${emission?.id ?? index}`,
                href: playlistUrl,
                title: emission?.name ? String(emission.name) : 'Emission',
                subtitle: 'Playlist',
                thumbnail,
                badge: 'Playlist',
            };
        }).filter(Boolean) as SidebarWebTvItem[];

        const videoItems = (webtvVideos ?? []).map((video: any, index: number): SidebarWebTvItem | null => {
            const youtubeId = video?.youtube_id ? String(video.youtube_id) : (video?.id ? String(video.id) : '');
            const href =
                (video?.url ? String(video.url) : '') ||
                (video?.emission_link ? String(video.emission_link) : '') ||
                (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '');

            if (!href) return null;

            const thumbnail = (video?.thumbnail ? String(video.thumbnail) : null) || fallbackThumbnailFromYoutubeId(youtubeId);

            return {
                id: `video-${youtubeId || index}`,
                href,
                title: video?.title ? String(video.title) : 'Video',
                subtitle: video?.emission_name ? String(video.emission_name) : 'LE RURAL TV',
                thumbnail,
                badge: 'TV',
            };
        }).filter(Boolean) as SidebarWebTvItem[];

        const merged = [...playlistItems, ...emissionItems, ...videoItems];
        const deduped: SidebarWebTvItem[] = [];
        const seen = new Set<string>();

        merged.forEach((item) => {
            const key = `${item.href}|${item.title}`;
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        });

        return deduped.slice(0, 4);
    }, [emissions, youtubePlaylists, webtvVideos]);

    const {
        data: newsletterData,
        setData: setNewsletterData,
        post: postNewsletter,
        processing: newsletterProcessing,
        reset: resetNewsletter,
        wasSuccessful: newsletterSuccess,
    } = useForm({
        email: '',
    });

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postNewsletter('/newsletter', {
            preserveScroll: true,
            onSuccess: () => {
                resetNewsletter();
            },
        });
    };

    return (
        <aside className="sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            {showAds && (
                <div className="flex w-full justify-center overflow-hidden">
                    <AdSpace width={300} height={250} locationId="sidebar_top" className="rounded-2xl shadow-sm" />
                </div>
            )}

            <div className="space-y-6">
                {polls.length > 0 ? (
                    polls.map((poll: any) => <PollWidget key={poll.id} poll={poll} />)
                ) : (
                    <WidgetShell eyebrow="Sondage" title="Votre avis">
                        <EmptySectionState
                            eyebrow="Participation"
                            title="Aucun sondage en cours"
                            description="Le prochain sondage lecteur apparaitra ici des qu'une question active sera publiee en base."
                            compact
                            tone="slate"
                            className="border-black/5 bg-black/[0.02] shadow-none"
                        />
                    </WidgetShell>
                )}

                <AgendaWidget agendas={agendas} />
            </div>

            {showMarketPrices && <MarketWidget marketPrices={marketPrices} />}

            <WeatherWidget />

            {showAds && (
                <div className="my-8 flex w-full justify-center overflow-hidden">
                    <AdSpace
                        width={300}
                        height={600}
                        locationId="sidebar_middle_skyscraper"
                        label="Skyscraper Pub"
                        className="rounded-2xl shadow-sm"
                    />
                </div>
            )}

            {showNewsletter && (
                <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/90 p-7 text-white shadow-2xl shadow-primary/20">
                    <div
                        className="absolute inset-0 opacity-[0.12]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '14px 14px',
                        }}
                        aria-hidden="true"
                    />
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
                    <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                            <span className="inline-block h-2 w-2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]" />
                            <span>LE RURAL</span>
                            <span className="h-px w-6 bg-white/30" />
                            <span>Newsletter</span>
                        </div>

                        <h3 className="mb-3 flex flex-col items-start gap-1.5 font-heading text-3xl font-black uppercase tracking-tight leading-tight">
                            <span>Restez</span>
                            <span className="inline-block rounded-md bg-white/15 px-2.5 py-1 backdrop-blur">informe</span>
                        </h3>
                        <p className="mb-5 text-sm leading-relaxed text-white/80">
                            L'actualite agricole, livree directement dans votre boite mail.
                        </p>

                        {newsletterSuccess ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-white/15 p-4 text-sm font-semibold backdrop-blur-sm">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                                Merci de votre inscription !
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                                    <input
                                        type="email"
                                        placeholder="Votre email"
                                        required
                                        value={newsletterData.email}
                                        onChange={(e) => setNewsletterData('email', e.target.value)}
                                        className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm transition-all focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={newsletterProcessing}
                                    className="newsletter-sidebar-submit group relative w-full overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-gray-900 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {newsletterProcessing ? (
                                            'Inscription...'
                                        ) : (
                                            <>
                                                S'inscrire
                                                <Send className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
}






