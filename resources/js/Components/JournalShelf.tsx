import EmptySectionState from '@/Components/EmptySectionState';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Newspaper } from 'lucide-react';
import { useRef } from 'react';

export interface JournalIssue {
    id: number;
    title: string;
    cover_url: string | null;
    published_human: string | null;
    price_label: string;
    action_url: string;
    action_label: string;
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

        const amount = direction === 'left' ? -360 : 360;
        scrollerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    if (!items.length) {
        return (
            <section className={cn('mx-0 mb-12 md:mx-4', className)}>
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
                'mx-0 mb-12 overflow-hidden rounded-[2rem] border shadow-[0_24px_60px_-35px_rgba(15,23,42,0.28)] md:mx-4',
                tone === 'dark'
                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(7,15,28,0.98)_100%)] text-white'
                    : 'border-stone-200/80 bg-[linear-gradient(180deg,#faf7ef_0%,#f3eddc_100%)] text-gray-900',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-10 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-amber-300">
                            <Newspaper className="h-3.5 w-3.5" />
                            {eyebrow}
                        </div>
                        <h2 className={cn('mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl', tone === 'dark' ? 'text-white' : 'text-gray-900')}>
                            {title}
                        </h2>
                        <p className={cn('mt-3 max-w-2xl text-sm leading-relaxed sm:text-base', tone === 'dark' ? 'text-white/70' : 'text-gray-600')}>
                            {description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-end">
                        <span className={cn('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]', tone === 'dark' ? 'border-white/15 bg-white/5 text-white/70' : 'border-stone-300/80 bg-white/80 text-gray-600')}>
                            {items.length} edition{items.length > 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className={cn('flex h-10 w-10 items-center justify-center rounded-full border transition', tone === 'dark' ? 'border-white/15 bg-white/5 text-white hover:border-primary/40 hover:bg-primary/15' : 'border-stone-300 bg-white text-gray-700 hover:border-primary hover:text-primary')}
                            aria-label="Faire defiler vers la gauche"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className={cn('flex h-10 w-10 items-center justify-center rounded-full border transition', tone === 'dark' ? 'border-white/15 bg-white/5 text-white hover:border-primary/40 hover:bg-primary/15' : 'border-stone-300 bg-white text-gray-700 hover:border-primary hover:text-primary')}
                            aria-label="Faire defiler vers la droite"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="relative mt-6 overflow-hidden">
                    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 w-14', tone === 'dark' ? 'bg-gradient-to-r from-[#07111f] to-transparent' : 'bg-gradient-to-r from-[#f7f2e5] to-transparent')} />
                    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 w-14', tone === 'dark' ? 'bg-gradient-to-l from-[#07111f] to-transparent' : 'bg-gradient-to-l from-[#f7f2e5] to-transparent')} />

                    <div ref={scrollerRef} className="journal-shelf flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 snap-x snap-mandatory">
                        {items.map((item) => (
                            <a
                                key={item.id}
                                href={item.action_url}
                                className={cn(
                                    'group relative min-w-[280px] max-w-[340px] snap-start overflow-hidden rounded-[1.75rem] border shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_-28px_rgba(47,106,17,0.35)] sm:min-w-[320px]',
                                    tone === 'dark'
                                        ? 'border-white/10 bg-white/[0.05] text-white'
                                        : 'border-black/5 bg-white text-gray-900',
                                )}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-black/30">
                                    <ImageWithFallback
                                        src={item.cover_url || undefined}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        fallbackSrc="/images/article-placeholder.svg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                        {item.badge || 'Premiere page'}
                                    </div>

                                    <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md">
                                        {item.price_label}
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-900 shadow-lg shadow-black/10 backdrop-blur dark:bg-gray-950/90 dark:text-white">
                                            {item.action_label}
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-heading text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl">
                                        {item.title}
                                    </h3>
                                    <div className={cn('mt-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]', tone === 'dark' ? 'text-white/65' : 'text-gray-500')}>
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {item.published_human || 'Nouvelle edition'}
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
