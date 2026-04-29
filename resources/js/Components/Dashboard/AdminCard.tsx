import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminCardProps {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}

export default function AdminCard({ children, className, padded = false }: AdminCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900',
                padded && 'p-6',
                className
            )}
        >
            {children}
        </div>
    );
}

export function AdminEmptyState({
    icon,
    title,
    subtitle,
    action,
}: {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            {icon && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    {icon}
                </div>
            )}
            <div>
                <h3 className="font-heading text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h3>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-white/60">{subtitle}</p>
                )}
            </div>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

export function AdminStatusPill({
    tone,
    children,
}: {
    tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
    children: ReactNode;
}) {
    const tones: Record<string, string> = {
        success:
            'bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
        warning:
            'bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
        danger: 'bg-red-50 text-red-700 ring-red-500/30 dark:bg-red-500/10 dark:text-red-400',
        info: 'bg-sky-50 text-sky-700 ring-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400',
        neutral:
            'bg-gray-100 text-gray-600 ring-gray-300 dark:bg-white/5 dark:text-white/60 dark:ring-white/10',
    };

    const dotColors: Record<string, string> = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-sky-500',
        neutral: 'bg-gray-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ring-1 ring-inset ${tones[tone]}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`} />
            {children}
        </span>
    );
}
