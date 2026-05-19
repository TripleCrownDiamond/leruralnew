import MainLayout from '@/Layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';

export default function About() {
    const { props } = usePage<any>();
    const baseUrl = (() => {
        try {
            return props.ziggy?.location
                ? new URL(props.ziggy.location).origin
                : window.location.origin;
        } catch {
            return 'https://lerural.bj';
        }
    })();
    const shareDescription =
        "LE RURAL - Le premier groupe de presse agricole en Afrique de l'Ouest.";
    const shareImage = `${baseUrl}/logos/logo.png`;
    const shareUrl = props.ziggy?.location || `${baseUrl}/a-propos`;

    return (
        <MainLayout title="A propos">
            <Head title="A propos">
                <meta
                    head-key="description"
                    name="description"
                    content={shareDescription}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="LE RURAL"
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="A propos"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={shareDescription}
                />
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={shareImage}
                />
                <meta
                    head-key="og:image:secure_url"
                    property="og:image:secure_url"
                    content={shareImage}
                />
                <meta head-key="og:url" property="og:url" content={shareUrl} />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content="A propos"
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={shareDescription}
                />
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={shareImage}
                />
                <link head-key="canonical" rel="canonical" href={shareUrl} />
            </Head>

            <div className="container mx-auto max-w-4xl py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground">
                        Qui sommes-nous ?
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        LE RURAL - Le premier groupe de presse agricole en
                        Afrique de l'Ouest.
                    </p>
                </div>

                <div className="prose prose-lg mx-auto max-w-none dark:prose-invert">
                    <p>
                        Fonde en 2013, <strong>LE RURAL</strong> est un media
                        panafricain specialise dans l'information agricole et
                        rurale. Notre mission est de promouvoir l'agriculture
                        africaine, de valoriser les acteurs du monde rural et de
                        fournir une information fiable et pertinente pour le
                        developpement du secteur.
                    </p>

                    <h3>Notre vision</h3>
                    <p>
                        Nous croyons en une Afrique prospere grace a une
                        agriculture moderne, durable et inclusive. Nous aspirons
                        a etre la reference en information agricole sur le
                        continent, en connectant producteurs, decideurs,
                        chercheurs et consommateurs.
                    </p>

                    <h3>Nos missions</h3>
                    <ul>
                        <li>Informer sur les enjeux agricoles et ruraux.</li>
                        <li>Former et sensibiliser les acteurs du secteur.</li>
                        <li>
                            Promouvoir les innovations et les bonnes pratiques.
                        </li>
                        <li>
                            Accompagner les entreprises et projets agricoles.
                        </li>
                    </ul>

                    <div className="my-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">
                                Information
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Actualites, analyses, reportages et dossiers
                                exclusifs.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">Web TV</h4>
                            <p className="text-sm text-muted-foreground">
                                Emissions, documentaires et interviews video.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                            <h4 className="mb-2 text-lg font-bold">
                                Partenariats
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Accompagnement, visibilite et conseil
                                strategique.
                            </p>
                        </div>
                    </div>

                    <h3>L'equipe</h3>
                    <p>
                        LE RURAL, c'est une equipe jeune, dynamique et
                        passionnee, composee de journalistes, communicants et
                        experts agricoles, tous devoues a la cause du
                        developpement rural.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
