import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import CloudinaryUpload from '@/Components/CloudinaryUpload';
import TiptapEditor from '@/Components/TiptapEditor';
import { FormEventHandler } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MultiSelect from '@/Components/MultiSelect';

interface Category {
    id: number;
    name_fr: string;
}

interface Article {
    id: number;
    title_fr: string;
    title_en?: string;
    excerpt_fr: string;
    excerpt_en?: string;
    content_fr: string;
    content_en?: string;
    featured_image?: string;
    is_premium: boolean;
    price?: number;
    published_at?: string;
    author_name: string;
    category_id: number;
    categories?: { id: number; name_fr: string }[];
    is_featured: boolean;
    featured_until?: string;
}

interface Props {
    article: Article;
    categories: Category[];
}

export default function Edit({ article, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title_fr: article.title_fr,
        title_en: article.title_en || '',
        excerpt_fr: article.excerpt_fr,
        excerpt_en: article.excerpt_en || '',
        content_fr: article.content_fr,
        content_en: article.content_en || '',
        featured_image: article.featured_image || '',
        is_premium: article.is_premium,
        price: article.price || '',
        published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
        author_name: article.author_name,
        categories: article.categories ? article.categories.map(c => c.id) : (article.category_id ? [article.category_id] : []),
        is_featured: article.is_featured,
        featured_until: article.featured_until ? new Date(article.featured_until).toISOString().slice(0, 16) : '',
    });

    const isScheduled = data.published_at && new Date(data.published_at) > new Date();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('dashboard.articles.update', article.id));
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            router.delete(route('dashboard.articles.destroy', article.id));
        }
    };

    return (
        <DashboardLayout title={`Modifier: ${article.title_fr}`}>
            <Head title={`Modifier: ${article.title_fr}`} />

            <form onSubmit={submit}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Modifier l'Article
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mettez à jour votre contenu
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={route('dashboard.articles.index')}>Annuler</Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                        </Button>
                        <PrimaryButton disabled={processing}>
                            {isScheduled ? 'Programmer la mise à jour' : 'Mettre à jour'}
                        </PrimaryButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
                            {/* Titles */}
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="title_fr" value="Titre Principal (FR) *" className="text-base" />
                                    <TextInput
                                        id="title_fr"
                                        className="mt-1 block w-full text-lg font-medium"
                                        placeholder="Saisissez le titre en français"
                                        value={data.title_fr}
                                        onChange={(e) => setData('title_fr', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title_fr} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="title_en" value="Titre (EN)" />
                                    <TextInput
                                        id="title_en"
                                        className="mt-1 block w-full"
                                        placeholder="Enter title in English (optional)"
                                        value={data.title_en}
                                        onChange={(e) => setData('title_en', e.target.value)}
                                    />
                                    <InputError message={errors.title_en} className="mt-2" />
                                </div>
                            </div>

                            {/* Content FR */}
                            <div>
                                <InputLabel htmlFor="content_fr" value="Contenu (FR) *" className="text-base mb-2" />
                                <TiptapEditor
                                    value={data.content_fr}
                                    onChange={(content) => setData('content_fr', content)}
                                    placeholder="Rédigez votre article en français..."
                                    className="min-h-[400px]"
                                />
                                <InputError message={errors.content_fr} className="mt-2" />
                            </div>

                            {/* Content EN */}
                            <div>
                                <InputLabel htmlFor="content_en" value="Contenu (EN)" className="text-base mb-2" />
                                <TiptapEditor
                                    value={data.content_en}
                                    onChange={(content) => setData('content_en', content)}
                                    placeholder="Write your article in English..."
                                    className="min-h-[400px]"
                                />
                                <InputError message={errors.content_en} className="mt-2" />
                            </div>

                            {/* Excerpts */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <InputLabel htmlFor="excerpt_fr" value="Extrait (FR) *" />
                                    <textarea
                                        id="excerpt_fr"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        rows={3}
                                        placeholder="Bref résumé pour les cartes d'aperçu..."
                                        value={data.excerpt_fr}
                                        onChange={(e) => setData('excerpt_fr', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.excerpt_fr} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="excerpt_en" value="Extrait (EN)" />
                                    <textarea
                                        id="excerpt_en"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        rows={3}
                                        placeholder="Short summary for preview cards..."
                                        value={data.excerpt_en}
                                        onChange={(e) => setData('excerpt_en', e.target.value)}
                                    />
                                    <InputError message={errors.excerpt_en} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">
                        {/* Status & Visibility */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Publication
                            </h3>
                            
                            <div>
                                <InputLabel htmlFor="published_at" value="Date de publication" />
                                <TextInput
                                    id="published_at"
                                    type="datetime-local"
                                    className="mt-1 block w-full dark:[color-scheme:dark]"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Laisser vide pour brouillon</p>
                                <InputError message={errors.published_at} className="mt-2" />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                    <Checkbox
                                        name="is_premium"
                                        checked={data.is_premium}
                                        onChange={(e) => setData('is_premium', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Article Payant</span>
                                </label>
                            </div>

                            {data.is_premium && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <InputLabel htmlFor="price" value="Prix de l'article" />
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <TextInput
                                            id="price"
                                            type="number"
                                            className="block w-full pr-12"
                                            placeholder="0.00"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm font-medium">FCFA</span>
                                        </div>
                                    </div>
                                    <InputError message={errors.price} className="mt-2" />
                                </div>
                            )}
                            {/* Featured (A la une) */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                    <Checkbox
                                        name="is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Mettre à la une</span>
                                </label>
                            </div>

                            {data.is_featured && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
                                    <InputLabel htmlFor="featured_until" value="À la une jusqu'au" />
                                    <TextInput
                                        id="featured_until"
                                        type="datetime-local"
                                        className="mt-1 block w-full dark:[color-scheme:dark]"
                                        value={data.featured_until}
                                        onChange={(e) => setData('featured_until', e.target.value)}
                                        required={data.is_featured}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">L'article sera retiré de la une après cette date.</p>
                                    <InputError message={errors.featured_until as string} className="mt-2" />
                                </div>
                            )}
                        </div>

                        {/* Taxonomy */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Classification
                            </h3>
                            
                            <div>
                                <InputLabel htmlFor="categories" value="Catégorie(s) *" />
                                <MultiSelect
                                    options={categories.map(c => ({ value: c.id, label: c.name_fr }))}
                                    selected={data.categories}
                                    onChange={(selected) => setData('categories', selected)}
                                    placeholder="Choisir des catégories..."
                                    className="mt-1"
                                />
                                <InputError message={errors.categories as string} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="author_name" value="Auteur *" />
                                <TextInput
                                    id="author_name"
                                    className="mt-1 block w-full"
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.author_name} className="mt-2" />
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Image de couverture
                            </h3>
                            
                            <div>
                                <CloudinaryUpload
                                    onUpload={(url) => setData('featured_image', url)}
                                    defaultImage={data.featured_image}
                                    label=""
                                    className="w-full"
                                />
                                <InputError message={errors.featured_image} className="mt-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
