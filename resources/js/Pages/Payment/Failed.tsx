import { Button } from '@/Components/ui/button';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home, RotateCcw } from 'lucide-react';

type FailedProps = {
    reason?: string;
};

export default function Failed({ reason }: FailedProps) {
    const errorReason = reason || "Le paiement n'a pas pu etre finalise.";

    return (
        <MainLayout title="Paiement echoue">
            <Head title="Paiement echoue" />

            <div className="min-h-screen bg-gradient-to-b from-[#fff7f5] via-white to-[#fdeee9] py-10 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/80">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-red-700/45 p-7 text-white shadow-[0_30px_80px_-30px_rgba(185,28,28,0.55)] sm:p-9">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/30 blur-3xl" />
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

                        <div className="relative">
                            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">LE RURAL / Paiement</div>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-1 h-8 w-8 text-amber-300" />
                                <div>
                                    <h1 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
                                        Paiement non finalise
                                    </h1>
                                    <p className="mt-3 text-sm text-white/75 sm:text-base">
                                        Une erreur est survenue pendant la validation de votre paiement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-6 rounded-3xl border border-gray-200/70 bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/75 sm:p-6">
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                            {errorReason}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-800 transition hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reessayer
                            </button>

                            <Link href={route('dashboard')}>
                                <Button className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-[0.12em]">
                                    <Home className="mr-2 h-4 w-4" />
                                    Tableau de bord
                                </Button>
                            </Link>

                            <Link href={route('payment.checkout', { type: 'subscription', id: 'default' })}>
                                <Button variant="outline" className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-[0.12em]">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour checkout
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
