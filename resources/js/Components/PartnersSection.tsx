import { useEffect, useState } from 'react';
import ImageWithFallback from '@/Components/ImageWithFallback';

type Partner = {
    id: number;
    name: string;
    logo: string;
    url: string | null;
};

export default function PartnersSection({ partners = [] }: { partners?: Partner[] }) {
    if (!partners || partners.length === 0) return null;

    // Duplicate partners for seamless loop if needed (if count is low, duplicate more times)
    const displayPartners = partners.length < 10 ? [...partners, ...partners, ...partners] : [...partners, ...partners];

    return (
        <section className="py-12 bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">
                    Nos Partenaires
                </h2>
                
                <div className="relative flex overflow-x-hidden group">
                    <div className="animate-marquee flex whitespace-nowrap gap-12 items-center">
                        {displayPartners.map((partner, index) => (
                            <a 
                                key={`${partner.id}-${index}`} 
                                href={partner.url || '#'} 
                                target={partner.url ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 rounded-lg p-2 bg-white dark:bg-white/90"
                                title={partner.name}
                            >
                                <ImageWithFallback 
                                    src={partner.logo} 
                                    alt={partner.name} 
                                    className="max-h-full max-w-full object-contain"
                                />
                            </a>
                        ))}
                    </div>
                    
                    {/* Gradient masks for smooth edges */}
                    <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white dark:from-transparent to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white dark:from-transparent to-transparent z-10 pointer-events-none" />
                </div>
            </div>

            <style>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
}
