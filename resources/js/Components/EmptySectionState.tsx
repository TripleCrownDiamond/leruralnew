import { useTheme } from '@/Components/ThemeProvider';
import { cn } from '@/lib/utils';
import { Inbox, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Tone = 'primary' | 'red' | 'amber' | 'slate';
type Theme = 'light' | 'dark' | 'auto';

const toneStyles: Record<Tone, { badge: string; dot: string; title: string }> = {
    primary: {
        badge: 'border-primary/15 bg-primary/10 text-primary',
        dot: 'bg-primary',
        title: 'text-primary',
    },
    red: {
        badge: 'border-red-500/20 bg-red-500/10 text-red-500',
        dot: 'bg-red-500',
        title: 'text-red-500',
    },
    amber: {
        badge: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
        dot: 'bg-amber-500',
        title: 'text-amber-500',
    },
    slate: {
        badge: 'border-gray-300/80 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
        dot: 'bg-gray-500',
        title: 'text-gray-800 dark:text-gray-100',
    },
};

export default function EmptySectionState({
    eyebrow = 'Mise a jour',
    title,
    description,
    tone = 'primary',
    theme = 'auto',
    compact = false,
    className,
}: {
    eyebrow?: string;
    title: string;
    description: string;
    tone?: Tone;
    theme?: Theme;
    compact?: boolean;
    className?: string;
}) {
    const { theme: appTheme } = useTheme();
    const [systemDark, setSystemDark] = useState(false);

    useEffect(() => {
        if (appTheme !== 'system' || typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = () => setSystemDark(media.matches);

        sync();
        media.addEventListener('change', sync);

        return () => media.removeEventListener('change', sync);
    }, [appTheme]);

    const resolvedTheme = useMemo(() => {
        if (theme === 'auto') {
            return appTheme === 'dark' || (appTheme === 'system' && systemDark) ? 'dark' : 'light';
        }

        return theme;
    }, [appTheme, systemDark, theme]);

    const toneStyle = toneStyles[tone];

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-[2rem] border shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]',
                resolvedTheme === 'dark'
                    ? 'border-white/10 bg-white/[0.06] text-white/80 backdrop-blur-2xl'
                    : 'border-stone-200 bg-white/95 text-gray-900 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.22)]',
                compact ? 'p-5' : 'p-7 md:p-8',
                className,
            )}
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            <div className="relative">
                <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em]', toneStyle.badge)}>
                    <Sparkles className="h-3.5 w-3.5" />
                    {eyebrow}
                </div>

                <div className="mt-5 flex items-start gap-4">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', resolvedTheme === 'dark' ? 'bg-black/20' : 'bg-black/[0.04]')}>
                        <Inbox className={cn('h-5 w-5', toneStyle.title)} />
                    </div>
                    <div>
                        <h3 className={cn('font-heading text-2xl font-black uppercase tracking-tight', resolvedTheme === 'dark' ? 'text-white' : 'text-gray-950')}>
                            {title}
                        </h3>
                        <p className={cn('mt-2 max-w-2xl text-sm leading-relaxed', resolvedTheme === 'dark' ? 'text-white/70' : 'text-gray-700')}>
                            {description}
                        </p>
                    </div>
                </div>

                <div className={cn('mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]', resolvedTheme === 'dark' ? 'text-white/65' : 'text-gray-500')}>
                    <span className={cn('inline-block h-2 w-2 rounded-full', toneStyle.dot)} />
                    Contenu en attente de publication
                </div>
            </div>
        </div>
    );
}
