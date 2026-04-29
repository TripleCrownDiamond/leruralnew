import EmptySectionState from '@/Components/EmptySectionState';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Facebook, Instagram, Linkedin, MessageCircle, Radio, Twitter, Video } from 'lucide-react';

type SettingsMap = Record<string, string | null | undefined>;

type PlatformCard = {
    key: keyof SettingsMap;
    label: string;
    tagline: string;
    audience: string;
    cadence: string;
    icon: React.ReactNode;
    bgGradient: string;
    brandColor: string;
    brandText: string;
    darkText: string;
};

const platformCards: PlatformCard[] = [
    {
        key: 'social_facebook_url',
        label: 'Facebook',
        tagline: 'Le coeur de la communaute',
        audience: 'Abonnes actifs',
        cadence: 'Quotidien',
        icon: <Facebook className="h-5 w-5" />,
        bgGradient: 'from-[#1877F2] via-[#1877F2]/90 to-[#0b5fcb]',
        brandColor: '#1877F2',
        brandText: 'text-[#1877F2]',
        darkText: 'text-white',
    },
    {
        key: 'social_x_url',
        label: 'X',
        tagline: 'Flashs et signaux terrain',
        audience: 'Journalistes ? decideurs',
        cadence: 'Temps reel',
        icon: <Twitter className="h-5 w-5" />,
        bgGradient: 'from-gray-900 via-black to-gray-950',
        brandColor: '#000',
        brandText: 'text-black dark:text-white',
        darkText: 'text-white',
    },
    {
        key: 'social_instagram_url',
        label: 'Instagram',
        tagline: 'Le regard du terrain',
        audience: 'Jeunes agriculteurs',
        cadence: 'Hebdomadaire',
        icon: <Instagram className="h-5 w-5" />,
        bgGradient: 'from-[#f58529] via-[#dd2a7b] to-[#8134af]',
        brandColor: '#dd2a7b',
        brandText: 'text-[#c13584]',
        darkText: 'text-white',
    },
    {
        key: 'social_tiktok_url',
        label: 'TikTok',
        tagline: 'Agriculture en formats courts',
        audience: 'Nouvelle generation',
        cadence: 'Hebdomadaire',
        icon: <Video className="h-5 w-5" />,
        bgGradient: 'from-[#00f2ea] via-gray-900 to-[#ff0050]',
        brandColor: '#ff0050',
        brandText: 'text-gray-900 dark:text-white',
        darkText: 'text-white',
    },
    {
        key: 'social_whatsapp_url',
        label: 'WhatsApp',
        tagline: 'Alertes et canaux directs',
        audience: 'Lecteurs mobiles',
        cadence: 'Instantane',
        icon: <MessageCircle className="h-5 w-5" />,
        bgGradient: 'from-[#25D366] via-[#1fb857] to-[#0f8f3f]',
        brandColor: '#25D366',
        brandText: 'text-[#25D366]',
        darkText: 'text-white',
    },
    {
        key: 'social_linkedin_url',
        label: 'LinkedIn',
        tagline: 'Reseau pro et institutionnel',
        audience: 'Partenaires et institutions',
        cadence: 'Regulier',
        icon: <Linkedin className="h-5 w-5" />,
        bgGradient: 'from-[#0A66C2] via-[#0A66C2]/90 to-[#084e96]',
        brandColor: '#0A66C2',
        brandText: 'text-[#0A66C2]',
        darkText: 'text-white',
    },
];

function normalizeUrl(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

function getHandle(url: string | null, label: string): string {
    if (!url) return 'Non configur\u00e9';
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
        const lastSegment = pathname.split('/').filter(Boolean).pop();
        if (lastSegment) return `@${lastSegment}`;
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return label;
    }
}

