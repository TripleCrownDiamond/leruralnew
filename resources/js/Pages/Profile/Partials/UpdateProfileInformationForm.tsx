import CloudinaryUpload from '@/Components/CloudinaryUpload';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: (user as any).avatar || '',
            bio: (user as any).bio || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    Informations du profil
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Mettez a jour vos informations personnelles et votre email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <CloudinaryUpload
                        label="Photo de profil"
                        defaultImage={data.avatar}
                        onUpload={(url) => setData('avatar' as any, url)}
                    />
                    <InputError className="mt-2" message={errors.avatar} />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nom" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name' as any, e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Bio" />
                    <textarea
                        id="bio"
                        className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        value={data.bio}
                        onChange={(e) => setData('bio' as any, e.target.value)}
                        rows={4}
                        placeholder="Parlez-nous de vous..."
                    />
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email' as any, e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                        Votre adresse email n'est pas verifiee.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="ml-2 font-bold underline"
                        >
                            Renvoyer le lien de verification
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                Un nouveau lien de verification a ete envoye.
                            </div>
                        )}
                    </div>
                )}

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
