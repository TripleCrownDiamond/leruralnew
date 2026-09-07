import { router } from '@inertiajs/react';

/**
 * Mesure du temps passe sur une page.
 *
 * L'envoi se fait par sendBeacon : c'est le seul moyen fiable de transmettre
 * quelque chose pendant que l'onglet se ferme, une requete classique etant
 * annulee. Le temps ou l'onglet est en arriere-plan n'est pas compte : il ne
 * s'agit pas de lecture.
 */

const ENDPOINT = '/api/page-time';
const MINIMUM_SECONDES = 2;

let visiteCourante: number | null = null;
let debut = 0;
let cumul = 0;
let envoye = false;

function jetonCsrf(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

function identifiantDeLaPage(): number | null {
    const valeur = Number((window as any).__pageViewId);

    return Number.isFinite(valeur) && valeur > 0 ? valeur : null;
}

function secondesEcoulees(): number {
    const enCours = debut > 0 ? (Date.now() - debut) / 1000 : 0;

    return Math.round(cumul + enCours);
}

function envoyer(): void {
    if (envoye || visiteCourante === null) {
        return;
    }

    const secondes = secondesEcoulees();

    if (secondes < MINIMUM_SECONDES) {
        return;
    }

    envoye = true;

    try {
        const corps = new FormData();
        corps.append('id', String(visiteCourante));
        corps.append('seconds', String(secondes));
        corps.append('_token', jetonCsrf());

        navigator.sendBeacon?.(ENDPOINT, corps);
    } catch {
        // Une mesure perdue n'a aucune consequence pour le visiteur.
    }
}

function demarrer(): void {
    envoyer(); // Cloture la page precedente lors d'une navigation Inertia.

    visiteCourante = identifiantDeLaPage();
    debut = Date.now();
    cumul = 0;
    envoye = false;
}

export function startPageTimeTracking(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    demarrer();

    // visibilitychange couvre la fermeture d'onglet et le passage en arriere-plan,
    // la ou "unload" n'est plus fiable sur mobile.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            cumul += debut > 0 ? (Date.now() - debut) / 1000 : 0;
            debut = 0;
            envoyer();
        } else if (debut === 0) {
            debut = Date.now();
        }
    });

    window.addEventListener('pagehide', envoyer);

    // Chaque navigation SPA cloture la mesure precedente et en ouvre une neuve.
    router.on('navigate', demarrer);
}
