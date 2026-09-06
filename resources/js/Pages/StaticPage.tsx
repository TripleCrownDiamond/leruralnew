import ImageWithFallback from '@/Components/ImageWithFallback';
import MainLayout from '@/Layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';

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
    const resolveAbsoluteUrl = (value?: string | null) => {
        if (!value) return `${baseUrl}/logos/logo.png`;
        if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
            return value.startsWith('//') ? `https:${value}` : value;
        }
        try {
            return new URL(value, baseUrl).href;
        } catch {
            return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
        }
    };
    const shareDescription =
        page.meta_description ||
        page.content?.replace(/<[^>]*>/g, '').slice(0, 180) ||
        page.title;
    const shareImage = resolveAbsoluteUrl(
        page.hero_image_url || '/logos/logo.png',
    );
    const shareUrl = props.ziggy?.location || `${baseUrl}/${page.slug}`;
    const updated = new Date(page.updated_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <MainLayout>
            <Head title={page.title}>
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
                    content={page.title}
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
                    head-key="og:locale"
                    property="og:locale"
                    content="fr_BJ"
                />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={page.title}
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

            <article className="mx-auto max-w-5xl space-y-6">
                <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/30 px-6 py-10 text-white shadow-[0_28px_70px_-40px_rgba(47,106,17,0.7)] sm:px-8 sm:py-12">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
                    />

                    <div className="relative">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/85">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            {categoryLabel[page.category] ?? 'Page'}
                        </p>
                        <h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-5xl">
                            {page.title}
                        </h1>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                            Mise a jour le {updated}
                        </p>
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
                        className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:text-primary dark:prose-headings:text-white"
                        dangerouslySetInnerHTML={{
                            __html:
                                page.content ??
                                '<p>Contenu en cours de redaction.</p>',
                        }}
                    />
                </section>
            </article>
        </MainLayout>
    );
}
