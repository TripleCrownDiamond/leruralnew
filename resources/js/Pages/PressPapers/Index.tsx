import JournalShelf, { type JournalIssue } from '@/Components/JournalShelf';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Newspaper, Sparkles } from 'lucide-react';

interface PressPaper {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    cover_url: string | null;
    pdf_url: string | null;
    price: number;
    price_label: string;
    published_human: string | null;
    can_download: boolean;
    download_url: string;
    action_url: string;
    action_label: string;
    cover_label?: string | null;
}

export default function Index({ pressPapers }: { pressPapers: PressPaper[] }) {
    const issues: JournalIssue[] = pressPapers.map((paper) => ({
        id: paper.id,
        title: paper.title,
        cover_url: paper.cover_url,
        published_human: paper.published_human,
        price_label: paper.price_label,
        action_url: paper.action_url,
        action_label: paper.action_label,
        badge: paper.cover_label || 'Mise en avant',
    }));

    return (
        <MainLayout title="La une de LE RURAL">
            <Head title="La une de LE RURAL" />

            <section className="mx-0 mb-8 md:mx-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(180deg,#fcfaf5_0%,#f2ebdb_100%)] p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#0f1720_0%,#070d16_100%)] sm:p-8">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div aria-hidden="true" className="pointer-events-none absolute right-0 top-8 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

                    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)] lg:items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-amber-300">
                                <Newspaper className="h-3.5 w-3.5" />
                                Edition papier
                            </div>
                            <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                                La une de LE RURAL
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-white/70 sm:text-base">
                                Chaque numero commence ici par sa premiere page scannee, puis donne acces au PDF complet ou au checkout selon le statut de l'edition.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_28px_-12px_rgba(47,106,17,0.55)] transition hover:-translate-y-0.5">
                                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                                    Retour accueil
                                </Link>
                                <a href="#journal-shelf" className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/20 dark:bg-white/5 dark:text-white">
                                    Voir les numeros
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-3xl border border-white/20 bg-gray-950/90 p-5 text-white shadow-[0_18px_45px_-25px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                    Acces rapide
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-white/75">
                                    Le lecteur public reste centre sur la premiere page et sur l'acces immediat au PDF.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-stone-300/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Format
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/65">
                                    Scan de couverture, date de parution, prix et bouton action selon la disponibilite.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div id="journal-shelf">
                <JournalShelf
                    items={issues}
                    eyebrow="La une de LE RURAL"
                    title="Les unes du journal"
                    description="Parcourez les couvertures publiees, puis ouvrez le PDF ou le checkout sans quitter la page."
                    emptyTitle="Aucune une disponible"
                    emptyDescription="La une du journal apparaitra ici des qu'une edition papier sera publiee depuis l'administration."
                    tone="light"
                />
            </div>
        </MainLayout>
    );
}
