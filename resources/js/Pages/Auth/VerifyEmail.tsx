import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowRight, CheckCircle2, LogOut, MailCheck } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout
            eyebrow="Vérification"
            title="Confirmez votre email"
            tagline="Un dernier pas avant de profiter de LE RURAL : cliquez sur le lien que nous vous avons envoyé par email."
        >
            <Head title="Vérification de l'email" />

            <div className="mb-5 flex items-center justify-center">
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <MailCheck className="h-7 w-7 text-primary" />
                    <span className="absolute -top-1 -right-1 inline-block h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold leading-snug">
                        Un nouveau lien de vérification vient d'être envoyé à votre adresse email.
                    </span>
                </div>
            )}

            <div className="mb-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                    Merci pour votre inscription. Vérifiez votre boîte de réception
                    (pensez aux spams) et cliquez sur le lien de confirmation. Vous n'avez
                    rien reçu ? Demandez un nouvel email ci-dessous.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:shadow-[0_16px_40px_-12px_rgba(47,106,17,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{processing ? 'Envoi…' : 'Renvoyer l\'email'}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex w-full items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors py-2"
                >
                    <LogOut className="h-3 w-3" />
                    Se déconnecter
                </Link>
            </form>
        </GuestLayout>
    );
}
