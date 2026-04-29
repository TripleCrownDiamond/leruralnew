import { Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
}

export default function MediaLibraryPicker({
    onSelect,
    kind = 'image',
    buttonLabel = 'Mediatheque',
    title = 'Selectionner un media',
    className = '',
}: MediaLibraryPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<MediaItem[]>([]);

    const portalTarget = useMemo(() => (typeof document !== 'undefined' ? document.body : null), []);

    const loadLibrary = async (term = '') => {
        setLoading(true);
        try {
            const url = `${route('dashboard.media.library', undefined, false)}?kind=${encodeURIComponent(kind)}&search=${encodeURIComponent(term)}`;
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const payload = await response.json().catch(() => ({}));
            setAssets(Array.isArray(payload?.data) ? payload.data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            void loadLibrary(search);
        }
    }, [open]);

    const modal = open && portalTarget ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
            <div
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.14em] text-gray-900 dark:text-gray-100">{title}</h3>
                    <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Fermer</button>
                </div>

                <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
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
                            placeholder="Rechercher un media..."
                            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-800 dark:border-white/15 dark:bg-gray-950 dark:text-gray-100"
                        />
                    </div>
                    <button type="button" onClick={() => void loadLibrary(search)} className="rounded-xl border border-gray-300 px-3 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Rechercher</button>
                </div>

                <div className="grid flex-1 gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Chargement...
                        </div>
                    ) : assets.length === 0 ? (
                        <p className="col-span-full text-sm text-gray-500 dark:text-gray-300">Aucun media trouve.</p>
                    ) : (
                        assets.map((asset) => (
                            <button
                                key={asset.id}
                                type="button"
                                onClick={() => {
                                    onSelect(asset.url);
                                    setOpen(false);
                                }}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 text-left hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.03]"
                            >
                                <div className="aspect-[16/10] bg-gray-200 dark:bg-white/10">
                                    {asset.kind === 'image' || asset.mime_type?.startsWith('image/') ? (
                                        <img src={asset.url} alt={asset.original_name} className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-300">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="line-clamp-1 text-xs font-semibold text-gray-800 dark:text-gray-100">{asset.original_name}</p>
                                    <p className="mt-1 text-[11px] text-primary">Cliquer pour selectionner</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>,
        portalTarget,
    ) : null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 hover:border-primary hover:text-primary dark:border-white/20 dark:text-gray-200 ${className}`}
            >
                <ImageIcon className="h-3.5 w-3.5" />
                {buttonLabel}
            </button>
            {modal}
        </>
    );
}
