import { ReactNode } from 'react';

interface AdminPageHeaderProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    meta?: ReactNode;
}

export default function AdminPageHeader({
    eyebrow,
    title,
    subtitle,
    icon,
    actions,
    meta,
}: AdminPageHeaderProps) {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/30 p-6 text-white shadow-[0_30px_80px_-30px_rgba(47,106,17,0.55)] sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <span>LE RURAL</span>
                        <span className="text-white/25">/</span>
                        <span className="text-primary">{eyebrow}</span>
                        {meta && (
                            <>
                                <span className="text-white/25">|</span>
                                <span className="text-white/50">{meta}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-start gap-4">
                        {icon && (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/15 md:h-14 md:w-14">
                                {icon}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
                                {title}
                            </h1>
                            {subtitle && <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">{subtitle}</p>}
                        </div>
                    </div>
                </div>

                {actions && (
                    <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end [&>*]:w-full sm:[&>*]:w-auto">
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}
