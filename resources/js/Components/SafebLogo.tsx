import { useId } from 'react';

interface SafebLogoProps {
    className?: string;
    subtitle?: boolean;
}

/**
 * Logo officiel SAFEB — reproduit la charte : fond brun #543D32,
 * wordmark "Safeb" (lettres claires, « f » moutarde) et sous-titre
 * "Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Bénin".
 */
export default function SafebLogo({
    className = '',
    subtitle = true,
}: SafebLogoProps) {
    const rawId = useId();
    const gradientId = `safeb-shine-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg
            viewBox="0 0 400 400"
            className={className}
            role="img"
            aria-label="SAFEB — Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Bénin"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="400" height="400" fill="#543D32" />
            <rect
                width="400"
                height="400"
                fill={`url(#${gradientId})`}
                opacity="0.55"
            />
            <defs>
                <radialGradient
                    id={gradientId}
                    cx="0.5"
                    cy="0.32"
                    r="0.85"
                >
                    <stop offset="0%" stopColor="#6E5544" />
                    <stop offset="55%" stopColor="#543D32" />
                    <stop offset="100%" stopColor="#432F25" />
                </radialGradient>
            </defs>

            {/* Wordmark */}
            <text
                x="200"
                y="168"
                textAnchor="middle"
                fontFamily="Poppins, 'Segoe UI', Arial, sans-serif"
                fontWeight="800"
                fontSize="120"
                letterSpacing="-3"
            >
                <tspan fill="#F4EFE8">S</tspan>
                <tspan fill="#F4EFE8">a</tspan>
                <tspan fill="#E4B23E">f</tspan>
                <tspan fill="#F4EFE8">e</tspan>
                <tspan fill="#F4EFE8">b</tspan>
            </text>

            {subtitle && (
                <>
                    <line
                        x1="84"
                        y1="210"
                        x2="316"
                        y2="210"
                        stroke="#E4B23E"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.85"
                    />
                    <text
                        x="200"
                        y="252"
                        textAnchor="middle"
                        fontFamily="Lato, 'Segoe UI', Arial, sans-serif"
                        fontWeight="700"
                        fontSize="19"
                        fill="#FFFFFF"
                    >
                        Salon de l'Autonomisation de la
                    </text>
                    <text
                        x="200"
                        y="282"
                        textAnchor="middle"
                        fontFamily="Lato, 'Segoe UI', Arial, sans-serif"
                        fontWeight="700"
                        fontSize="19"
                        fill="#FFFFFF"
                    >
                        Femme Entrepreneure Rurale du Bénin
                    </text>
                </>
            )}
        </svg>
    );
}
