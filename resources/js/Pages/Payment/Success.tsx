import { Button } from '@/Components/ui/button';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, CreditCard, Home, ReceiptText } from 'lucide-react';

type SuccessProps = {
    payment: {
        id: number;
        status: 'pending' | 'completed' | 'failed' | string;
        amount: number;
        currency: string;
        method: string;
        type: 'article' | 'subscription' | 'paper' | string;
        description?: string | null;
        related_name?: string | null;
        created_at?: string | null;
        access_url?: string | null;
        access_label?: string | null;
    };
};

export default function Success({ payment }: SuccessProps) {
    const isCompleted = payment.status === 'completed';

    const formattedAmount = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: payment.currency || 'XOF',
    }).format(payment.amount || 0);

    return (
        <MainLayout title="Paiement">
            <Head title="Paiement" />

            <div className="min-h-screen bg-gradient-to-b from-[#f7f8f4] via-white to-[#eef2e7] py-10 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/80">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/35 p-7 text-white shadow-[0_30px_80px_-30px_rgba(47,106,17,0.55)] sm:p-9">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

                        <div className="relative">
                            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">LE RURAL / Paiement</div>
                            <div className="flex items-start gap-3">
                                {isCompleted ? (
                                    <CheckCircle2 className="mt-1 h-8 w-8 text-emerald-300" />
                                ) : (
                                    <Clock3 className="mt-1 h-8 w-8 text-amber-300" />
                                )}
                                <div>
                                    <h1 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
                                        {isCompleted ? 'Paiement valide' : 'Paiement en attente'}
                                    </h1>
                                    <p className="mt-3 text-sm text-white/75 sm:text-base">
                                        {isCompleted
                                            ? 'Votre paiement est enregistre et votre acces est active.'
                                            : 'Votre demande est bien enregistree. Notre equipe confirme votre paiement sous peu.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-6 rounded-3xl border border-gray-200/70 bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/75 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Montant</p>
                                <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">{formattedAmount}</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Methode</p>
                                <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    <CreditCard className="h-4 w-4" />
                                    {payment.method}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:col-span-2">
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Detail</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                    {payment.description || payment.related_name || 'Paiement LE RURAL'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href={route('dashboard')}>
                                <Button className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-[0.12em]">
                                    <Home className="mr-2 h-4 w-4" />
                                    Tableau de bord
                                </Button>
                            </Link>

                            {payment.access_url && payment.access_label && (
                                <a href={payment.access_url}>
                                    <Button variant="outline" className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-[0.12em]">
                                        {payment.access_label}
                                    </Button>
                                </a>
                            )}

                            <Link href={route('user.purchases')}>
                                <Button variant="outline" className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-[0.12em]">
                                    <ReceiptText className="mr-2 h-4 w-4" />
                                    Mes achats
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
