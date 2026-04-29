import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Check, Loader2, Search, Upload, X } from 'lucide-react';

interface MediaItem {
    id: number;
    original_name: string;
    url: string;
    kind: string;
    mime_type: string;
    created_at: string;
}

type CsrfHeader = 'X-CSRF-TOKEN' | 'X-XSRF-TOKEN' | null;

interface CloudinaryUploadProps {
    onUpload: (url: string) => void;
    defaultImage?: string;
    label?: string;
    className?: string;
}

export default function CloudinaryUpload({
    onUpload,
    defaultImage,
    label = 'Image',
    className = '',
}: CloudinaryUploadProps) {
    const [image, setImage] = useState<string | null>(defaultImage || null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'upload' | 'library'>('upload');
    const [search, setSearch] = useState('');
    const [assets, setAssets] = useState<MediaItem[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [selectedAssetUrl, setSelectedAssetUrl] = useState<string | null>(defaultImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressTimerRef = useRef<number | null>(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        setImage(defaultImage || null);
        setSelectedAssetUrl(defaultImage || null);
    }, [defaultImage]);

    const resolveCsrfToken = (): { header: CsrfHeader; token: string } => {
        if (typeof document === 'undefined') return { header: null, token: '' }; 

        const metaToken = document.querySelector("meta[name='csrf-token']")?.getAttribute('content') ?? '';
        if (metaToken) {
            return { header: 'X-CSRF-TOKEN' as const, token: metaToken };
        }

        const cookieMatch = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
        return cookieMatch
            ? { header: 'X-XSRF-TOKEN' as const, token: decodeURIComponent(cookieMatch[1]) }
            : { header: null, token: '' };
    };

    const stopProgressTicker = () => {
        if (progressTimerRef.current !== null) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    };

    useEffect(() => () => stopProgressTicker(), []);

    const startProgressTicker = () => {
        stopProgressTicker();

        progressTimerRef.current = window.setInterval(() => {
            if (!loadingRef.current) {
                return;
            }

            setProgress((current) => {
                if (current >= 92) {
                    return current;
                }

                const step = current < 20 ? 2 : current < 50 ? 3 : 1;
                return Math.min(92, current + step);
            });
        }, 180);
    };

    const loadLibrary = async (term = '') => {
        setLoadingLibrary(true);
        setError(null);

        try {
            const base = route('dashboard.media.library', undefined, false);
            const url = `${base}?kind=image&search=${encodeURIComponent(term)}`;
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Erreur chargement mediatheque (${response.status})`);
            }

            const payload = await response.json();
            const items = Array.isArray(payload?.data) ? payload.data : [];
            setAssets(items as MediaItem[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur chargement mediatheque');
        } finally {
            setLoadingLibrary(false);
        }
    };

    useEffect(() => {
        if (tab === 'library') {
            void loadLibrary(search);
        }
    }, [tab]);

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Le fichier doit etre une image.');
            return;
        }

        setError(null);
        setProgress(1);
        setLoading(true);
        loadingRef.current = true;
        startProgressTicker();

        const localPreview = URL.createObjectURL(file);
        setImage(localPreview);

        const uploadUrl = route('dashboard.media.store', undefined, false);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const payload = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', uploadUrl, true);
                xhr.responseType = 'json';
                xhr.withCredentials = true;
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                const csrf = resolveCsrfToken();
                if (csrf.header) {
                    xhr.setRequestHeader(csrf.header, csrf.token);
                }

                xhr.upload.onprogress = (event) => {
                    if (!event.lengthComputable) {
                        return;
                    }

                    const pct = Math.max(1, Math.min(95, Math.round((event.loaded / event.total) * 100)));
                    setProgress(pct);
                };

                xhr.onload = () => {
                    const status = xhr.status ?? 0;
                    if (status < 200 || status >= 300) {
                        const message = xhr.response?.message || `Erreur upload (${status})`;
                        reject(new Error(message));
                        return;
                    }

                    resolve(xhr.response ?? {});
                };

                xhr.onerror = () => reject(new Error('Erreur upload'));
                xhr.send(formData);
            });

            const url = payload?.asset?.url || payload?.url;

            if (!url) {
                throw new Error('Lien media introuvable apres upload.');
            }

            onUpload(url);
            setImage(url);
            setSelectedAssetUrl(url);
            setProgress(100);

            if (tab === 'library') {
                void loadLibrary(search);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur upload');
            setImage(defaultImage || null);
        } finally {
            setTimeout(() => {
                loadingRef.current = false;
                stopProgressTicker();
                setLoading(false);
                setProgress(0);
            }, 250);
            setTimeout(() => URL.revokeObjectURL(localPreview), 2000);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            void processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        void processFile(file);
    };

    const handleRemove = () => {
        setImage(null);
        setSelectedAssetUrl(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100">{label}</label>}

            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-white/20 dark:bg-gray-950">
                <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${tab === 'upload' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    Televerser
                </button>
                <button
                    type="button"
                    onClick={() => setTab('library')}
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${tab === 'library' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    Mediatheque
                </button>
            </div>

            {tab === 'upload' ? (
                <div
                    className={`relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                        error
                            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
                            : image
                                ? 'border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-white/20 dark:bg-gray-900 dark:hover:bg-gray-800'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {image ? (
                        <div className="relative h-full w-full p-2">
                            <img src={image} alt="Preview" className="h-full w-full rounded-md object-contain" />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-white hover:text-red-500 dark:bg-gray-950/90 dark:text-gray-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex cursor-pointer flex-col items-center justify-center pt-5 pb-6" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-300" />
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-200">
                                <span className="font-semibold">Cliquez pour televerser</span> ou glissez-deposez
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-300">JPG, PNG, WEBP (MAX. 25Mo)</p>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/85">
                            <div className="flex items-center justify-between gap-3 text-xs font-bold text-primary">
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Televersement en cours
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                <div className="h-full rounded-full bg-primary transition-all duration-200 ease-out" style={{ width: `${Math.max(5, progress)}%` }} />
                            </div>
                        </div>
                    )}

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
            ) : (
                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/20 dark:bg-gray-950">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    void loadLibrary(search);
                                }
                            }}
                            placeholder="Rechercher une image..."
                            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-800 dark:border-white/20 dark:bg-black dark:text-gray-100"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadLibrary(search)}
                        className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/30 dark:text-gray-100"
                    >
                        Rechercher
                    </button>

                    <div className="max-h-64 space-y-2 overflow-y-auto">
                        {loadingLibrary ? (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-200">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Chargement...
                            </div>
                        ) : assets.length > 0 ? (
                            assets.map((asset) => {
                                const selected = selectedAssetUrl === asset.url;

                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => {
                                            setImage(asset.url);
                                            setSelectedAssetUrl(asset.url);
                                            onUpload(asset.url);
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                                            selected
                                                ? 'border-primary bg-primary/10 dark:bg-primary/15'
                                                : 'border-gray-200 bg-white hover:border-primary/40 dark:border-white/20 dark:bg-black'
                                        }`}
                                    >
                                        <img src={asset.url} alt={asset.original_name} className="h-12 w-12 rounded-md object-cover" loading="lazy" />
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-xs font-semibold text-gray-800 dark:text-gray-100">{asset.original_name}</p>
                                            <p className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-300">{asset.url}</p>
                                        </div>
                                        {selected ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
                                                <Check className="h-3 w-3" />
                                                Choisie
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">Selectionner</span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-300">Aucune image trouvee.</p>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
