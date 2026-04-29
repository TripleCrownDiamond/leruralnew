import { PropsWithChildren } from 'react';

export default function Guest({
    children,
    eyebrow = 'Espace abonné',
    title,
    tagline,
}: PropsWithChildren<{
    eyebrow?: string;
    title?: string;
    tagline?: string;
}>) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-white via-primary/5 to-primary/10 dark:from-gray-950 dark:via-gray-900 dark:to-primary/20">
            {/* Editorial background — dot texture + glows */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
                aria-hidden="true"
            />
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            {/* Vertical brand rail on the left (desktop) */}
            <div className="pointer-events-none absolute left-8 top-0 bottom-0 hidden lg:flex flex-col justify-between py-10 z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>LE RURAL</span>
                </div>
                <div className="writing-vertical text-[9px] font-black uppercase tracking-[0.22em] text-primary/50" style={{ writingMode: 'vertical-rl' }}>
                    1<sup>er</sup> Groupe de Presse Agricole · Afrique de l'Ouest
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-6">
                {/* Editorial header */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/40" />
                        <span className="text-gray-500 dark:text-gray-400">{eyebrow}</span>
                    </div>
                    {title && (
                        <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white text-center leading-[0.95]">
                            {title}
                        </h1>
                    )}
                    {tagline && (
                        <p className="max-w-sm text-center text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {tagline}
                        </p>
                    )}
                </div>

                {/* Card */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(47,106,17,0.25)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Primary accent stripe at top */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/0" aria-hidden="true" />
                    {children}
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary/70">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        <span>Média agricole</span>
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} <span className="font-black tracking-wider text-gray-700 dark:text-gray-300">LE RURAL</span> — Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
}
