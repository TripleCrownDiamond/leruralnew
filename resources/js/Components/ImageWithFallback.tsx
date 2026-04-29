import { useEffect, useMemo, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    fallbackSources?: string[];
    fallbackComponent?: ReactNode;
}

function unique(values: Array<string | null | undefined>): string[] {
    return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function extractYoutubeCandidates(src: string): string[] {
    const candidates: string[] = [];

    const matchers = [
        /[?&]v=([^&]+)/i,
        /youtu\.be\/([^/?&]+)/i,
        /\/embed\/([^/?&]+)/i,
        /\/shorts\/([^/?&]+)/i,
        /\/vi\/([^/?&]+)/i,
    ];

    let videoId: string | null = null;
    for (const matcher of matchers) {
        const match = src.match(matcher);
        if (match?.[1]) {
            videoId = decodeURIComponent(match[1]);
            break;
        }
    }

    if (videoId) {
        candidates.push(
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            `https://img.youtube.com/vi/${videoId}/default.jpg`,
        );
    }

    if (/maxresdefault/i.test(src)) {
        candidates.push(src.replace(/maxresdefault/gi, 'hqdefault'));
        candidates.push(src.replace(/maxresdefault/gi, 'mqdefault'));
    }

    if (/hqdefault/i.test(src)) {
        candidates.push(src.replace(/hqdefault/gi, 'mqdefault'));
        candidates.push(src.replace(/hqdefault/gi, 'default'));
    }

    if (/mqdefault/i.test(src)) {
        candidates.push(src.replace(/mqdefault/gi, 'default'));
    }

    if (/videoseries/i.test(src)) {
        const playlistId = new URL(src, 'https://www.youtube.com').searchParams.get('list');
        if (playlistId) {
            candidates.push(
                `https://i.ytimg.com/vi_webp/videoseries/hqdefault.webp?list=${encodeURIComponent(playlistId)}`,
                `https://i.ytimg.com/vi/videoseries/hqdefault.jpg?list=${encodeURIComponent(playlistId)}`,
                `https://i.ytimg.com/vi_webp/videoseries/mqdefault.webp?list=${encodeURIComponent(playlistId)}`,
            );
        }
    }

    return unique(candidates);
}

export default function ImageWithFallback({
    src,
    fallbackSrc,
    fallbackSources = [],
    fallbackComponent,
    className,
    alt,
    loading,
    decoding,
    ...props
}: ImageWithFallbackProps) {
    const imageLoading = loading ?? 'lazy';
    const imageDecoding = decoding ?? 'async';

    const candidateSources = useMemo(() => {
        const base = typeof src === 'string' ? src.trim() : '';
        if (!base) {
            return [] as string[];
        }

        const derived = /youtube|ytimg/i.test(base) ? extractYoutubeCandidates(base) : [];
        const httpsVariant = base.startsWith('http://') ? base.replace(/^http:\/\//i, 'https://') : null;
        return unique([base, httpsVariant, ...fallbackSources, ...derived, fallbackSrc]);
    }, [fallbackSources, fallbackSrc, src]);

    const [candidateIndex, setCandidateIndex] = useState(0);
    const currentSrc = candidateSources[candidateIndex] ?? null;

    useEffect(() => {
        setCandidateIndex(0);
    }, [candidateSources.join('|')]);

    if (!currentSrc) {
        if (fallbackComponent) return <>{fallbackComponent}</>;
        if (fallbackSrc) {
            return (
                <img
                    src={fallbackSrc}
                    alt={alt || 'Fallback'}
                    className={className}
                    loading={imageLoading}
                    decoding={imageDecoding}
                    {...props}
                />
            );
        }

        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 ${className || ''}`}>
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    const handleError = () => {
        if (candidateIndex < candidateSources.length - 1) {
            setCandidateIndex((current) => current + 1);
            return;
        }

        setCandidateIndex(candidateSources.length);
    };

    if (candidateIndex >= candidateSources.length) {
        if (fallbackComponent) return <>{fallbackComponent}</>;
        if (fallbackSrc) {
            return (
                <img
                    src={fallbackSrc}
                    alt={alt || 'Fallback'}
                    className={className}
                    loading={imageLoading}
                    decoding={imageDecoding}
                    {...props}
                />
            );
        }

        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 ${className || ''}`}>
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={className}
            onError={handleError}
            loading={imageLoading}
            decoding={imageDecoding}
            {...props}
        />
    );
}
