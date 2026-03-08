import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { useState } from 'react';
import { CheckCircle2, ShieldCheck, Banknote, Smartphone, Upload } from 'lucide-react';

interface CheckoutProps {
    type: 'article' | 'subscription';
    item: any;
    amount: number;
    name: string;
    gateways: Array<{
        id: string;
        name: string;
        logo: string;
    }>;
}

export default function Checkout({ type, item, amount, name, gateways }: CheckoutProps) {
    const { props } = usePage<any>();
    const [selectedGateway, setSelectedGateway] = useState<string>(gateways[0].id);
    const user = props.auth.user;
    
    // Add KkiaPay Script
    const addKkiaPayScript = () => {
        if (!document.getElementById('kkiapay-script')) {
            const script = document.createElement('script');
            script.src = "https://cdn.kkiapay.me/k.js";
            script.id = 'kkiapay-script';
            document.body.appendChild(script);
        }
    };
    addKkiaPayScript();

    const { data, setData, post, processing, errors } = useForm({
        type: type,
        item_id: item.slug, // sending slug as ID
        gateway: gateways[0].id,
        proof_file: null as File | null,
        phone_number: '',
        transaction_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedGateway === 'kkiapay') {
            // @ts-ignore
            if (typeof openKkiapayWidget !== 'undefined') {
                // @ts-ignore
                openKkiapayWidget({
                    amount: amount,
                    api_key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || "YOUR_PUBLIC_KEY", // Fallback for safety
                    sandbox: true,
                    email: user.email,
                    phone: "",
                    fullname: user.name,
                    callback: (response: any) => {
                        // console.log("KkiaPay Success:", response);
                        
                        // Manually post data to avoid closure stale state issues with 'data'
                        const form = {
                            type: type,
                            item_id: item.slug,
                            gateway: 'kkiapay',
                            proof_file: null,
                            phone_number: '',
                            transaction_id: response.transactionId
                        };
                        
                        // @ts-ignore
                        post(route('payment.process'), form);
                    }
                });
            } else {
                console.error("KkiaPay widget not loaded");
                alert("Erreur: Le module de paiement n'est pas encore chargé. Veuillez rafraîchir la page.");
            }
            return;
        }

        // For automated gateways in dummy mode, generate a fake transaction ID
        if (selectedGateway !== 'manual' && selectedGateway !== 'kkiapay') {
            data.transaction_id = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }

        post(route('payment.process'), {
            forceFormData: true, // Required for file upload
        });
    };

    const handleGatewayChange = (value: string) => {
        setSelectedGateway(value);
        setData('gateway', value);
    };

    return (
        <MainLayout title={`Paiement - ${name}`}>
            <Head title={`Paiement - ${name}`} />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Finaliser votre commande</h1>
                        <p className="text-gray-600 dark:text-gray-400">Sécurisé par SSL. Vos données sont protégées.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="md:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
                                <h3 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Récapitulatif</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                                            <p className="text-sm text-gray-500 capitalize">{type === 'article' ? 'Article à l\'unité' : 'Abonnement'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                                        <span className="font-bold text-lg">Total à payer</span>
                                        <span className="font-bold text-xl text-primary">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)}</span>
                                    </div>
                                    
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Paiement 100% sécurisé</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="md:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold mb-6">Moyen de paiement</h3>

                                <form onSubmit={handleSubmit}>
                                    <RadioGroup value={selectedGateway} onValueChange={handleGatewayChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        {gateways.map((gateway) => (
                                            <div key={gateway.id}>
                                                <RadioGroupItem value={gateway.id} id={gateway.id} className="peer sr-only" />
                                                <Label
                                                    htmlFor={gateway.id}
                                                    className={`relative flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all h-full ${
                                                        selectedGateway === gateway.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {gateway.logo ? (
                                                        <img 
                                                            src={gateway.logo} 
                                                            alt={gateway.name} 
                                                            className="mb-3 h-12 w-auto object-contain max-w-[120px]" 
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    
                                                    {/* Fallback Icon if no logo or error */}
                                                    <div className={`${gateway.logo ? 'hidden' : ''} mb-3 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800`}>
                                                        {gateway.id === 'manual' ? (
                                                            <Smartphone className="h-6 w-6 text-gray-500" />
                                                        ) : (
                                                            <CreditCard className="h-6 w-6 text-gray-500" />
                                                        )}
                                                    </div>

                                                    <span className="font-semibold text-center text-sm">{gateway.name}</span>
                                                    
                                                    {selectedGateway === gateway.id && (
                                                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {/* Manual Payment Fields */}
                                    {selectedGateway === 'manual' && (
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg mb-6 border border-gray-100 dark:border-gray-700">
                                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Preuve de paiement
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                Veuillez effectuer le transfert sur le numéro <strong>+229 01 02 03 04</strong> (Momo/Flooz) et télécharger la capture d'écran ci-dessous.
                                            </p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="phone">Numéro émetteur</Label>
                                                    <Input 
                                                        id="phone" 
                                                        placeholder="Ex: 97000000" 
                                                        value={data.phone_number}
                                                        onChange={(e) => setData('phone_number', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                    {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="proof">Capture d'écran / Photo du reçu</Label>
                                                    <Input 
                                                        id="proof" 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => setData('proof_file', e.target.files ? e.target.files[0] : null)}
                                                        className="mt-1 cursor-pointer"
                                                    />
                                                    {errors.proof_file && <p className="text-red-500 text-sm mt-1">{errors.proof_file}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Automated Gateway Message */}
                                    {selectedGateway !== 'manual' && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-sm text-blue-700 dark:text-blue-300">
                                            Vous allez être redirigé vers la plateforme de paiement sécurisée {gateways.find(g => g.id === selectedGateway)?.name} pour finaliser la transaction.
                                        </div>
                                    )}

                                    <Button 
                                        type="submit" 
                                        className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20" 
                                        disabled={processing}
                                    >
                                        {processing ? 'Traitement en cours...' : `Payer ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)}`}
                                    </Button>
                                    
                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        En validant votre commande, vous acceptez nos conditions générales de vente.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}