import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Slider } from '@/Components/ui/slider'; // Assume you have or will create this, otherwise use native input

// Helper to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
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
  )
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
    const imgRef = useRef<HTMLImageElement>(null);
    const [aspect, setAspect] = useState<number | undefined>(16 / 9);

    // Load image from file
    useState(() => {
        if (imageFile) {
            setCrop(undefined); // Reset crop
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(imageFile);
        }
    });

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    const getCroppedImg = useCallback(async () => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        );

        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
                onOpenChange(false);
            }
        }, 'image/jpeg');
    }, [completedCrop, onCropComplete, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Recadrer l'image</DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 justify-center">
                        <Button variant={aspect === 16/9 ? "default" : "outline"} onClick={() => setAspect(16/9)} size="sm">16:9</Button>
                        <Button variant={aspect === 4/3 ? "default" : "outline"} onClick={() => setAspect(4/3)} size="sm">4:3</Button>
                        <Button variant={aspect === 1 ? "default" : "outline"} onClick={() => setAspect(1)} size="sm">Carré</Button>
                        <Button variant={aspect === undefined ? "default" : "outline"} onClick={() => setAspect(undefined)} size="sm">Libre</Button>
                    </div>

                    <div className="max-h-[60vh] overflow-auto flex justify-center bg-black/5 rounded-lg">
                        {imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-w-full"
                                />
                            </ReactCrop>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={getCroppedImg}>Valider le recadrage</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}