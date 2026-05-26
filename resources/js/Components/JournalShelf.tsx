import EmptySectionState from '@/Components/EmptySectionState';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock3, Newspaper } from 'lucide-react';
import { useRef } from 'react';

export interface JournalIssue {
    id: number;
    title: string;
    cover_url: string | null;
    published_human: string | null;
    price_label: string;
    action_url: string;
    action_label?: string | null;
    badge?: string | null;
}

interface JournalShelfProps {
    items: JournalIssue[];
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    className?: string;
    tone?: 'light' | 'dark';
}

export default function JournalShelf({
    items,
    eyebrow,
    title,
    description,
    emptyTitle,
    emptyDescription,
    className = '',
    tone = 'light',
}: JournalShelfProps) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollerRef.current) return;

        const amount = direction === 'left' ? -320 : 320;
        scrollerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    if (!items.length) {
        return (
            <section className={cn('mx-auto mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
                <EmptySectionState
                    eyebrow={eyebrow}
                    title={emptyTitle}
                    description={emptyDescription}
                    tone={tone === 'dark' ? 'amber' : 'primary'}
                    theme="auto"
                />
            </section>
        );
    }

    return (
        <section
            className={cn(
                'relative mx-auto mb-12 w-full max-w-7xl overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/95 text-gray-900 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/95 dark:text-white',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-sm dark:border-primary/30 dark:bg-primary/10">
                            <Newspaper className="h-3.5 w-3.5" />
                            {eyebrow}
                        </div>
                        <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                            {description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-end">
                        <span className="rounded-full border border-gray-300/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600 dark:border-white/15 dark:bg-white/5 dark:text-gray-200">
                            {items.length} edition{items.length > 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
                            aria-label="Faire defiler vers la gauche"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
                            aria-label="Faire defiler vers la droite"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="relative mt-6 overflow-hidden">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-14 bg-gradient-to-r from-white/95 to-transparent sm:block dark:from-gray-900/95" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-14 bg-gradient-to-l from-white/95 to-transparent sm:block dark:from-gray-900/95" />

                    <div ref={scrollerRef} className="journal-shelf flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 snap-x snap-mandatory">
                        {items.map((item) => (
                            <a
                                key={item.id}
                                href={item.action_url}
                                className="group relative w-[72vw] max-w-[220px] flex-none snap-start overflow-hidden rounded-[1.75rem] border border-black/5 bg-white text-gray-900 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_-28px_rgba(47,106,17,0.22)] sm:w-[176px] sm:max-w-none lg:w-[184px] xl:w-[192px] 2xl:w-[200px] dark:border-white/10 dark:bg-gray-900 dark:text-white"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <ImageWithFallback
                                        src={item.cover_url ?? '/images/article-placeholder.svg'}
                                        alt={item.title}
                                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                                        fallbackSrc="/images/article-placeholder.svg"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

                                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md sm:left-4 sm:top-4 sm:px-2.5 sm:py-1">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                        {item.badge || 'MIS EN AVANT'}
                                    </div>

                                    <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/90 backdrop-blur-md sm:right-4 sm:top-4 sm:px-2.5 sm:py-1">
                                        {item.price_label}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-300">
                                        <span className="inline-flex items-center gap-2">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {item.published_human || 'Nouvelle edition'}
                                        </span>
                                        <span className="text-primary">{item.action_label || 'Voir'}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}