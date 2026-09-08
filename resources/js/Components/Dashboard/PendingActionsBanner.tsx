import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Database, Loader2, MailCheck } from 'lucide-react';
import { useState } from 'react';

/**
 * Actions d'administration restant a declencher.
 *
 * Le bandeau est present sur toutes les pages du tableau de bord et disparait
 * de lui-meme une fois le travail fait : rien a aller chercher, rien a retenir.
 */

function safeRoute(name: string): string {
    try {
        if (typeof route === 'function' && route().has(name))
            return route(name);
        return '#';
    } catch {
        return '#';
    }
}

export default function PendingActionsBanner() {
    const { props } = usePage<any>();

    // Les hooks passent avant tout retour anticipe : le bandeau apparait et
    // disparait selon l'etat du site, et React exige un nombre de hooks stable.
    const [enCours, setEnCours] = useState<string | null>(null);

    const pending = props.admin_pending as
        | { migrations: number; verifications: number }
        | undefined;

    const migrations = Number(pending?.migrations ?? 0);
    const verifications = Number(pending?.verifications ?? 0);

    if (!pending || (migrations < 1 && verifications < 1)) return null;

    const lancer = (nom: string, question: string) => {
        if (enCours || !confirm(question)) return;

        const url = safeRoute(nom);

        // Une route absente du fichier Ziggy renvoie '#' : sans ce garde-fou,
        // le clic ne produisait rien et restait inexplicable.
        if (url === '#') {
            alert(
                "Action indisponible : la route n'est pas connue du navigateur. Rechargez la page ; si cela persiste, le fichier de routes doit etre redeploye.",
            );
            return;
        }

        setEnCours(nom);

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setEnCours(null),
            },
        );
    };

    return (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-900 dark:text-amber-200">
                        A traiter
                    </p>

                    <div className="mt-3 flex flex-col gap-3">
                        {migrations > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-amber-900 dark:text-amber-200/90">
                                    <span className="font-bold">
                                        {migrations} mise(s) a jour de la base
                                    </span>{' '}
                                    en attente. Les nouvelles mesures ne
                                    demarreront qu'une fois appliquees.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        lancer(
                                            'dashboard.maintenance.migrate',
                                            'Appliquer les mises a jour de la base ?\n\nSans effet si elles sont deja passees.',
                                        )
                                    }
                                    disabled={enCours !== null}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {enCours ===
                                    'dashboard.maintenance.migrate' ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Database className="h-3.5 w-3.5" />
                                    )}
                                    {enCours === 'dashboard.maintenance.migrate'
                                        ? 'Application...'
                                        : 'Appliquer'}
                                </button>
                            </div>
                        )}

                        {verifications > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-amber-900 dark:text-amber-200/90">
                                    <span className="font-bold">
                                        {verifications} compte(s) non verifie(s)
                                    </span>{' '}
                                    : ces personnes n'ont jamais recu de lien
                                    d'activation valide.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        lancer(
                                            'dashboard.users.bulk-resend-verification',
                                            'Envoyer un lien de verification a tous les comptes non verifies ?\n\nChaque personne concernee recevra un e-mail.',
                                        )
                                    }
                                    disabled={enCours !== null}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {enCours ===
                                    'dashboard.users.bulk-resend-verification' ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <MailCheck className="h-3.5 w-3.5" />
                                    )}
                                    {enCours ===
                                    'dashboard.users.bulk-resend-verification'
                                        ? 'Envoi en cours...'
                                        : 'Renvoyer'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
