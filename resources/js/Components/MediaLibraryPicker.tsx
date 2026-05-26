import ImageWithFallback from '@/Components/ImageWithFallback';
import { appendCsrfToFormData, getCsrfHeaders, handleCsrfError, isCsrfError, refreshCsrfCookie } from '@/lib/csrf';
import { Check, Image as ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

interface MediaItem {
    id: number;
    original_name: string;
    url: string;
    kind: string;
    mime_type: string;
    created_at: string;
}

interface MediaLibraryPickerProps {
    onSelect: (url: string) => void;
    kind?: 'all' | 'image' | 'video' | 'document';
    buttonLabel?: string;
    title?: string;
    className?: string;
    iconOnly?: boolean;
}

export default function MediaLibraryPicker({
    onSelect,
    kind = 'image',
    buttonLabel = 'Mediatheque',
    title = 'Selectionner un media',
    className = '',
    iconOnly = false,
}: MediaLibraryPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<MediaItem[]>([]);
    const [tab, setTab] = useState<'library' | 'upload'>('library');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const portalTarget = useMemo(() => (typeof document !== 'undefined' ? document.body : null), []);

    const loadLibrary = async (term = '') => {
        setLoading(true);
        setUploadError(null);

        try {
            const url = `${route('dashboard.media.library', undefined, false)}?kind=${encodeURIComponent(kind)}&search=${encodeURIComponent(term)}`;
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Erreur chargement mediatheque (${response.status})`);
            }

            const payload = await response.json().catch(() => ({}));
            setAssets(Array.isArray(payload?.data) ? payload.data : []);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur chargement mediatheque';
            setUploadError(message);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        if (tab === 'library') {
            void loadLibrary(search);
        }
    }, [open, tab]);

    const performUpload = async (file: File) => {
        if (kind === 'image' && !file.type.startsWith('image/')) {
            setUploadError('Veuillez choisir une image valide.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        const createFormData = () => {
            const formData = new FormData();
            formData.append('file', file);
            appendCsrfToFormData(formData);
            return formData;
        };

        const executeUpload = (formData: FormData) => {
            return fetch(route('dashboard.media.store', undefined, false), {
                method: 'POST',
                headers: getCsrfHeaders(),
                body: formData,
                credentials: 'same-origin',
            });
        };

        try {
            let response = await executeUpload(createFormData());

            if (isCsrfError(response.status)) {
                await refreshCsrfCookie();
                response = await executeUpload(createFormData());

                if (isCsrfError(response.status)) {
                    handleCsrfError();
                    return;
                }
            }

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || 'Erreur pendant le televersement');
            }

            const url = payload?.asset?.url || payload?.url;
            if (!url) {
                throw new Error('URL media introuvable apres televersement');
            }

            setSelectedUrl(url);
            onSelect(url);
            setOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur pendant le televersement';
            setUploadError(message);
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    };

    const handleSelect = (asset: MediaItem) => {
        setSelectedUrl(asset.url);
        onSelect(asset.url);
        setOpen(false);
    };

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        void performUpload(file);
        event.target.value = '';
    };

    const modal = open && portalTarget ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
            <div
                className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-900"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.14em] text-gray-900 dark:text-gray-100">{title}</h3>
                    <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Fermer</button>
                </div>

                <div className="mb-4 inline-flex w-fit rounded-full border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-gray-950">
                    <button
                        type="button"
                        onClick={() => setTab('library')}
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${tab === 'library' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                        Mediatheque
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('upload')}
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${tab === 'upload' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                        Televerser
                    </button>
                </div>

                {tab === 'library' ? (
                    <>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-300" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            void loadLibrary(search);
                                        }
                                    }}
                                    placeholder="Rechercher une image..."
                                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-800 dark:border-white/15 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>
                            <button type="button" onClick={() => void loadLibrary(search)} className="rounded-xl border border-gray-300 px-3 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Rechercher</button>
                        </div>

                        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-black/20">
                            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Chargement...
                                    </div>
                                ) : assets.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-300">Aucune image trouvee.</p>
                                ) : (
                                    assets.map((asset) => {
                                        const isSelected = selectedUrl === asset.url;

                                        return (
                                            <button
                                                key={asset.id}
                                                type="button"
                                                onClick={() => handleSelect(asset)}
                                                className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 dark:bg-primary/15'
                                                        : 'border-gray-200 bg-white hover:border-primary/40 dark:border-white/20 dark:bg-gray-950'
                                                }`}
                                            >
                                                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                                                    {(asset.kind === 'image' || asset.mime_type?.startsWith('image/')) ? (
                                                        <ImageWithFallback
                                                            src={asset.url}
                                                            alt={asset.original_name}
                                                            fallbackSrc="/images/article-placeholder.svg"
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-300">
                                                            <ImageIcon className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{asset.original_name || 'Media sans nom'}</p>
                                                    <p className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-300">{asset.url}</p>
                                                </div>

                                                {isSelected ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
                                                        <Check className="h-3 w-3" /> Choisie
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">Choisir</span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={kind === 'image' ? 'image/*' : '*/*'}
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        <div
                            className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                                dragActive
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-white/20 dark:bg-gray-950 dark:hover:bg-gray-900'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                setDragActive(false);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDragActive(false);
                                const file = event.dataTransfer.files?.[0];
                                if (file) {
                                    void performUpload(file);
                                }
                            }}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Televersement en cours...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-300" />
                                    <p className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Cliquez pour televerser</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-300">ou glissez-deposez votre fichier</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {uploadError ? <p className="mt-3 text-xs text-red-500">{uploadError}</p> : null}
            </div>
        </div>,
        portalTarget,
    ) : null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={buttonLabel}
                className={iconOnly
                    ? `rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 ${className}`
                    : `inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 hover:border-primary hover:text-primary dark:border-white/20 dark:text-gray-200 ${className}`}
            >
                <ImageIcon className={iconOnly ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
                {iconOnly ? null : buttonLabel}
            </button>
            {modal}
        </>
    );
}

