import { HTMLAttributes } from 'react';

export default function ApplicationLogo({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`relative ${className}`} {...props}>
            {/* Logo Vert pour le mode Light (fond blanc) */}
            <img
                src="/logos/logo.png"
                alt="LE RURAL"
                className="dark:hidden w-auto h-full object-contain mx-auto"
            />
            {/* Logo Blanc pour le mode Dark (fond sombre/vert) */}
            <img
                src="/logos/logo-blanc.png"
                alt="LE RURAL"
                className="hidden dark:block w-auto h-full object-contain mx-auto"
            />
        </div>
    );
}
