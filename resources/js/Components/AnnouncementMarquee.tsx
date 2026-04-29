import { cn } from '@/lib/utils';
import { Megaphone, MoveRight } from 'lucide-react';

interface AnnouncementItem {
    id: number;
    label?: string | null;
    message: string;
    link_url?: string | null;
}

interface AnnouncementMarqueeProps {
    announcements?: AnnouncementItem[];
    compact?: boolean;
    className?: string;
}

export default function AnnouncementMarquee({
    announcements = [],
    compact = false,
    className,
}: AnnouncementMarqueeProps) {
    const hasAnnouncements = announcements.length > 0;
    const items = announcements.length > 2 ? [...announcements, ...announcements] : [...announcements, ...announcements, ...announcements];

    return (
        <section
            className={cn(
                'relative overflow-hidden border-y border-primary/30 bg-[linear-gradient(135deg,#0d190d_0%,#17351a_48%,#255c1d_100%)] text-white shadow-[0_24px_60px_-30px_rgba(22,73,20,0.85)]',
                compact ? 'py-2.5 md:border-x-0 md:border-t-0 md:py-3' : 'mx-0 mb-8 py-3 md:mx-4 md:mt-4 md:rounded-3xl md:border md:py-4',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -left-12 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-primary/30 blur-2xl" />
            <div aria-hidden="true" className="pointer-events-none absolute right-10 top-0 h-24 w-24 rounded-full bg-emerald-300/15 blur-3xl" />

            <div className={cn('relative flex items-center gap-3 overflow-hidden px-4 sm:px-6 lg:px-8', compact && 'px-3 sm:px-4 lg:px-6')}>
                <div className="shrink-0 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-green-50 backdrop-blur-xl">
                    <span className="inline-flex items-center gap-2">
                        <Megaphone className="h-3.5 w-3.5 text-primary" />
                        Fil d'annonces
                    </span>
                </div>

                {hasAnnouncements ? (
                    <div className="marquee-track flex min-w-0 flex-1 overflow-hidden">
                        <div className="marquee-run flex min-w-max items-center gap-3 pr-3 md:gap-4 md:pr-4">
                            {items.map((announcement, index) => {
                                const content = (
                                    <>
                                        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground shadow-[0_8px_20px_-12px_rgba(47,106,17,0.9)]">
                                            {announcement.label || 'Annonce'}
                                        </span>
                                        <span className="whitespace-nowrap font-medium text-white/95">{announcement.message}</span>
                                        {announcement.link_url && <MoveRight className="h-4 w-4 text-green-100 transition-transform group-hover:translate-x-0.5" />}
                                    </>
                                );

                                return announcement.link_url ? (
                                    <a
                                        key={`${announcement.id}-${index}`}
                                        href={announcement.link_url}
                                        className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.12] px-4 py-2.5 text-sm text-white/95 transition-all hover:border-primary/45 hover:bg-white/[0.18] hover:text-white"
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <div
                                        key={`${announcement.id}-${index}`}
                                        className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.12] px-4 py-2.5 text-sm text-white/95"
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/10 bg-white/[0.12] px-4 py-2.5 text-sm text-white/88">
                        <span className="truncate font-medium">Aucune annonce active pour le moment. Les prochaines annonces apparaitront ici des leur publication.</span>
                    </div>
                )}
            </div>

            {hasAnnouncements && (
                <style>{`
                    .marquee-run {
                        animation: announcement-marquee 34s linear infinite;
                    }
                    .marquee-track:hover .marquee-run {
                        animation-play-state: paused;
                    }
                    @keyframes announcement-marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
            )}
        </section>
    );
}
