import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import React from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [passwordMatch, setPasswordMatch] = React.useState(true);
    const [strength, setStrength] = React.useState(0);

    React.useEffect(() => {
        if (data.password && data.password_confirmation) {
            setPasswordMatch(data.password === data.password_confirmation);
        } else {
            setPasswordMatch(true); // Don't show error if one is empty
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

    const getStrengthColor = (score: number) => {
        if (score <= 20) return 'bg-red-500';
        if (score <= 40) return 'bg-orange-500';
        if (score <= 60) return 'bg-yellow-500';
        if (score <= 80) return 'bg-lime-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return '';
        if (score <= 20) return 'Très faible';
        if (score <= 40) return 'Faible';
        if (score <= 60) return 'Moyen';
        if (score <= 80) return 'Fort';
        return 'Très fort';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.password !== data.password_confirmation) {
             return; // Prevent submission if mismatch
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nom" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mot de passe" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => {
                            setData('password', e.target.value);
                            setStrength(calculateStrength(e.target.value));
                        }}
                        required
                    />

                    {data.password && (
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className={`font-medium ${
                                    strength <= 20 ? 'text-red-500' :
                                    strength <= 40 ? 'text-orange-500' :
                                    strength <= 60 ? 'text-yellow-500' :
                                    strength <= 80 ? 'text-lime-500' :
                                    'text-green-500'
                                }`}>
                                    Force: {getStrengthText(strength)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`} 
                                    style={{ width: `${strength}%` }}
                                ></div>
                            </div>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 list-disc pl-4 space-y-0.5">
                                <li className={data.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>Au moins 8 caractères</li>
                                <li className={/[A-Z]/.test(data.password) ? 'text-green-600 dark:text-green-400' : ''}>Une majuscule</li>
                                <li className={/[0-9]/.test(data.password) ? 'text-green-600 dark:text-green-400' : ''}>Un chiffre</li>
                                <li className={/[^A-Za-z0-9]/.test(data.password) ? 'text-green-600 dark:text-green-400' : ''}>Un caractère spécial</li>
                            </ul>
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmer le mot de passe"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    >
                        Déjà inscrit ?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        S'inscrire
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
