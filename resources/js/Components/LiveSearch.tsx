import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, router } from '@inertiajs/react';
import { ChevronRight, Loader2, Search, Sparkles } from 'lucide-react';
import { Input } from '@/Components/ui/input';

interface LiveSearchProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    image?: string | null;
    author?: string;
    published_human?: string;
    premium?: boolean;
    category?: { name: string } | null;
}

function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string): string {
    if (!text || !query) return text;

    const pattern = new RegExp(`(${escapeRegex(query)})`, 'ig');
    return text.replace(pattern, '<mark class="rounded bg-primary/20 px-0.5 text-primary">$1</mark>');
}

export default function LiveSearch({ className = '', onClose }: LiveSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);

    const hasQuery = query.trim().length >= 2;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const q = query.trim();

        const timeoutId = window.setTimeout(async () => {
            if (q.length < 2) {
                setResults([]);
                setShowResults(false);
                setActiveIndex(-1);
                return;
            }

            setLoading(true);
            setShowResults(true);

            try {
                const response = await axios.get(route('api.search'), {
                    params: { q },
                });
                const payload = Array.isArray(response.data) ? response.data : [];
                setResults(payload);
                setActiveIndex(payload.length > 0 ? 0 : -1);
            } catch {
                setResults([]);
                setActiveIndex(-1);
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => window.clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;

        router.get(route('search.index'), { q });
        setShowResults(false);
        onClose?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showResults || results.length === 0) {
            if (e.key === 'Escape') {
                setShowResults(false);
                onClose?.();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % results.length);
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        }

        if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const selected = results[activeIndex];
            router.visit(`/article/${selected.slug}`);
            setShowResults(false);
            onClose?.();
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setShowResults(false);
            onClose?.();
        }
    };

    const subtitle = useMemo(() => {
        if (!hasQuery) return 'Tapez au moins 2 caracteres';
        if (loading) return 'Recherche en cours...';
        return `${results.length} resultat${results.length > 1 ? 's' : ''}`;
    }, [hasQuery, loading, results.length]);

    return (
        <div ref={searchRef} className={`relative mx-auto w-full max-w-2xl ${className}`}>
            <form onSubmit={handleSearch} className="group relative flex items-center">
                <Search className="pointer-events-none absolute left-4 h-5 w-5 text-white/65 transition-colors group-focus-within:text-primary" />
                <Input
                    type="text"
                    placeholder="Rechercher un article, un auteur, une rubrique..."
                    className="h-12 w-full rounded-full border border-white/15 bg-white/95 pl-12 pr-12 text-base text-gray-900 shadow-lg backdrop-blur-md placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim().length >= 2) {
                            setShowResults(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />

            </form>

            {showResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-500">Recherche live</p>
                        <p className="text-xs font-semibold text-gray-500">{subtitle}</p>
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto py-1.5">
                        {loading ? (
                            <div className="flex items-center justify-center px-4 py-6 text-sm text-gray-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Recherche en cours...
                            </div>
                        ) : results.length > 0 ? (
                            <>
                                {results.map((result, index) => (
                                    <Link
                                        key={result.id}
                                        href={`/article/${result.slug}`}
                                        className={`group block border-b border-gray-100 px-4 py-3 transition-colors last:border-0 ${
                                            index === activeIndex ? 'bg-primary/[0.06]' : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                            setShowResults(false);
                                            onClose?.();
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                                {result.image ? (
                                                    <img
                                                        src={result.image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <img
                                                        src="/images/article-placeholder.svg"
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className="line-clamp-1 text-sm font-bold text-gray-900"
                                                    dangerouslySetInnerHTML={{ __html: highlight(result.title, query.trim()) }}
                                                />
                                                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                                                    {result.excerpt || 'Article de la redaction LE RURAL'}
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-500">
                                                    {result.category?.name && (
                                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{result.category.name}</span>
                                                    )}
                                                    {result.author && <span>{result.author}</span>}
                                                    {result.published_human && <span>{result.published_human}</span>}
                                                    {result.premium && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                                                            <Sparkles className="h-3 w-3" />
                                                            Premium
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    href={route('search.index', { q: query.trim() })}
                                    className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/10"
                                    onClick={() => {
                                        setShowResults(false);
                                        onClose?.();
                                    }}
                                >
                                    Voir tous les resultats
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </>
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-sm font-semibold text-gray-700">Aucun resultat pour "{query.trim()}"</p>
                                <p className="mt-1 text-xs text-gray-500">Essayez un autre mot-cle ou une forme plus courte.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
