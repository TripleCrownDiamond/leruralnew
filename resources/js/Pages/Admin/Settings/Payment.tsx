import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { CreditCard, Smartphone, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { useState } from 'react';

interface Gateway {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    logo?: string;
    config: Array<{
        key: string;
        label: string;
        value: string;
        type?: string;
    }>;
}

interface SettingsProps {
    gateways: Gateway[];
}

export default function Payment({ gateways }: SettingsProps) {
    const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form for Adding New Gateway
    const { data: newData, setData: setNewData, post: postNew, processing: processingNew, reset: resetNew } = useForm({
        name: '',
        slug: '',
        is_active: false,
        logo: null as File | null,
        config: [] as Array<{ key: string; label: string; value: string; type?: string }>
    });

    const handleToggleActive = (gateway: Gateway, checked: boolean) => {
        router.put(route('dashboard.settings.payment.update', gateway.id), {
            name: gateway.name,
            is_active: checked,
            config: gateway.config,
            logo: null
        }, {
            preserveScroll: true
        });
    };

    const handleUpdateConfig = (gateway: Gateway, key: string, value: string) => {
        const newConfig = gateway.config.map(item => 
            item.key === key ? { ...item, value: value } : item
        );
        
        // We use router directly to save on blur or specific action, 
        // but here let's assume we have a "Save" button for each gateway or global save.
        // For better UX, let's make each gateway a form.
    };

    return (
        <DashboardLayout title="Configuration des Paiements">
            <Head title="Configuration des Paiements" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configuration des Paiements</h1>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une méthode
                </Button>
            </div>

            <div className="space-y-6 max-w-5xl">
                {/* KkiaPay Settings */}
                {gateways.map((gateway) => (
                    <GatewayCard key={gateway.id} gateway={gateway} onToggle={handleToggleActive} />
                ))}
            </div>

            {/* Add Gateway Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Ajouter une méthode de paiement</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Configurez une nouvelle passerelle de paiement.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <AddGatewayForm 
                        onSuccess={() => {
                            setIsAddDialogOpen(false);
                            resetNew();
                        }} 
                    />
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}

function GatewayCard({ gateway, onToggle }: { gateway: Gateway, onToggle: (g: Gateway, c: boolean) => void }) {
    const { data, setData, put, processing, isDirty } = useForm({
        name: gateway.name,
        is_active: gateway.is_active,
        config: gateway.config,
        logo: null as File | string | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
            setIsUploading(true);

            // Upload to backend (which handles Cloudinary)
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Use the correct route name now
                const response = await fetch(route('dashboard.settings.payment.upload-logo'), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                    }
                });
                
                const result = await response.json();
                if (response.ok && result.secure_url) {
                    setData('logo', result.secure_url);
                    // Auto-save the new logo URL
                    router.post(route('dashboard.settings.payment.update', gateway.id), {
                        _method: 'put',
                        name: data.name,
                        is_active: data.is_active,
                        config: data.config,
                        logo: result.secure_url
                    }, {
                        preserveScroll: true,
                    });
                } else {
                    console.error('Upload failed', result);
                    alert('Erreur lors de l\'upload du logo: ' + (result.message || 'Erreur inconnue'));
                    setPreviewUrl(null); // Revert preview on error
                }
            } catch (error) {
                console.error('Upload error', error);
                alert('Erreur réseau lors de l\'upload (Vérifiez votre connexion ou la console)');
                setPreviewUrl(null); // Revert preview on error
            } finally {
                setIsUploading(false);
            }
        }
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('dashboard.settings.payment.update', gateway.id), {
            _method: 'put',
            name: data.name,
            is_active: data.is_active,
            config: data.config,
            logo: data.logo
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
                alert('Erreur lors de la sauvegarde. Vérifiez les champs.');
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) {
            router.delete(route('dashboard.settings.payment.destroy', gateway.id));
        }
    };

    const updateConfigValue = (key: string, value: string) => {
        const newConfig = data.config.map(c => c.key === key ? { ...c, value } : c);
        setData('config', newConfig);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 sm:p-6 shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b dark:border-gray-700 pb-4 gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group cursor-pointer flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative h-12 w-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Prévisualisation" 
                                    className="h-full w-full object-cover" 
                                />
                            ) : gateway.logo ? (
                                <img 
                                    src={gateway.logo} 
                                    alt={gateway.name} 
                                    className="h-full w-full object-cover" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`${(gateway.logo || previewUrl) ? 'hidden' : ''} flex items-center justify-center h-full w-full`}>
                                <CreditCard className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Overlay d'édition */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="h-4 w-4 text-white" />
                            </div>
                            
                            {/* Loading Overlay */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                            accept="image/png, image/jpeg, image/jpg"
                            title="Cliquez pour changer le logo"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 underline group-hover:text-primary">Modifier logo</span>
                            <span className="text-[9px] text-gray-400">(Carré recommandé)</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-all sm:break-normal">{gateway.name}</h2>
                        <p className="text-xs text-gray-500 font-mono break-all">{gateway.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${gateway.id}`} className="text-sm text-gray-500">
                            {data.is_active ? 'Activé' : 'Désactivé'}
                        </Label>
                        <Switch 
                            id={`active-${gateway.id}`} 
                            checked={data.is_active}
                            onCheckedChange={(checked) => {
                                setData('is_active', checked);
                                // Auto-save toggle with router.post to handle _method put
                                router.post(route('dashboard.settings.payment.update', gateway.id), {
                                    _method: 'put',
                                    name: data.name,
                                    is_active: checked,
                                    config: data.config,
                                    // Don't send logo here to avoid re-uploading or clearing it
                                }, { preserveScroll: true });
                            }}
                        />
                    </div>
                    <Button variant="destructive" size="icon" onClick={handleDelete} title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {data.is_active && (
                <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid gap-4 mb-4">
                        {data.config && data.config.map((field, idx) => (
                            <div key={idx}>
                                <Label htmlFor={`config-${gateway.id}-${field.key}`}>{field.label}</Label>
                                {field.type === 'textarea' ? (
                                    <Textarea
                                        id={`config-${gateway.id}-${field.key}`}
                                        value={field.value}
                                        onChange={(e) => updateConfigValue(field.key, e.target.value)}
                                        className="mt-1"
                                    />
                                ) : (
                                    <Input
                                        id={`config-${gateway.id}-${field.key}`}
                                        type={field.type || 'text'}
                                        value={field.value}
                                        onChange={(e) => updateConfigValue(field.key, e.target.value)}
                                        className="mt-1 font-mono"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-end items-center gap-4">
                        {showSuccess && <span className="text-green-600 text-sm font-medium animate-pulse">Enregistré avec succès !</span>}
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Enregistrement...
                                </>
                            ) : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

function AddGatewayForm({ onSuccess }: { onSuccess: () => void }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        slug: '',
        is_active: false,
        logo: null as File | null,
        config: [] as Array<{ key: string; label: string; value: string; type: string }>
    });

    const [newField, setNewField] = useState({ key: '', label: '', type: 'text' });

    const addField = () => {
        if (newField.key && newField.label) {
            setData('config', [...data.config, { ...newField, value: '' }]);
            setNewField({ key: '', label: '', type: 'text' });
        }
    };

    const removeField = (index: number) => {
        const newConfig = [...data.config];
        newConfig.splice(index, 1);
        setData('config', newConfig);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.settings.payment.store'), {
            onSuccess: () => {
                reset();
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4 dark:text-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="new-name" className="dark:text-gray-300">Nom de la méthode</Label>
                    <Input 
                        id="new-name" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        placeholder="Ex: Stripe"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div>
                    <Label htmlFor="new-slug" className="dark:text-gray-300">Identifiant (Slug)</Label>
                    <Input 
                        id="new-slug" 
                        value={data.slug} 
                        onChange={e => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                        placeholder="ex: stripe"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="new-logo" className="dark:text-gray-300">Logo (Optionnel)</Label>
                <Input 
                    id="new-logo" 
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files && setData('logo', e.target.files[0])}
                    className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:file:bg-gray-600 dark:file:text-white"
                />
            </div>

            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                <h4 className="font-medium mb-3 text-sm dark:text-gray-200">Champs de configuration</h4>
                
                {data.config.length > 0 && (
                    <ul className="space-y-2 mb-4">
                        {data.config.map((field, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600">
                                <span className="dark:text-gray-300">{field.label} <span className="text-gray-400">({field.key})</span></span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeField(idx)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                    <div>
                        <Label className="text-xs dark:text-gray-400">Clé (ex: public_key)</Label>
                        <Input 
                            value={newField.key} 
                            onChange={e => setNewField({...newField, key: e.target.value})} 
                            className="h-8 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        />
                    </div>
                    <div>
                        <Label className="text-xs dark:text-gray-400">Label (ex: Clé Publique)</Label>
                        <Input 
                            value={newField.label} 
                            onChange={e => setNewField({...newField, label: e.target.value})} 
                            className="h-8 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        />
                    </div>
                    <Button type="button" size="sm" onClick={addField} variant="secondary" className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                </div>
            </div>

            <DialogFooter>
                <Button type="submit" disabled={processing}>Créer la méthode</Button>
            </DialogFooter>
        </form>
    );
}