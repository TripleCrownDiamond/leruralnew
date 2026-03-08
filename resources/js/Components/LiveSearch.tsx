import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, router } from '@inertiajs/react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

interface LiveSearchProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function LiveSearch({ className = "", isOpen, onClose }: LiveSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                setShowResults(true);
                try {
                    const response = await axios.get(`/api/search?q=${query}`);
                    setResults(response.data);
                } catch (error) {
                    console.error(error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get(route('search.index'), { q: query });
            setShowResults(false);
            if (onClose) onClose();
        }
    };

    return (
        <div ref={searchRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
            <form onSubmit={handleSearch} className="relative flex items-center group">
                <Search className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                    type="search"
                    placeholder="Rechercher un article, un auteur..."
                    className="pl-12 pr-12 h-12 w-full rounded-full bg-white/95 backdrop-blur-md border-transparent shadow-lg text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.length > 2) setShowResults(true);
                    }}
                    autoFocus
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Results Dropdown */}
            {showResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-4 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading ? (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Recherche en cours...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result: any) => (
                                <Link
                                    key={result.slug}
                                    href={`/article/${result.slug}`}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                                    onClick={() => {
                                        setShowResults(false);
                                        if (onClose) onClose();
                                    }}
                                >
                                    {result.image && (
                                        <img 
                                            src={result.image} 
                                            alt="" 
                                            className="h-10 w-10 rounded object-cover shrink-0 bg-muted"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                            {result.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                            {result.excerpt || result.category?.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            <Link
                                href={route('search.index', { q: query })}
                                className="block border-t border-border bg-muted/30 px-4 py-3 text-center text-sm font-medium text-primary hover:bg-muted/50 hover:underline"
                                onClick={() => {
                                    setShowResults(false);
                                    if (onClose) onClose();
                                }}
                            >
                                Voir tous les résultats pour "{query}"
                            </Link>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-sm text-muted-foreground mb-2">Aucun résultat trouvé pour "{query}"</p>
                            <p className="text-xs text-muted-foreground/70">Essayez d'autres mots-clés ou vérifiez l'orthographe.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
