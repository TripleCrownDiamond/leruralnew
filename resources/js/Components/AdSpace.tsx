import { useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Upload, X, Loader2 } from 'lucide-react';
import { PageProps } from '@/types';

// Configuration Cloudinary (Identique à CloudinaryUpload.tsx)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lerural'; 
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lerural';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

interface AdSpaceProps {
    width: number | string;
    height: number | string;
    className?: string;
    label?: string;
    locationId: string; // Identifiant unique de l'emplacement (ex: 'home_sidebar_top')
}

export default function AdSpace({ width, height, className = "", label = "Publicité", locationId }: AdSpaceProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user?.role === 'admin';
    
    // Simuler la récupération de l'image depuis une prop ou un store (à implémenter réellement avec backend)
    // Pour l'instant on utilise le localStorage pour la démo, ou une image par défaut
    const [image, setImage] = useState<string | null>(() => {
        return localStorage.getItem(`ad_${locationId}`) || null;
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        if (API_KEY) {
            formData.append('api_key', API_KEY);
        }

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const url = response.secure_url;
                    
                    // Sauvegarder l'URL (ici localStorage, normalement appel API backend pour persister en DB)
                    localStorage.setItem(`ad_${locationId}`, url);
                    setImage(url);
                    setLoading(false);
                } else {
                    console.error('Upload error:', xhr.responseText);
                    setError('Erreur upload');
                    setLoading(false);
                }
            };

            xhr.onerror = () => {
                setError('Erreur réseau');
                setLoading(false);
            };

            xhr.send(formData);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Supprimer cette publicité ?')) {
            localStorage.removeItem(`ad_${locationId}`);
            setImage(null);
        }
    };

    return (
        <div 
            className={`group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 transition-all ${className} ${
                isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-gray-900' : ''
            }`}
            style={{ width: width, height: height }}
            onClick={() => isAdmin && fileInputRef.current?.click()}
        >
            {image ? (
                <>
                    <img 
                        src={image} 
                        alt={label} 
                        className="h-full w-full object-cover"
                    />
                    {isAdmin && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex flex-col items-center gap-2 text-white">
                                <span className="text-xs font-bold uppercase tracking-wider">{width}x{height}</span>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold">
                                        <Upload className="h-3 w-3" /> Modifier
                                    </span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImage(null);
                                            localStorage.removeItem(`ad_${locationId}`);
                                        }}
                                        className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold hover:bg-red-700"
                                    >
                                        <X className="h-3 w-3" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 text-center text-gray-400 dark:border-gray-700">
                    <span className="mb-2 text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        {label || 'Espace Publicitaire'}
                    </span>
                    <div className="mb-4 flex items-center justify-center rounded bg-gray-200 px-3 py-1 font-mono text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {width}px <span className="mx-1 text-gray-400">×</span> {height}px
                    </div>
                    {isAdmin && (
                        <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                            <Upload className="h-3.5 w-3.5" />
                            Ajouter une image
                        </span>
                    )}
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            
            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()} 
            />
            
            {error && isAdmin && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
}
