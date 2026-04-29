import { Quote, Sparkles, Star } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    location: string;
    rating: number;
    quote: string;
    avatar_color: string;
    initials: string;
    highlight?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: 'Aminata Diallo',
        role: 'Productrice de riz',
        location: 'Glazoue, Benin',
        rating: 5,
        quote: "LE RURAL est devenu ma boussole quotidienne. Grace a leurs analyses sur les prix du riz et les politiques agricoles, j'ai pu doubler mes revenus en deux saisons.",
        avatar_color: 'from-primary to-emerald-700',
        initials: 'AD',
        highlight: 'Analyse des marches',
    },
    {
        id: 2,
        name: 'Kossi Mensah',
        role: 'Ingenieur agronome',
        location: 'Lome, Togo',
        rating: 5,
        quote: "Des dossiers fouilles, une info de terrain que l'on ne trouve nulle part ailleurs. LE RURAL est la seule redaction qui comprend vraiment les enjeux de l'agriculture ouest-africaine.",
        avatar_color: 'from-amber-500 to-orange-600',
        initials: 'KM',
        highlight: 'Journalisme de fond',
    },
    {
        id: 3,
        name: 'Fatoumata Traore',
        role: 'Cooperative feminine',
        location: 'Bobo-Dioulasso, Burkina',
        rating: 5,
        quote: "Leurs reportages ont donne de la visibilite a notre cooperative de karite. En six mois, nous avons triple nos commandes grace a l'echo mediatique de LE RURAL.",
        avatar_color: 'from-rose-500 to-pink-600',
        initials: 'FT',
        highlight: 'Voix des femmes',
    },
    {
        id: 4,
        name: 'Ibrahim Sow',
        role: 'Eleveur de bovins',
        location: 'Tahoua, Niger',
        rating: 5,
        quote: "Les alertes meteo et sanitaires publiees sur LE RURAL m'ont permis de sauver mon cheptel lors de la derniere epidemie. Un service essentiel pour les eleveurs du Sahel.",
        avatar_color: 'from-blue-500 to-indigo-600',
        initials: 'IS',
        highlight: 'Alerte terrain',
    },
    {
        id: 5,
        name: 'Marie-Claire Houngbo',
        role: 'Etudiante en agro-economie',
        location: 'Cotonou, Benin',
        rating: 5,
        quote: "LE RURAL TV, les podcasts, les dossiers: tout est pense pour la nouvelle generation. C'est devenu une reference academique pour nos travaux de recherche.",
        avatar_color: 'from-violet-500 to-fuchsia-600',
        initials: 'MH',
        highlight: 'Ressource pedagogique',
    },
    {
        id: 6,
        name: 'Seydou Ouedraogo',
        role: 'Maraicher bio',
        location: 'Ouagadougou, Burkina',
        rating: 5,
        quote: "Enfin un media qui parle d'agriculture durable sans discours moralisateur. Les fiches techniques et les retours d'experience m'aident a ameliorer mes rendements.",
        avatar_color: 'from-teal-500 to-emerald-600',
        initials: 'SO',
        highlight: 'Agriculture durable',
    },
];

export default function TestimonialsSection({ testimonials = DEFAULT_TESTIMONIALS }: { testimonials?: Testimonial[] }) {
    const visibleTestimonials = testimonials.slice(0, 3);

    if (!visibleTestimonials.length) {
        return null;
    }

    return (
        <section className="relative mx-0 mb-6 mt-16 overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10 py-12 md:mx-4 md:mb-8 md:mt-20 md:rounded-3xl md:py-14 dark:from-gray-950 dark:via-gray-900 dark:to-primary/10">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 max-w-2xl">
                    <div className="mb-3 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>LE RURAL</span>
                        <span className="h-px w-8 bg-primary/40" />
                        <span className="text-gray-500 dark:text-gray-400">Avis clients</span>
                    </div>
                    <h2 className="font-heading text-3xl font-black uppercase leading-[0.96] tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        Ce que nos lecteurs disent
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
                        Une selection de retours terrain sur la qualite editoriale, l'utilite pratique et l'impact de LE RURAL.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {visibleTestimonials.map((testimonial) => (
                        <article
                            key={testimonial.id}
                            className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_22px_60px_-28px_rgba(47,106,17,0.28)] dark:border-white/10 dark:bg-gray-900"
                        >
                            <Quote className="absolute right-5 top-5 h-10 w-10 text-primary/12" aria-hidden="true" />
                            <div className="mb-4 flex items-center gap-2">
                                {[...Array(testimonial.rating)].map((_, index) => (
                                    <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                                {testimonial.highlight && (
                                    <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                        {testimonial.highlight}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
                                {testimonial.quote}
                            </p>

                            <div className="mt-6 flex items-center gap-3 border-t border-dashed border-gray-200 pt-4 dark:border-gray-800">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${testimonial.avatar_color} font-heading text-sm font-black uppercase text-white`}>
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <div className="font-heading text-base font-black tracking-tight text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                        {testimonial.role} | {testimonial.location}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
