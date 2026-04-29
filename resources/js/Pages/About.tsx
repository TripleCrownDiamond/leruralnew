import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <MainLayout title="A propos">
            <Head title="A propos" />

            <div className="container mx-auto max-w-4xl py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground">Qui sommes-nous ?</h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        LE RURAL - Le premier groupe de presse agricole en Afrique de l'Ouest.
                    </p>
                </div>

                <div className="prose prose-lg mx-auto max-w-none dark:prose-invert">
                    <p>
                        Fonde en 2013, <strong>LE RURAL</strong> est un media panafricain specialise dans l'information agricole et rurale.
                        Notre mission est de promouvoir l'agriculture africaine, de valoriser les acteurs du monde rural
                        et de fournir une information fiable et pertinente pour le developpement du secteur.
                    </p>

                    <h3>Notre vision</h3>
                    <p>
                        Nous croyons en une Afrique prospere grace a une agriculture moderne, durable et inclusive.
                        Nous aspirons a etre la reference en information agricole sur le continent,
                        en connectant producteurs, decideurs, chercheurs et consommateurs.
                    </p>

                    <h3>Nos missions</h3>
                    <ul>
                        <li>Informer sur les enjeux agricoles et ruraux.</li>
                        <li>Former et sensibiliser les acteurs du secteur.</li>
                        <li>Promouvoir les innovations et les bonnes pratiques.</li>
                        <li>Accompagner les entreprises et projets agricoles.</li>
                    </ul>

                    <div className="my-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">Information</h4>
                            <p className="text-sm text-muted-foreground">
                                Actualites, analyses, reportages et dossiers exclusifs.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">Web TV</h4>
                            <p className="text-sm text-muted-foreground">
                                Emissions, documentaires et interviews video.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">Partenariats</h4>
                            <p className="text-sm text-muted-foreground">
                                Accompagnement, visibilite et conseil strategique.
                            </p>
                        </div>
                    </div>

                    <h3>L'equipe</h3>
                    <p>
                        LE RURAL, c'est une equipe jeune, dynamique et passionnee,
                        composee de journalistes, communicants et experts agricoles,
                        tous devoues a la cause du developpement rural.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}