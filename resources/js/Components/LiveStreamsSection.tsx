import EmptySectionState from '@/Components/EmptySectionState';
import { cn } from '@/lib/utils';
import { BadgeCheck, PlayCircle, Video } from 'lucide-react';

interface LiveStream {
    id: number;
    platform: 'tiktok' | 'youtube' | 'twitch';
    title: string;
    stream_url: string;
    embed_url?: string | null;
}

const platformStyles: Record<string, string> = {
    youtube: 'from-[#ff0000] to-[#b20000]',
    tiktok: 'from-[#00f2ea] to-[#ff0050]',
    twitch: 'from-[#9146ff] to-[#5b2ba8]',
};

export default function LiveStreamsSection({ streams, className }: { streams: LiveStream[]; className?: string }) {
    if (!streams.length) {
        return (
            <section className={cn('mx-0 mb-16 md:mx-4', className)}>
                <EmptySectionState
                    eyebrow="Lives"
                    title="Aucun live en ce moment"
                    description="Aucun direct pour le moment. Revenez bientot pour suivre nos prochaines emissions en live."
                    tone="primary"
                />
            </section>
        );
    }

    return (
        <section className={cn('mx-0 mb-16 md:mx-4', className)}>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 md:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                            <PlayCircle className="h-3.5 w-3.5" />
                            Lives
                        </div>
                        <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">En direct</h2>
                    </div>
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                        {streams.length} actif{streams.length > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {streams.map((stream) => (
                        <article key={stream.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
                            <div className={cn('h-2 bg-gradient-to-r', platformStyles[stream.platform] ?? 'from-primary to-emerald-700')} />
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/60">
                                    <Video className="h-3.5 w-3.5 text-primary" />
                                    {stream.platform}
                                </div>
                                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{stream.title}</h3>

                                {stream.embed_url ? (
                                    <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
                                        <iframe src={stream.embed_url} title={stream.title} className="h-full w-full" allowFullScreen />
                                    </div>
                                ) : (
                                    <div className="mt-3 rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-white/20 dark:text-white/60">
                                        Preview indisponible. Ouvrez le live via le bouton.
                                    </div>
                                )}

                                <a
                                    href={stream.stream_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-white"
                                >
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Voir le live
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

