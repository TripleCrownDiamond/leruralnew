import React, { useState, useRef, createContext, useContext } from 'react';
import { usePage } from '@inertiajs/react';
import { Upload, X, Loader2, ExternalLink, Edit } from 'lucide-react';
import { PageProps } from '@/types';

// Context pour partager les publicités entre composants
const AdvertisementContext = createContext<{
    advertisements: Record<string, any>;
    setAdvertisement: (locationId: string, ad: any) => void;
    removeAdvertisement: (locationId: string) => void;
}>({
    advertisements: {},
    setAdvertisement: () => {},
    removeAdvertisement: () => {}
});

// Provider pour le contexte
export const AdvertisementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [advertisements, setAdvertisements] = useState<Record<string, any>>({});

    const setAdvertisement = (locationId: string, ad: any) => {
        setAdvertisements(prev => ({ ...prev, [locationId]: ad }));
    };

    const removeAdvertisement = (locationId: string) => {
        setAdvertisements(prev => {
            const newAds = { ...prev };
            delete newAds[locationId];
            return newAds;
        });
    };

    return (
        <AdvertisementContext.Provider value={{ advertisements, setAdvertisement, removeAdvertisement }}>
            {children}
        </AdvertisementContext.Provider>
    );
};

// Hook pour utiliser le contexte
const useAdvertisements = () => useContext(AdvertisementContext);

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
    
    // Utiliser le contexte React au lieu du localStorage
    const { advertisements, setAdvertisement, removeAdvertisement } = useAdvertisements();
    const advertisement = advertisements[locationId] || null;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        image_url: advertisement?.image_url || '',
        redirect_url: advertisement?.redirect_url || '',
        title: advertisement?.title || '',
        description: advertisement?.description || ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Vérifier si le localStorage est disponible (pour le warning)
    const [storageWarning, setStorageWarning] = useState(false);

    React.useEffect(() => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            setStorageWarning(false);
        } catch (error) {
            setStorageWarning(true);
            console.warn('LocalStorage bloqué par le navigateur');
        }
    }, []);

    // Mettre à jour le formulaire quand la publicité change
    React.useEffect(() => {
        if (advertisement) {
            setEditForm({
                image_url: advertisement.image_url || '',
                redirect_url: advertisement.redirect_url || '',
                title: advertisement.title || '',
                description: advertisement.description || ''
            });
        }
    }, [advertisement]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            // Pour l'instant, utilisons une URL de placeholder
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setEditForm(prev => ({ ...prev, image_url: dataUrl }));
                setLoading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setError('Erreur lecture fichier');
            setLoading(false);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setError(null);

        try {
            const newAdvertisement = {
                location_id: locationId,
                ...editForm,
                is_active: true,
                updated_at: new Date().toISOString()
            };

            // Sauvegarder avec le contexte React (pas de localStorage)
            setAdvertisement(locationId, newAdvertisement);
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Erreur sauvegarde');
            setLoading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!confirm('Supprimer cette publicité ?')) return;

        setLoading(true);
        try {
            // Supprimer avec le contexte React
            removeAdvertisement(locationId);
            setEditForm({
                image_url: '',
                redirect_url: '',
                title: '',
                description: ''
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Erreur suppression');
            setLoading(false);
        }
    };

    return (
        <div 
            className={`group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 transition-all ${className} ${
                isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-gray-900' : ''
            }`}
            style={{ width: width, height: height }}
            onClick={() => isAdmin && !isEditing && setIsEditing(true)}
        >
            {advertisement ? (
                <>
                    {/* Mode affichage normal */}
                    {!isEditing ? (
                        <>
                            <img 
                                src={advertisement.image_url} 
                                alt={advertisement.title || label} 
                                className="h-full w-full object-cover"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (advertisement.redirect_url) {
                                        window.open(advertisement.redirect_url, '_blank');
                                    }
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700';
                                        placeholder.innerHTML = `
                                            <div class="text-center">
                                                <div class="text-4xl mb-2">📢</div>
                                                <div class="text-sm text-gray-500 dark:text-gray-400">Publicité</div>
                                                <div class="text-xs text-gray-400 dark:text-gray-500">${width}x${height}</div>
                                            </div>
                                        `;
                                        parent.appendChild(placeholder);
                                    }
                                }}
                            />
                            
                            {/* Overlay admin avec actions */}
                            {isAdmin && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="flex flex-col items-center gap-2 text-white">
                                        <span className="text-xs font-bold uppercase tracking-wider">{width}x{height}</span>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold">
                                                <Edit className="h-3 w-3" /> Modifier
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(e);
                                                }}
                                                className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold hover:bg-red-700"
                                            >
                                                <X className="h-3 w-3" /> Supprimer
                                            </button>
                                        </div>
                                        
                                        {/* Afficher le lien si défini */}
                                        {advertisement.redirect_url && (
                                            <div className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">
                                                <ExternalLink className="h-3 w-3" /> 
                                                <span className="ml-1">Lien actif</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Mode édition */
                        <div className="p-4 h-full w-full overflow-y-auto bg-white dark:bg-gray-900">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Modifier la publicité ({width}x{height})
                                </h3>
                                
                                {/* Upload image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Image de la publicité
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {editForm.image_url && (
                                            <div className="relative">
                                                <img 
                                                    src={editForm.image_url} 
                                                    alt="Preview" 
                                                    className="h-16 w-16 object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm(prev => ({ ...prev, image_url: '' }))}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {editForm.image_url ? 'Changer l\'image' : 'Uploader une image'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Lien optionnel */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Lien de redirection (optionnel)
                                    </label>
                                    <input
                                        type="url"
                                        value={editForm.redirect_url}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, redirect_url: e.target.value }))}
                                        placeholder="https://exemple.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Les utilisateurs seront redirigés vers ce lien en cliquant sur la publicité
                                    </p>
                                </div>
                                
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Titre (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Titre de la publicité"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (optionnelle)
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Description de la publicité"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                
                                {/* Boutons d'action */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Sauvegarder
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Mode vide */
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
                            Ajouter une publicité
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
            
            {/* Storage Warning */}
            {storageWarning && isAdmin && (
                <div className="absolute top-2 left-0 right-0 text-center">
                    <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <span>⚠️</span>
                        <span>Stockage bloqué - Désactivez Tracking Prevention</span>
                    </div>
                </div>
            )}
            
            {/* Error Message */}
            {error && isAdmin && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-red-500">
                    {error}
                </div>
            )}

            {/* Hidden Input */}
            {!isEditing && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()} 
                />
            )}
        </div>
    );
}