export default function SocialMediaSection({
    settings,
    className,
    compact = false,
}: {
    settings?: SettingsMap;
    className?: string;
    compact?: boolean;
}) {
    const cards = platformCards.map((platform) => ({
        ...platform,
        url: normalizeUrl(settings?.[platform.key]),
    }));
    const activeCount = cards.filter((card) => card.url).length;

    return (
        <section className={cn(compact ? 'mx-0' : 'mx-0 mb-16 md:mx-4', className)}>
            <div
                className={cn(
                    'relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-white to-primary/5 shadow-[0_20px_60px_-30px_rgba(47,106,17,0.25)] dark:border-white/10 dark:from-gray-950 dark:via-gray-900 dark:to-primary/10',
                    compact ? 'p-4' : 'p-6 md:p-10',
                )}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '26px 26px' }}
                />
                <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative">
                    {/* Editorial header */}
                    <header
                        className={cn(
                            'flex flex-col gap-4',
                            compact
                                ? 'mb-5'
                                : 'mb-10 md:flex-row md:items-end md:justify-between md:gap-6',
                        )}
                    >
                        <div>
                            <div
                                className={cn(
                                    'flex items-center gap-2 font-black uppercase tracking-[0.22em] text-primary',
                                    compact ? 'mb-1 text-[9px]' : 'mb-3 text-[11px]',
                                )}
                            >
                                <Radio className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                                <span>LE RURAL</span>
                                <span className="h-px w-6 bg-primary/40" />
                                <span className="text-gray-500 dark:text-gray-400">
                                    {activeCount}/{cards.length}
                                </span>
                            </div>
                            <h2
                                className={cn(
                                    'font-heading font-black uppercase leading-[0.95] tracking-tight text-gray-900 dark:text-white',
                                    compact ? 'text-lg' : 'text-4xl md:text-5xl',
                                )}
                            >
                                {compact ? (
                                    'Aper\u00e7u reseaux'
                                ) : (
                                    <>
                                        Suivez-nous
                                        <br />
                                        <span className="relative inline-block">
                                            <span className="relative z-10">partout</span>
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-x-0 bottom-1 h-3 -rotate-1 bg-primary/25"
                                            />
                                        </span>
                                    </>
                                )}
                            </h2>
                            {!compact && (
                                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
                                    Retrouvez LE RURAL sur vos canaux preferes : analyses quotidiennes, reportages
                                    terrain, capsules video et flashs en temps reel.
                                </p>
                            )}
                        </div>

                        {/* Audience counter */}
                        {!compact && (
                            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30">
                                        <Radio className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-heading text-2xl font-black tabular-nums leading-none text-primary">
                                            {activeCount}
                                        </div>
                                        <div className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                                            Plateformes actives
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </header>

                    {activeCount === 0 && (
                        <EmptySectionState
                            eyebrow="R\u00e9seaux sociaux"
                            title="Aucun compte configur\u00e9"
                            description="Nos r\u00e9seaux sociaux seront bient\u00f4t disponibles ici."
                            tone="primary"
                            compact
                            className="mb-6"
                        />
                    )}

                    <div
                        className={cn(
                            'grid',
                            compact ? 'grid-cols-2 gap-3 lg:grid-cols-3' : 'gap-5 md:grid-cols-2 xl:grid-cols-3',
                        )}
                    >
                        {cards.filter((card) => card.url).map((card) => {
                            const handle = getHandle(card.url, card.label);
                            const isActive = Boolean(card.url);

                            if (!isActive) {
                                return (
                                    <div
                                        key={card.key as string}
                                        className={cn(
                                            'group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 dark:border-white/10 dark:bg-white/[0.02]',
                                            compact ? 'p-3' : 'rounded-3xl p-5',
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div
                                                className={cn(
                                                    'flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-white/5',
                                                    compact ? 'h-8 w-8' : 'h-12 w-12 rounded-2xl',
                                                )}
                                            >
                                                {card.icon}
                                            </div>
                                            {!compact && (
                                                <span className="rounded-full border border-gray-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400 dark:border-white/10">
                                                    Vide
                                                </span>
                                            )}
                                        </div>
                                        <div className={compact ? 'mt-3' : 'mt-5'}>
                                            <h3
                                                className={cn(
                                                    'font-heading font-black uppercase tracking-tight text-gray-400 dark:text-white/40',
                                                    compact ? 'text-sm' : 'text-xl',
                                                )}
                                            >
                                                {card.label}
                                            </h3>
                                            <p
                                                className={cn(
                                                    'text-gray-400 dark:text-white/40',
                                                    compact ? 'mt-0.5 text-[10px]' : 'mt-1 text-xs',
                                                )}
                                            >
                                                Non configur\u00e9
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <a
                                    key={card.key as string}
                                    href={card.url!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        'group relative flex flex-col justify-between overflow-hidden bg-gradient-to-br text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.45)]',
                                        compact
                                            ? 'min-h-[120px] rounded-2xl p-3'
                                            : 'min-h-[240px] rounded-3xl p-6',
                                        card.bgGradient,
                                    )}
                                >
                                    {/* Dot texture */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 opacity-[0.15]"
                                        style={{
                                            backgroundImage:
                                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                                            backgroundSize: compact ? '14px 14px' : '22px 22px',
                                        }}
                                    />
                                    {/* Hover shine */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -top-1/2 left-0 h-[200%] w-24 -translate-x-full rotate-12 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[400%]"
                                    />

                                    {/* Top row */}
                                    <div className="relative flex items-start justify-between">
                                        <div
                                            className={cn(
                                                'flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20',
                                                compact ? 'h-8 w-8' : 'h-12 w-12 rounded-2xl',
                                            )}
                                        >
                                            {card.icon}
                                        </div>
                                        <div
                                            className={cn(
                                                'flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-gray-900',
                                                compact ? 'h-6 w-6' : 'h-8 w-8',
                                            )}
                                        >
                                            <ArrowUpRight className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="relative">
                                        <h3
                                            className={cn(
                                                'font-heading font-black uppercase leading-tight tracking-tight',
                                                compact ? 'text-base' : 'text-3xl',
                                            )}
                                        >
                                            {card.label}
                                        </h3>
                                        <p
                                            className={cn(
                                                'font-mono font-bold text-white/80',
                                                compact ? 'mt-0.5 text-[10px] truncate' : 'mt-1 text-xs',
                                            )}
                                        >
                                            {handle}
                                        </p>
                                        {!compact && (
                                            <>
                                                <p className="mt-3 text-[13px] leading-snug text-white/75">
                                                    {card.tagline}
                                                </p>
                                                <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-3">
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                                                        <span className="inline-block h-1 w-1 rounded-full bg-white/70" />
                                                        {card.audience}
                                                    </span>
                                                    <span className="inline-block h-1 w-1 rounded-full bg-white/30" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                                                        {card.cadence}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

