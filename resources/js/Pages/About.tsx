import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <MainLayout title="À Propos">
            <div className="container mx-auto max-w-4xl py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground">Qui sommes-nous ?</h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        Le Rural - Le Premier Groupe de Presse Agricole en Afrique de l'Ouest.
                    </p>
                </div>

                <div className="prose prose-lg mx-auto max-w-none dark:prose-invert">
                    <p>
                        Fondé en 2013, <strong>Le Rural</strong> est un média panafricain spécialisé dans l'information agricole et rurale. Notre mission est de promouvoir l'agriculture africaine, de valoriser les acteurs du monde rural et de fournir une information fiable et pertinente pour le développement du secteur.
                    </p>
                    
                    <h3>Notre Vision</h3>
                    <p>
                        Nous croyons en une Afrique prospère grâce à une agriculture moderne, durable et inclusive. Nous aspirons à être la référence en matière d'information agricole sur le continent, en connectant les producteurs, les décideurs, les chercheurs et les consommateurs.
                    </p>

                    <h3>Nos Missions</h3>
                    <ul>
                        <li>Informer sur les enjeux agricoles et ruraux.</li>
                        <li>Former et sensibiliser les acteurs du secteur.</li>
                        <li>Promouvoir les innovations et les bonnes pratiques.</li>
                        <li>Accompagner les entreprises et les projets agricoles.</li>
                    </ul>

                    <div className="my-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary">
                                📰
                            </div>
                            <h4 className="mb-2 text-lg font-bold">Information</h4>
                            <p className="text-sm text-muted-foreground">
                                Actualités, analyses, reportages et dossiers exclusifs.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary">
                                📺
                            </div>
                            <h4 className="mb-2 text-lg font-bold">Web TV</h4>
                            <p className="text-sm text-muted-foreground">
                                Émissions, documentaires et interviews vidéo.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary">
                                🤝
                            </div>
                            <h4 className="mb-2 text-lg font-bold">Partenariats</h4>
                            <p className="text-sm text-muted-foreground">
                                Accompagnement, visibilité et conseil stratégique.
                            </p>
                        </div>
                    </div>

                    <h3>L'Équipe</h3>
                    <p>
                        Le Rural, c'est une équipe jeune, dynamique et passionnée, composée de journalistes, de communicants et d'experts agricoles, tous dévoués à la cause du développement rural.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
