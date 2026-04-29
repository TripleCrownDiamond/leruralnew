import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    Zone de danger
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Cette action supprime definitivement votre compte et toutes vos donnees.
                </p>
            </header>

            <AdminButton variant="danger" onClick={confirmUserDeletion}>
                Supprimer le compte
            </AdminButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        Confirmer la suppression
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Entrez votre mot de passe pour confirmer la suppression definitive.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Mot de passe" className="sr-only" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Mot de passe"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <AdminButton type="button" variant="secondary" onClick={closeModal}>
                            Annuler
                        </AdminButton>
                        <AdminButton variant="danger" disabled={processing}>
                            Supprimer
                        </AdminButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
