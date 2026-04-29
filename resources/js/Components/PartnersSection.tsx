import EmptySectionState from '@/Components/EmptySectionState';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { Handshake } from 'lucide-react';

type Partner = {
    id: number;
    name: string;
    logo: string;
    url: string | null;
};

export default function PartnersSection({ partners = [] }: { partners?: Partner[] }) {
    const items = partners.length > 4 ? [...partners, ...partners] : [...partners, ...partners, ...partners];

    return (
        <section className="relative mx-0 mb-8 overflow-hidden border-y border-stone-200/80 bg-[linear-gradient(180deg,#fbf8f1_0%,#f3ecdd_100%)] py-14 md:mx-4 md:rounded-[2rem] md:border dark:border-white/10 dark:bg-[linear-gradient(180deg,#131a22_0%,#0f1720_100%)]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary shadow-sm dark:border-white/10 dark:bg-white/5">
                        <Handshake className="h-3.5 w-3.5" />
                        Partenaires
                    </div>
                    <h2 className="mt-5 font-heading text-3xl font-black uppercase tracking-[0.08em] text-gray-900 dark:text-white md:text-4xl">
                        <span className="relative inline-block px-3">
                            <span className="relative z-10">Ils nous accompagnent</span>
                            <span className="absolute inset-x-0 bottom-1 h-3 rounded-full bg-amber-300/55" />
                        </span>
                    </h2>
                </div>

                {partners.length > 0 ? (
                    <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-black/5 bg-white/72 px-4 py-6 shadow-inner dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f6efdf] to-transparent dark:from-[#131a22]" aria-hidden="true" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f6efdf] to-transparent dark:from-[#131a22]" aria-hidden="true" />

                        <div className="partners-marquee flex min-w-max items-center gap-4 sm:gap-5">
                            {items.map((partner, index) => {
                                const card = (
                                    <div className="group flex h-24 w-[170px] items-center justify-center rounded-[1.4rem] border border-black/5 bg-white/90 px-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_24px_60px_-28px_rgba(47,106,17,0.35)] dark:border-white/10 dark:bg-white/[0.06]">
                                        <ImageWithFallback
                                            src={partner.logo}
                                            alt={partner.name}
                                            className="max-h-12 max-w-full object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                                        />
                                    </div>
                                );

                                return partner.url ? (
                                    <a key={`${partner.id}-${index}`} href={partner.url} target="_blank" rel="noopener noreferrer" title={partner.name}>
                                        {card}
                                    </a>
                                ) : (
                                    <div key={`${partner.id}-${index}`} title={partner.name}>
                                        {card}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <EmptySectionState
                        className="mt-10"
                        eyebrow="Partenariats"
                        title="Aucun partenaire affiche"
                        description="Les logos des partenaires apparaitront ici des qu'une fiche active sera ajoutee en base."
                        tone="amber"
                    />
                )}
            </div>

            {partners.length > 0 && (
                <style>{`
                    .partners-marquee {
                        animation: partners-marquee 24s linear infinite;
                    }
                    .partners-marquee:hover {
                        animation-play-state: paused;
                    }
                    @keyframes partners-marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
            )}
        </section>
    );
}