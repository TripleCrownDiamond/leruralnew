import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <nav className="flex flex-wrap items-center gap-2 justify-center bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            {links.map((link, i) => {
                let content;
                const isPrevious = link.label.includes('Previous') || link.label.includes('pagination.previous');
                const isNext = link.label.includes('Next') || link.label.includes('pagination.next');

                if (isPrevious) {
                    content = <ChevronLeft className="h-4 w-4" />;
                } else if (isNext) {
                    content = <ChevronRight className="h-4 w-4" />;
                } else {
                    content = <span dangerouslySetInnerHTML={{ __html: link.label }} />;
                }
                
                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed select-none"
                        >
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            link.active
                                ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary'
                        }`}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
