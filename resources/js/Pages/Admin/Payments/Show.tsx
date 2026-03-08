import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { Label } from '@/Components/ui/label';

interface Payment {
    id: number;
    user: { name: string; email: string };
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string;
    type: string;
    related_id: number;
    transaction_id: string;
    meta_data: any;
    created_at: string;
}

export default function Show({ payment }: { payment: Payment }) {
    const { data, setData, put, processing } = useForm({
        status: payment.status,
    });

    const handleStatusChange = (status: 'completed' | 'failed' | 'cancelled') => {
        if (confirm(`Êtes-vous sûr de vouloir passer ce paiement en statut : ${status} ?`)) {
            data.status = status;
            put(route('dashboard.payments.update', payment.id));
        }
    };

    return (
        <DashboardLayout title={`Paiement #${payment.id}`}>
            <div className="flex items-center mb-6">
                <Link href={route('dashboard.payments.index')} className="mr-4">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Détails du Paiement #{payment.id}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700">Informations Générales</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-500">Utilisateur</Label>
                            <p className="font-medium">{payment.user.name}</p>
                            <p className="text-sm text-gray-400">{payment.user.email}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-500">Montant</Label>
                                <p className="text-xl font-bold text-primary">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-500">Statut Actuel</Label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium 
                                        ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {payment.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-500">Type de service</Label>
                            <p className="capitalize font-medium">{payment.type}</p>
                        </div>

                        <div>
                            <Label className="text-gray-500">Méthode de paiement</Label>
                            <p className="uppercase font-mono">{payment.payment_method}</p>
                        </div>

                        <div>
                            <Label className="text-gray-500">Date</Label>
                            <p>{new Date(payment.created_at).toLocaleString('fr-FR')}</p>
                        </div>
                    </div>
                </div>

                {/* Actions & Proof */}
                <div className="space-y-6">
                    {/* Manual Payment Proof */}
                    {payment.payment_method === 'manual' && payment.meta_data?.proof_path && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700">Preuve de Paiement</h3>
                            
                            <div className="mb-4">
                                <Label className="text-gray-500">Numéro Émetteur</Label>
                                <p className="font-mono text-lg">{payment.meta_data.phone_number || 'Non renseigné'}</p>
                            </div>

                            <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 p-2">
                                <img 
                                    src={`/storage/${payment.meta_data.proof_path}`} 
                                    alt="Preuve de paiement" 
                                    className="max-h-64 mx-auto object-contain"
                                />
                            </div>
                            
                            <div className="mt-4 flex justify-center">
                                <a href={`/storage/${payment.meta_data.proof_path}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger l'image
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Validation Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700">Actions Administrateur</h3>
                        
                        <div className="flex flex-col gap-3">
                            {payment.status !== 'completed' && (
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={processing}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Valider le paiement et Activer l'accès
                                </Button>
                            )}

                            {payment.status === 'pending' && (
                                <Button 
                                    variant="destructive" 
                                    className="w-full"
                                    onClick={() => handleStatusChange('failed')}
                                    disabled={processing}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Rejeter le paiement
                                </Button>
                            )}
                            
                            {payment.status === 'completed' && (
                                <div className="p-3 bg-green-50 text-green-700 rounded text-center text-sm">
                                    Ce paiement a déjà été validé et le service activé.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}