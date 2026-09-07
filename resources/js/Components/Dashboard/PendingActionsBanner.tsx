import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Database, MailCheck } from 'lucide-react';

/**
 * Actions d'administration restant a declencher.
 *
 * Le bandeau est present sur toutes les pages du tableau de bord et disparait
 * de lui-meme une fois le travail fait : rien a aller chercher, rien a retenir.
 */

function safeRoute(name: string): string {
    try {
        if (typeof route === 'function' && route().has(name)) return route(name);
        return '#';
    } catch {
        return '#';
    }
}

export default function PendingActionsBanner() {
    const { props } = usePage<any>();
    const pending = props.admin_pending as
        | { migrations: number; verifications: number }
        | undefined;

    if (!pending) return null;

    const migrations = Number(pending.migrations ?? 0);
    const verifications = Number(pending.verifications ?? 0);

    if (migrations < 1 && verifications < 1) return null;

    const lancer = (nom: string, question: string) => {
        if (!confirm(question)) return;

        router.post(safeRoute(nom), {}, { preserveScroll: true });
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
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-600"
                                >
                                    <Database className="h-3.5 w-3.5" />
                                    Appliquer
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
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-600"
                                >
                                    <MailCheck className="h-3.5 w-3.5" />
                                    Renvoyer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
