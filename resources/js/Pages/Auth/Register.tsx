import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { usePendingPurchase } from '@/Hooks/usePendingPurchase';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';

export default function Register() {
    usePendingPurchase();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        if (data.password && data.password_confirmation) {
            setPasswordMatch(data.password === data.password_confirmation);
        } else {
            setPasswordMatch(true);
        }
    }, [data.password, data.password_confirmation]);

    const calculateStrength = (password: string) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        return score;
    };

    const getStrengthMeta = (score: number) => {
        if (score === 0) return { label: '', color: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-400' };
        if (score <= 20) return { label: 'Très faible', color: 'bg-red-500', text: 'text-red-500' };
        if (score <= 40) return { label: 'Faible', color: 'bg-orange-500', text: 'text-orange-500' };
        if (score <= 60) return { label: 'Moyen', color: 'bg-yellow-500', text: 'text-yellow-600' };
        if (score <= 80) return { label: 'Fort', color: 'bg-lime-500', text: 'text-lime-600' };
        return { label: 'Très fort', color: 'bg-primary', text: 'text-primary' };
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (data.password !== data.password_confirmation) return;
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const strengthMeta = getStrengthMeta(strength);
    const rules = [
        { ok: data.password.length >= 8, label: '8 caractères' },
        { ok: /[A-Z]/.test(data.password), label: 'Majuscule' },
        { ok: /[0-9]/.test(data.password), label: 'Chiffre' },
        { ok: /[^A-Za-z0-9]/.test(data.password), label: 'Symbole' },
    ];

    return (
        <GuestLayout
            eyebrow="Inscription"
            title="Rejoignez LE RURAL"
            tagline="Créez un compte gratuit pour commenter, voter dans les sondages et débloquer les articles premium."
        >
            <Head title="Inscription" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                        Nom complet
                    </label>
                    <div className="group relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            autoFocus
                            required
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Votre nom"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                        />
                    </div>
                    {errors.name && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.name}
                        </p>
                    )}
                </div>

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
                            required
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
                            autoComplete="new-password"
                            required
                            onChange={(e) => {
                                setData('password', e.target.value);
                                setStrength(calculateStrength(e.target.value));
                            }}
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

                    {data.password && (
                        <div className="mt-3 space-y-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Robustesse</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${strengthMeta.text}`}>
                                    {strengthMeta.label}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {rules.map((r) => (
                                    <div key={r.label} className={`flex items-center gap-1.5 text-[11px] ${r.ok ? 'text-primary' : 'text-gray-400'}`}>
                                        {r.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            required
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full rounded-2xl border bg-gray-50/50 py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-4 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800 ${
                                !passwordMatch && data.password_confirmation
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                                    : 'border-gray-200 focus:border-primary focus:ring-primary/10 dark:border-gray-700'
                            }`}
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
                    {!passwordMatch && data.password && data.password_confirmation && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Les mots de passe ne correspondent pas
                        </p>
                    )}
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
                    <span className="relative">{processing ? 'Création…' : 'Créer mon compte'}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Déjà membre ?</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <Link
                href={route('login')}
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white py-3 text-xs font-black uppercase tracking-[0.16em] text-gray-900 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-primary transition-all"
            >
                Se connecter
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </GuestLayout>
    );
}
