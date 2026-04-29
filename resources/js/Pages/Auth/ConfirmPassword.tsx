import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            eyebrow="Zone sécurisée"
            title="Confirmez votre identité"
            tagline="Pour votre sécurité, merci de ressaisir votre mot de passe avant d'accéder à cette zone."
        >
            <Head title="Confirmer le mot de passe" />

            <div className="mb-5 flex items-center justify-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="password" className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        Mot de passe
                    </label>
                    <div className="group relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
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

                <button
                    type="submit"
                    disabled={processing}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:shadow-[0_16px_40px_-12px_rgba(47,106,17,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{processing ? 'Vérification…' : 'Confirmer'}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </form>
        </GuestLayout>
    );
}
