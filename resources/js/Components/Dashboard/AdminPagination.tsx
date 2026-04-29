import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AdminPaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
}

export default function AdminPagination({ links, from, to, total }: AdminPaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center dark:border-white/5">
            {typeof from === 'number' && typeof to === 'number' && typeof total === 'number' && (
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">
                    <span className="text-gray-900 dark:text-white">{from}</span>
                    <span className="mx-1 text-gray-300 dark:text-white/20">—</span>
                    <span className="text-gray-900 dark:text-white">{to}</span>
                    <span className="mx-2 text-gray-300 dark:text-white/20">/</span>
                    <span className="text-primary">{total}</span>
                    <span className="ml-1.5">entrées</span>
                </p>
            )}

            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isPrev = link.label.toLowerCase().includes('previous') || link.label.includes('&laquo;');
                    const isNext = link.label.toLowerCase().includes('next') || link.label.includes('&raquo;');

                    const content = isPrev ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : isNext ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    );

                    const base =
                        'inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-black uppercase tracking-[0.14em] transition-all duration-150';

                    if (!link.url) {
                        return (
                            <span
                                key={i}
                                className={`${base} cursor-not-allowed text-gray-300 dark:text-white/20`}
                            >
                                {content}
                            </span>
                        );
                    }

                    if (link.active) {
                        return (
                            <span
                                key={i}
                                className={`${base} bg-gradient-to-br from-primary to-emerald-700 text-white shadow-md shadow-primary/30`}
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={`${base} border border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary`}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
