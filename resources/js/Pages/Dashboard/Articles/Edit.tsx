import Checkbox from '@/Components/Checkbox';

import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';

import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';

import CloudinaryUpload from '@/Components/CloudinaryUpload';

import CoverPositionControl from '@/Components/CoverPositionControl';

import InputError from '@/Components/InputError';

import InputLabel from '@/Components/InputLabel';

import MultiSelect from '@/Components/MultiSelect';

import TiptapEditor from '@/Components/TiptapEditor';

import MediaLibraryPicker from '@/Components/MediaLibraryPicker';

import TextInput from '@/Components/TextInput';

import DashboardLayout from '@/Layouts/DashboardLayout';

import { buildStoredArticleContent, hasMeaningfulContent, htmlToMarkdown, markdownToHtml, parseStoredArticleContent, type ArticleContentMode } from '@/lib/articleContent';

import { Head, router, useForm } from '@inertiajs/react';

import { ArrowLeft, CalendarClock, Code2, Eye, FileText, Newspaper, Sparkles, Trash2 } from 'lucide-react';

import type { FormEventHandler, ReactNode } from 'react';

import { useState } from 'react';



interface Category {

    id: number;

    name_fr: string;

}



interface Article {

    id: number;

    slug: string;

    title_fr: string;

    excerpt_fr: string;

    content_fr: string;

    featured_image?: string;

    featured_image_position_x?: number | null;

    featured_image_position_y?: number | null;

    is_premium: boolean;

    price?: number | string | null;

    published_at?: string | null;

    author_name: string;

    category_id?: number | null;

    categories?: Array<{ id: number; name_fr: string }>;

    is_featured: boolean;

    featured_until?: string | null;

}



interface Props {

    article: Article;

    categories: Category[];

}



function toDateTimeLocalValue(value?: string | null): string {

    if (!value) return '';



    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';



    const pad = (part: number) => String(part).padStart(2, '0');



    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

}



function inferPublicationMode(value?: string | null): 'draft' | 'now' | 'scheduled' {

    if (!value) return 'draft';



    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'draft';



    return date.getTime() > Date.now() ? 'scheduled' : 'now';

}



