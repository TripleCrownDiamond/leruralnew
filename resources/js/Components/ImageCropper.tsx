import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { AdminButton } from '@/Components/Dashboard/AdminButton';

function centerAspect(mediaWidth: number, mediaHeight: number, aspect: number | undefined) {
    if (!aspect) {
        return {
            unit: '%',
            x: 5,
            y: 5,
            width: 90,
            height: 90,
        } as Crop;
    }

    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

interface ImageCropperProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageFile: File | null;
    onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropper({ open, onOpenChange, imageFile, onCropComplete }: ImageCropperProps) {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(16 / 9);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imageFile) {
            setImgSrc('');
            setPreviewUrl(null);
            setCrop(undefined);
            setCompletedCrop(undefined);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImgSrc(String(reader.result || ''));
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const getCroppedBlob = useCallback(async (): Promise<Blob | null> => {
        if (!completedCrop || !imgRef.current) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = Math.max(1, Math.floor(completedCrop.width * scaleX));
        canvas.height = Math.max(1, Math.floor(completedCrop.height * scaleY));

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob ?? null), 'image/jpeg', 0.92);
        });
    }, [completedCrop]);

    useEffect(() => {
        let cancelled = false;

        const buildPreview = async () => {
            const blob = await getCroppedBlob();
            if (cancelled) return;

            if (!blob) {
                setPreviewUrl(null);
                return;
            }

            setPreviewUrl((old) => {
                if (old) URL.revokeObjectURL(old);
                return URL.createObjectURL(blob);
            });
        };

        void buildPreview();

        return () => {
            cancelled = true;
        };
    }, [getCroppedBlob]);

    const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspect(width, height, aspect));
    };

    const applyCrop = async () => {
        const blob = await getCroppedBlob();
        if (!blob) return;

        setIsApplying(true);
        try {
            onCropComplete(blob);
            onOpenChange(false);
        } finally {
            setIsApplying(false);
        }
    };

    const ratios = useMemo(
        () => [
            { label: '16:9', value: 16 / 9 },
            { label: '4:3', value: 4 / 3 },
            { label: '1:1', value: 1 },
            { label: 'Libre', value: undefined },
        ],
        [],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
                        Recadrage de l'image
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {ratios.map((item) => {
                            const active = item.value === aspect;
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => setAspect(item.value)}
                                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                                        active
                                            ? 'bg-gradient-to-br from-primary to-emerald-700 text-white shadow-md shadow-primary/30'
                                            : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white/70'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px]">
                        <div className="overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                            {imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(nextCrop) => setCrop(nextCrop)}
                                    onComplete={(next) => setCompletedCrop(next)}
                                    aspect={aspect}
                                    keepSelection
                                >
                                    <img
                                        ref={imgRef}
                                        src={imgSrc}
                                        alt="Recadrage"
                                        onLoad={onImageLoad}
                                        className="max-h-[24vh] sm:max-h-[30vh] md:max-h-[34vh] max-w-full object-contain"
                                    />
                                </ReactCrop>
                            )}
                        </div>

                        <aside className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Apercu</p>
                            <div className="mt-2 flex min-h-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-900/40">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Apercu recadre" className="max-h-12 max-w-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-400">Selectionnez une zone</span>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>

                <DialogFooter>
                    <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                        Annuler
                    </AdminButton>
                    <AdminButton type="button" onClick={applyCrop} disabled={!completedCrop || isApplying}>
                        {isApplying ? 'Insertion...' : 'Valider et inserer'}
                    </AdminButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


