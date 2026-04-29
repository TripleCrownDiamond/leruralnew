import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [strength, setStrength] = useState(0);

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

    const getStrengthColor = (score: number) => {
        if (score <= 20) return 'bg-red-500';
        if (score <= 40) return 'bg-orange-500';
        if (score <= 60) return 'bg-yellow-500';
        if (score <= 80) return 'bg-lime-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return '';
        if (score <= 20) return 'Tres faible';
        if (score <= 40) return 'Faible';
        if (score <= 60) return 'Moyen';
        if (score <= 80) return 'Fort';
        return 'Tres fort';
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errorBag) => {
                if (errorBag.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errorBag.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    Securite
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Utilisez un mot de passe fort et unique.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Mot de passe actuel" />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nouveau mot de passe" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => {
                            setData('password', e.target.value);
                            setStrength(calculateStrength(e.target.value));
                        }}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    {data.password && (
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">Force: {getStrengthText(strength)}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`} style={{ width: `${strength}%` }} />
                            </div>
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-3">
                    <AdminButton disabled={processing}>Enregistrer</AdminButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Enregistre.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
