import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface AdminSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    filters?: ReactNode;
    trailing?: ReactNode;
}

export default function AdminSearchBar({
    value,
    onChange,
    placeholder = 'Rechercher…',
    filters,
    trailing,
}: AdminSearchBarProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/50" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/60 pl-11 pr-4 text-base font-medium text-gray-900 placeholder:text-sm placeholder:text-gray-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/50 dark:focus:bg-white/5"
                    />
                    <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 shadow-sm md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                        ⌘ K
                    </kbd>
                </div>

                {filters && (
                    <div className="flex flex-wrap items-center gap-2">{filters}</div>
                )}

                {trailing && (
                    <div className="flex flex-wrap items-center gap-2">{trailing}</div>
                )}
            </div>
        </div>
    );
}

