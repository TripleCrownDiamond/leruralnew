import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            eyebrow="Nouveau mot de passe"
            title="Sécurisez votre compte"
            tagline="Choisissez un nouveau mot de passe robuste pour votre espace LE RURAL."
        >
            <Head title="Réinitialiser le mot de passe" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        Email
                    </label>
                    <div className="group relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        Nouveau mot de passe
                    </label>
                    <div className="group relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
                            aria-label={showPassword ? 'Cacher' : 'Afficher'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        Confirmer le mot de passe
                    </label>
                    <div className="group relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="password_confirmation"
                            type={showConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
                            aria-label={showConfirm ? 'Cacher' : 'Afficher'}
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:shadow-[0_16px_40px_-12px_rgba(47,106,17,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{processing ? 'Enregistrement…' : 'Réinitialiser'}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </form>

            <Link
                href={route('login')}
                className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-3 w-3" />
                Retour à la connexion
            </Link>
        </GuestLayout>
    );
}
