import { useState, ImgHTMLAttributes, ReactNode } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    fallbackComponent?: ReactNode;
}

export default function ImageWithFallback({ 
    src, 
    fallbackSrc, 
    fallbackComponent,
    className,
    alt,
    ...props 
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    if (error || !src) {
        if (fallbackComponent) return <>{fallbackComponent}</>;
        if (fallbackSrc) return <img src={fallbackSrc} alt={alt || "Fallback"} className={className} {...props} />;
        
        // Default SVG Fallback if nothing else provided
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 ${className}`}>
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className={className} 
            onError={() => setError(true)}
            {...props} 
        />
    );
}
