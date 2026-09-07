import ImageWithFallback from '@/Components/ImageWithFallback';
import useSharedContent from '@/Hooks/useSharedContent';
import { asBool } from '@/lib/siteSettings';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ExternalLink, Megaphone, Settings2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const AdvertisementProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => <>{children}</>;

interface AdSpaceProps {
    width: number | string;
    height: number | string;
    className?: string;
    label?: string;
    locationId: string;
    hideWhenEmpty?: boolean;
}

const resolveAdminAdvertisementsHref = () => {
    try {
        const routeHelper = route();
        if (
            typeof routeHelper?.has === 'function' &&
            routeHelper.has('dashboard.advertisements.index')
        ) {
            return route('dashboard.advertisements.index');
        }
    } catch {
        // Ignore Ziggy lookup errors and fallback to a safe URL.
    }

    return '/dashboard/advertisements';
};

const toNumber = (value: number | string): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : null;
};

export default function AdSpace({
    width,
    height,
    className = '',
    label = 'Publicite',
    locationId,
    hideWhenEmpty = false,
}: AdSpaceProps) {
    const { props } = usePage<
        PageProps & { settings?: Record<string, string>; auth?: any }
    >();
    const { advertisements } = useSharedContent();
    const settings = props.settings ?? {};
    const isAdmin = props.auth?.user?.role === 'admin';
    const showAds = asBool(settings.widget_show_sidebar_ads, true);
    const advertisement = advertisements?.[locationId] ?? null;
    const widthValue = toNumber(width);
    const heightValue = toNumber(height);
    const compactPreview =
        (heightValue !== null && heightValue <= 170) ||
        (widthValue !== null && widthValue <= 320);
    const advertisementsHref = resolveAdminAdvertisementsHref();
    const viewSentRef = useRef(false);

    useEffect(() => {
        if (isAdmin || !advertisement || viewSentRef.current) {
            return;
        }

        const key = `ad:view:${locationId}:${advertisement.id}`;

        try {
            if (window.sessionStorage.getItem(key) === '1') {
                viewSentRef.current = true;
                return;
            }
            window.sessionStorage.setItem(key, '1');
        } catch {
            // Ignore blocked storage.
        }

        viewSentRef.current = true;
        void fetch(route('public-advertisements.view', advertisement.id), {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            keepalive: true,
        }).catch(() => undefined);
    }, [advertisement, isAdmin, locationId]);

    if (!showAds && !isAdmin) {
        return null;
    }

    if (!advertisement) {
        if (hideWhenEmpty && !isAdmin) {
            return null;
        }

        if (isAdmin) {
            return (
                <div
                    className={`overflow-hidden rounded-3xl border border-dashed border-primary/35 bg-primary/5 ${className}`}
                    style={{ width, height }}
                >
                    <div
                        className={`h-full w-full overflow-y-auto ${compactPreview ? 'p-2.5' : 'p-4'}`}
                    >
                        <div
                            className={`mx-auto text-center ${compactPreview ? 'max-w-full' : 'max-w-xs'}`}
                        >
                            <div
                                className={`mx-auto flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 ${compactPreview ? 'h-9 w-9' : 'h-12 w-12'}`}
                            >
                                <Settings2
                                    className={
                                        compactPreview ? 'h-4 w-4' : 'h-5 w-5'
                                    }
                                />
                            </div>
                            <p
                                className={`font-black uppercase tracking-[0.18em] text-primary ${compactPreview ? 'mt-2 text-[10px]' : 'mt-4 text-xs'}`}
                            >
                                Slot vide
                            </p>
                            <p
                                className={`break-words font-semibold text-gray-900 dark:text-white ${compactPreview ? 'mt-1 text-xs' : 'mt-2 text-sm'}`}
                            >
                                {label}
                            </p>
                            <p
                                className={`break-all font-mono text-gray-500 dark:text-gray-400 ${compactPreview ? 'mt-1 text-[10px]' : 'mt-2 text-xs'}`}
                            >
                                {locationId}
                            </p>
                            <Link
                                href={advertisementsHref}
                                className={`inline-flex rounded-full bg-primary font-black uppercase text-white ${compactPreview ? 'mt-2 px-3 py-1.5 text-[10px] tracking-[0.14em]' : 'mt-4 px-4 py-2 text-[11px] tracking-[0.18em]'}`}
                            >
                                Gerer
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return hideWhenEmpty ? null : (
            <div className={className} style={{ width, height }}>
                <div
                    className={`group relative h-full w-full overflow-y-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-white to-primary/[0.04] ${
                        compactPreview ? 'p-2.5' : 'p-4'
                    } dark:border-primary/25 dark:from-primary/20 dark:via-gray-900 dark:to-primary/10`}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.12]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                            backgroundSize: '14px 14px',
                        }}
                    />
                    <div className="relative flex h-full flex-col justify-center">
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                            <Megaphone className="h-3 w-3" />
                            Sponsor
                        </span>
                        <p
                            className={`mt-2 font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white ${
                                compactPreview ? 'text-xs' : 'text-sm'
                            }`}
                        >
                            Espace disponible
                        </p>
                        <p
                            className={`mt-1 leading-relaxed text-gray-700 dark:text-white/75 ${
                                compactPreview ? 'text-[11px]' : 'text-xs'
                            }`}
                        >
                            Emplacement reserve a un partenaire.
                        </p>
                        {!compactPreview && (
                            <span className="mt-2 inline-flex w-fit rounded-full border border-gray-300/80 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600 dark:border-white/20 dark:bg-white/10 dark:text-white/70">
                                Slot publicitaire
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Deux formats. Sans titre ni description, la creation de l'annonceur porte
    // deja son propre message : on l'affiche nue. Avec un texte, on compose un
    // encart ou le texte passe SOUS l'image, jamais par-dessus.
    const hasCopy = Boolean(advertisement.title || advertisement.description);

    // La hauteur demandee est celle de l'IMAGE, pas de la carte entiere : sinon
    // le bloc de texte rogne l'espace du visuel, qui se retrouve reduit de
    // moitie. Avec un texte, la carte grandit en dessous de l'image.
    const media = (
        <div
            className="w-full shrink-0 overflow-hidden bg-gray-50 dark:bg-white/[0.03]"
            style={{ height }}
        >
            {/* object-contain : l'annonceur fournit un visuel au format demande,
                le recadrer amputait son message. */}
            <ImageWithFallback
                src={advertisement.image_url}
                fallbackSrc="/images/article-placeholder.svg"
                alt={advertisement.title || label}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
            />
        </div>
    );

    const content = (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 ${className}`}
            style={hasCopy ? { width } : { width, height }}
        >
            {/* Mention obligatoire, reduite au minimum pour ne pas masquer la creation. */}
            <span className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                <Megaphone className="h-2.5 w-2.5" />
                Sponsor
            </span>

            {media}

            {hasCopy && (
                <div className="shrink-0 border-t border-black/5 bg-white p-3 dark:border-white/10 dark:bg-gray-900">
                    {advertisement.title && (
                        <p className="truncate text-sm font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white">
                            {advertisement.title}
                        </p>
                    )}
                    {advertisement.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-white/70">
                            {advertisement.description}
                        </p>
                    )}
                    {advertisement.redirect_url && (
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                            En savoir plus
                            <ExternalLink className="h-3 w-3" />
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (advertisement.redirect_url) {
        return (
            <a
                href={`/public-advertisements/${advertisement.id}/click`}
                target="_blank"
                rel="noreferrer noopener"
                className="block"
            >
                {content}
            </a>
        );
    }

    return content;
}
