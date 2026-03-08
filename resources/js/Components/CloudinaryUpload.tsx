import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import SecondaryButton from './SecondaryButton';

interface CloudinaryUploadProps {
    onUpload: (url: string) => void;
    defaultImage?: string;
    label?: string;
    className?: string;
}

// Configuration Cloudinary
// Note: Dans une application réelle, ces valeurs devraient être dans des variables d'environnement
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=lerural
// NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=lerural
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lerural'; 
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lerural';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

export default function CloudinaryUpload({ 
    onUpload, 
    defaultImage, 
    label = "Image", 
    className = "" 
}: CloudinaryUploadProps) {
    const [image, setImage] = useState<string | null>(defaultImage || null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Compression failed'));
                            }
                        }, 'image/jpeg', 0.8); // Compress to JPEG with 80% quality
                    } else {
                        reject(new Error('Canvas context not available'));
                    }
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Le fichier doit être une image.');
            return;
        }

        // Reset states
        setError(null);
        setLoading(true);
        setProgress(0);

        // Preview local (before compression)
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            // Compress image
            const compressedBlob = await compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', UPLOAD_PRESET);
            if (API_KEY) {
                formData.append('api_key', API_KEY);
            }
            
            // Create XHR to track progress
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onUpload(response.secure_url);
                    setImage(response.secure_url);
                    setLoading(false);
                } else {
                    console.error('Upload error details:', xhr.responseText);
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        setError(`Erreur Cloudinary: ${errorResponse.error?.message || 'Erreur inconnue'}`);
                    } catch (e) {
                        setError(`Erreur lors de l'upload (${xhr.status}). Vérifiez la console.`);
                    }
                    setLoading(false);
                }
            };

            xhr.onerror = () => {
                setError('Erreur réseau lors de l\'upload.');
                setLoading(false);
            };

            xhr.send(formData);
        } catch (err) {
            console.error('Compression or Upload exception:', err);
            setError('Une erreur est survenue lors du traitement de l\'image.');
            setLoading(false);
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handleRemove = () => {
        setImage(null);
        onUpload(''); // Clear URL in parent
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div 
                className={`relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed transition-colors ${
                    error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : 
                    image ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/10' :
                    'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {image ? (
                    <div className="relative w-full h-full p-2">
                        <img 
                            src={image} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-md"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm hover:bg-white hover:text-red-500 focus:outline-none transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mb-3 h-8 w-8 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG ou GIF (MAX. 5Mo)
                        </p>
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg backdrop-blur-sm z-10">
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-indigo-500" />
                        <span className="text-sm font-medium text-indigo-500">{progress}%</span>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            
            {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
        </div>
    );
}
