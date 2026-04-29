import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { usePendingPurchase } from '@/Hooks/usePendingPurchase';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    usePendingPurchase();

    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            eyebrow="Connexion"
            title="Accédez à votre espace"
            tagline="Retrouvez vos articles, sondages et contenus premium réservés aux abonnés LE RURAL."
        >
            <Head title="Connexion" />

            {status && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="normal-case tracking-normal font-semibold">{status}</span>
                </div>
            )}

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
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="vous@exemple.com"
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
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="password" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                            Mot de passe
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[10px] font-black uppercase tracking-[0.18em] text-primary hover:text-primary/80 transition-colors"
                            >
                                Oublié ?
                            </Link>
                        )}
                    </div>
                    <div className="group relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
                            aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
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

                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <div className="relative">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                            className="peer sr-only"
                        />
                        <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-white transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:peer-checked:bg-primary" />
                        <CheckCircle2 className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 scale-0 text-white transition peer-checked:scale-100" style={{ display: data.remember ? 'block' : 'none' }} />
                        {data.remember && (
                            <svg className="pointer-events-none absolute left-1 top-1 h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                        Se souvenir de moi
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:shadow-[0_16px_40px_-12px_rgba(47,106,17,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{processing ? 'Connexion…' : 'Se connecter'}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Ou</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <Link
                href={route('register')}
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white py-3 text-xs font-black uppercase tracking-[0.16em] text-gray-900 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-primary transition-all"
            >
                Créer un compte
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </GuestLayout>
    );
}
