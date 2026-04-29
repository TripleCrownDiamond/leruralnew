import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import ImageWithFallback from '@/Components/ImageWithFallback';

interface StaticPageData {
    id: number;
    slug: string;
    title: string;
    category: 'legal' | 'info' | 'other';
    content: string | null;
    meta_description: string | null;
    hero_image_url?: string | null;
    updated_at: string;
}

const categoryLabel: Record<StaticPageData['category'], string> = {
    legal: 'Pages statiques',
    info: 'Informations',
    other: 'Pages statiques',
};

export default function StaticPage({ page }: { page: StaticPageData }) {
    const updated = new Date(page.updated_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <MainLayout>
            <Head title={page.title}>
                {page.meta_description && <meta name="description" content={page.meta_description} />}
            </Head>

            <article className="mx-auto max-w-5xl space-y-6">
                <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/30 px-6 py-10 text-white shadow-[0_28px_70px_-40px_rgba(47,106,17,0.7)] sm:px-8 sm:py-12">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />

                    <div className="relative">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/85">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            {categoryLabel[page.category] ?? 'Page'}
                        </p>
                        <h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-5xl">{page.title}</h1>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Mise a jour le {updated}</p>
                    </div>
                </section>

                {page.hero_image_url && (
                    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                        <ImageWithFallback
                            src={page.hero_image_url}
                            alt={page.title}
                            className="h-auto max-h-[460px] w-full object-cover"
                            fallbackSrc="/images/article-placeholder.svg"
                        />
                    </section>
                )}

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                    <div
                        className="prose prose-gray max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:text-primary dark:prose-invert dark:prose-headings:text-white"
                        dangerouslySetInnerHTML={{ __html: page.content ?? '<p>Contenu en cours de redaction.</p>' }}
                    />
                </section>
            </article>
        </MainLayout>
    );
}