export default function Edit({ article, categories }: Props) {

    const initialContent = parseStoredArticleContent(article.content_fr);

    const [publicationMode, setPublicationMode] = useState<'draft' | 'now' | 'scheduled'>(inferPublicationMode(article.published_at));



    const { data, setData, put, processing, errors, transform } = useForm({

        title_fr: article.title_fr,

        excerpt_fr: article.excerpt_fr,

        content_fr: initialContent.visualContent,

        markdown_content_fr: initialContent.markdownContent,

        content_mode: initialContent.mode as ArticleContentMode,

        featured_image: article.featured_image || '',

        featured_image_position_x: article.featured_image_position_x ?? 50,

        featured_image_position_y: article.featured_image_position_y ?? 50,

        is_premium: article.is_premium,

        price: article.price || '',

        published_at: toDateTimeLocalValue(article.published_at),

        author_name: article.author_name,

        categories: article.categories ? article.categories.map((category) => category.id) : (article.category_id ? [article.category_id] : []),

        is_featured: article.is_featured,

        featured_until: toDateTimeLocalValue(article.featured_until),

    });



    const isScheduled = publicationMode === 'scheduled';



    const submit: FormEventHandler = (event) => {

        event.preventDefault();



        transform((formData) => {

            const { content_mode, markdown_content_fr, ...payload } = formData;



            return {
                ...payload,
                publication_mode: publicationMode,
                published_at: publicationMode === 'scheduled'
                    ? formData.published_at
                    : '',
                content_fr: buildStoredArticleContent(content_mode, formData.content_fr, markdown_content_fr),
            };

        });



        put(route('dashboard.articles.update', article.id));

    };



    const handleContentModeChange = (nextMode: ArticleContentMode) => {

        if (nextMode === data.content_mode) return;



        if (nextMode === 'markdown' && !data.markdown_content_fr.trim() && hasMeaningfulContent(data.content_fr)) {

            setData('markdown_content_fr', htmlToMarkdown(data.content_fr));

        }



        if (nextMode === 'wysiwyg' && !hasMeaningfulContent(data.content_fr) && data.markdown_content_fr.trim()) {

            setData('content_fr', markdownToHtml(data.markdown_content_fr));

        }



        setData('content_mode', nextMode);

    };



    

    const insertMarkdownImage = (url: string) => {

        const snippet = `![](${url})`;

        const prefix = data.markdown_content_fr && !data.markdown_content_fr.endsWith("\n") ? "\n" : "";

        setData('markdown_content_fr', `${data.markdown_content_fr}${prefix}${snippet}`);

    };

    const handleDelete = () => {

        if (confirm('Supprimer cet article ?')) {

            router.delete(route('dashboard.articles.destroy', article.id));

        }

    };



    return (

        <DashboardLayout title={`Modifier ${article.title_fr}`}>

            <Head title={`Modifier ${article.title_fr}`} />



            <form onSubmit={submit} className="space-y-8">

                                <AdminPageHeader

                    eyebrow="Edition"

                    title="Modifier l'article"

                    subtitle="Ajustez le contenu, la visibilite et la mise en avant sans casser la coherence editoriale."

                    icon={<FileText className="h-6 w-6" />}

                    actions={

                        <>

                            <AdminLinkButton

                                href={route('dashboard.articles.index')}

                                variant="secondary"

                                icon={<ArrowLeft className="h-4 w-4" />}

                            >

                                Retour a la liste

                            </AdminLinkButton>

                            <AdminLinkButton

                                href={route('article.show', article.slug)}

                                as="a"

                                target="_blank"

                                rel="noopener noreferrer"

                                variant="secondary"

                                icon={<Eye className="h-4 w-4" />}

                            >

                                Voir l'article

                            </AdminLinkButton>

                            <AdminButton type="button" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={handleDelete}>

                                Supprimer

                            </AdminButton>

                            <AdminButton type="submit" disabled={processing} icon={<Sparkles className="h-4 w-4" />}>

                                {publicationMode === 'scheduled' ? 'Programmer la mise a jour' : publicationMode === 'now' ? 'Mettre a jour maintenant' : 'Enregistrer brouillon'}

                            </AdminButton>

                        </>

                    }

                />



                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">

                    <div className="space-y-8">

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">

                            <SectionHeader eyebrow="Editorial" title="Structure de l'article" />



                            <div className="grid gap-5">

                                <div>

                                    <InputLabel htmlFor="title_fr" value="Titre principal (FR) *" />

                                    <TextInput

                                        id="title_fr"

                                        className="mt-2 block w-full text-lg font-semibold"

                                        placeholder="Saisissez le titre principal"

                                        value={data.title_fr}

                                        onChange={(event) => setData('title_fr', event.target.value)}

                                        required

                                    />

                                    <InputError message={errors.title_fr} className="mt-2" />

                                </div>



                                <div>

                                    <InputLabel htmlFor="excerpt_fr" value="Extrait (FR) *" />

                                    <textarea

                                        id="excerpt_fr"

                                        rows={4}

                                        className="mt-2 block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"

                                        placeholder="Resume de l'article pour les cartes et apercus"

                                        value={data.excerpt_fr}

                                        onChange={(event) => setData('excerpt_fr', event.target.value)}

                                        required

                                    />

                                    <InputError message={errors.excerpt_fr} className="mt-2" />

                                </div>

                            </div>

                        </section>



                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900 sm:p-7">

                            <SectionHeader eyebrow="Contenu" title="Redaction" />



                            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">

                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                    <div>

                                        <InputLabel htmlFor="content_fr" value="Contenu de l'article *" />

                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">

                                            WYSIWYG et markdown sont disponibles. Le changement de mode conserve chaque brouillon separement.

                                        </p>

                                    </div>



                                    <div className="flex flex-wrap gap-2">

                                        <EditorModeButton

                                            active={data.content_mode === 'wysiwyg'}

                                            icon={<FileText className="h-4 w-4" />}

                                            label="Editeur visuel"

                                            onClick={() => handleContentModeChange('wysiwyg')}

                                        />

                                        <EditorModeButton

                                            active={data.content_mode === 'markdown'}

                                            icon={<Code2 className="h-4 w-4" />}

                                            label="Markdown"

                                            onClick={() => handleContentModeChange('markdown')}

                                        />

                                    </div>

                                </div>

                            </div>



                            {data.content_mode === 'wysiwyg' ? (

                                <div className="mt-5">

                                    <TiptapEditor

                                        value={data.content_fr}

                                        onChange={(content) => setData('content_fr', content)}

                                        placeholder="Mettez a jour le contenu de l'article..."

                                        className="mt-4"

                                    />

                                </div>

                            ) : (

                                <div className="mt-5 space-y-4">

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

                                        {['# Titre', '## Intertitre', '- Liste', '**gras**', '[Lien](https://...)'].map((item) => (

                                            <div key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">

                                                {item}

                                            </div>

                                        ))}

                                    </div>

                                    <div className="flex justify-end">

                                        <MediaLibraryPicker

                                            buttonLabel="Inserer image"

                                            title="Selectionner une image pour le markdown"

                                            onSelect={insertMarkdownImage}

                                        />

                                    </div>

                                    <textarea

                                        id="content_fr"

                                        rows={18}

                                        className="block min-h-[420px] w-full rounded-3xl border border-gray-200 bg-[#fbfbf8] px-5 py-4 font-mono text-sm leading-7 text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-gray-950 dark:text-gray-100"

                                        placeholder="# Votre titre\n\nMettez a jour votre article en markdown..."

                                        value={data.markdown_content_fr}

                                        onChange={(event) => setData('markdown_content_fr', event.target.value)}

                                        required={data.content_mode === 'markdown'}

                                    />

                                    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-gray-600 dark:border-primary/20 dark:bg-primary/10 dark:text-gray-300">

                                        Un article markdown est stocke dans le meme champ puis converti en HTML a l'affichage public. Les anciens articles HTML restent compatibles.

                                    </div>

                                </div>

                            )}



                            <InputError message={errors.content_fr} className="mt-4" />

                        </section>

                    </div>



                    <aside className="space-y-8 xl:sticky xl:top-6 xl:self-start">

                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">

                            <SectionHeader eyebrow="Publication" title="Parametres" />



                            <div className="space-y-5">

                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">

                                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">

                                        <CalendarClock className="h-4 w-4" />

                                        Visibilite

                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-3">

                                        <button

                                            type="button"

                                            onClick={() => setPublicationMode('now')}

                                            className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-colors ${

                                                publicationMode === 'now'

                                                    ? 'border-primary bg-primary text-white shadow-sm'

                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-gray-950 dark:text-white/70'

                                            }`}

                                        >

                                            Maintenant

                                        </button>

                                        <button

                                            type="button"

                                            onClick={() => setPublicationMode('scheduled')}

                                            className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-colors ${

                                                publicationMode === 'scheduled'

                                                    ? 'border-primary bg-primary text-white shadow-sm'

                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-gray-950 dark:text-white/70'

                                            }`}

                                        >

                                            Programmer

                                        </button>

                                        <button

                                            type="button"

                                            onClick={() => setPublicationMode('draft')}

                                            className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-colors ${

                                                publicationMode === 'draft'

                                                    ? 'border-primary bg-primary text-white shadow-sm'

                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-gray-950 dark:text-white/70'

                                            }`}

                                        >

                                            Brouillon

                                        </button>

                                    </div>

                                    {publicationMode === 'scheduled' ? (

                                        <div className="mt-4">

                                            <InputLabel htmlFor="published_at" value="Date de programmation" />

                                            <TextInput

                                                id="published_at"

                                                type="datetime-local"

                                                className="mt-2 block w-full dark:[color-scheme:dark]"

                                                value={data.published_at}

                                                onChange={(event) => setData('published_at', event.target.value)}

                                                min={new Date().toISOString().slice(0, 16)}

                                                required

                                            />

                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Planifiez la publication a la date choisie.</p>

                                            <InputError message={errors.published_at} className="mt-2" />

                                        </div>

                                    ) : publicationMode === 'now' ? (

                                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">L'article sera publie immediatement a l'enregistrement.</p>

                                    ) : (

                                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">L'article restera en brouillon jusqu'a votre prochaine action.</p>

                                    )}

                                </div>



                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">

                                    <label className="flex cursor-pointer items-center gap-3">

                                        <Checkbox

                                            name="is_premium"

                                            checked={data.is_premium}

                                            onChange={(event) => setData('is_premium', event.target.checked)}

                                        />

                                        <div>

                                            <div className="text-sm font-bold text-gray-900 dark:text-white">Article premium</div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">Active un paiement a l'unite.</div>

                                        </div>

                                    </label>



                                    {data.is_premium && (

                                        <div className="mt-4">

                                            <InputLabel htmlFor="price" value="Prix" />

                                            <div className="relative mt-2">

                                                <TextInput

                                                    id="price"

                                                    type="number"

                                                    className="block w-full pr-16"

                                                    placeholder="0"

                                                    value={data.price}

                                                    onChange={(event) => setData('price', event.target.value)}

                                                />

                                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.16em] text-gray-400">

                                                    FCFA

                                                </span>

                                            </div>

                                            <InputError message={errors.price} className="mt-2" />

                                        </div>

                                    )}

                                </div>



                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">

                                    <label className="flex cursor-pointer items-center gap-3">

                                        <Checkbox

                                            name="is_featured"

                                            checked={data.is_featured}

                                            onChange={(event) => setData('is_featured', event.target.checked)}

                                        />

                                        <div>

                                            <div className="text-sm font-bold text-gray-900 dark:text-white">Mettre en avant</div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">Visible dans les zones editoriales fortes.</div>

                                        </div>

                                    </label>



                                    {data.is_featured && (

                                        <div className="mt-4">

                                            <InputLabel htmlFor="featured_until" value="Fin de mise en avant" />

                                            <TextInput

                                                id="featured_until"

                                                type="datetime-local"

                                                className="mt-2 block w-full dark:[color-scheme:dark]"

                                                value={data.featured_until}

                                                onChange={(event) => setData('featured_until', event.target.value)}

                                                min={new Date().toISOString().slice(0, 16)}

                                                required={data.is_featured}

                                            />

                                            <InputError message={errors.featured_until as string} className="mt-2" />

                                        </div>

                                    )}

                                </div>

                            </div>

                        </section>



                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">

                            <SectionHeader eyebrow="Classement" title="Rubriques" />



                            <div className="space-y-5">

                                <div>

                                    <InputLabel htmlFor="categories" value="Categories *" />

                                    <MultiSelect

                                        options={categories.map((category) => ({ value: category.id, label: category.name_fr }))}

                                        selected={data.categories}

                                        onChange={(selected) => setData('categories', selected)}

                                        placeholder="Choisir une ou plusieurs categories"

                                        className="mt-2"

                                    />

                                    <InputError message={errors.categories as string} className="mt-2" />

                                </div>



                                <div>

                                    <InputLabel htmlFor="author_name" value="Signature auteur *" />

                                    <TextInput

                                        id="author_name"

                                        className="mt-2 block w-full"

                                        value={data.author_name}

                                        onChange={(event) => setData('author_name', event.target.value)}

                                        required

                                    />

                                    <InputError message={errors.author_name} className="mt-2" />

                                </div>

                            </div>

                        </section>



                        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-gray-900">

                            <SectionHeader eyebrow="Media" title="Couverture" />

                            <CloudinaryUpload

                                onUpload={(url) => setData('featured_image', url)}

                                defaultImage={data.featured_image}

                                label=""

                                className="w-full"

                            />

                            <InputError message={errors.featured_image} className="mt-2" />

                            <CoverPositionControl

                                imageUrl={data.featured_image}

                                x={Number(data.featured_image_position_x ?? 50)}

                                y={Number(data.featured_image_position_y ?? 50)}

                                onChangeX={(value) => setData('featured_image_position_x', value)}

                                onChangeY={(value) => setData('featured_image_position_y', value)}

                                recommendation="Article: format 16:9 recommande (1600x900), minimum 1200x675."

                            />

                            <InputError message={errors.featured_image_position_x as string} className="mt-2" />

                            <InputError message={errors.featured_image_position_y as string} className="mt-2" />

                        </section>



                        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-5 shadow-[0_18px_40px_-28px_rgba(47,106,17,0.28)] dark:border-primary/15 dark:from-primary/10 dark:to-emerald-500/10">

                            <div className="flex items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">

                                    <Newspaper className="h-5 w-5" />

                                </div>

                                <div>

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">

                                        <Sparkles className="h-3.5 w-3.5" />

                                        Controle editorial

                                    </div>

                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">

                                        Utilisez la vue publique pour verifier le rendu final avant de valider la mise a jour.

                                    </p>

                                </div>

                            </div>

                        </section>

                    </aside>

                </div>

            </form>

        </DashboardLayout>

    );

}



function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {

    return (

        <div className="mb-6 border-b border-gray-200 pb-4 dark:border-white/10">

            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</div>

            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</h2>

        </div>

    );

}



function EditorModeButton({

    active,

    icon,

    label,

    onClick,

}: {

    active: boolean;

    icon: ReactNode;

    label: string;

    onClick: () => void;

}) {

    return (

        <button

            type="button"

            onClick={onClick}

            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${

                active

                    ? 'bg-primary text-white shadow-[0_14px_30px_-18px_rgba(47,106,17,0.75)]'

                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'

            }`}

        >

            {icon}

            {label}

        </button>

    );

}











