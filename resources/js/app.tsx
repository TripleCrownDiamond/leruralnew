import '../css/app.css';
import './bootstrap';

import { AdvertisementProvider } from '@/Components/AdSpace';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { startPageTimeTracking } from '@/lib/pageTime';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

// Guard against missing Ziggy routes so UI does not crash on route() calls.
const routeGlobal = (globalThis as any).route;
if (typeof routeGlobal === 'function' && !routeGlobal.__safeWrapped) {
    const originalRoute = routeGlobal.bind(globalThis);

    const safeRoute = (...args: any[]) => {
        if (args.length > 0 && typeof args[0] === 'string') {
            try {
                return originalRoute(...args);
            } catch {
                return '#';
            }
        }

        try {
            return originalRoute(...args);
        } catch {
            return {
                current: () => false,
                has: () => false,
            };
        }
    };

    safeRoute.__safeWrapped = true;
    (globalThis as any).route = safeRoute;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Expose l'identifiant de la visite pour la mesure du temps de lecture.
        // Cet ecouteur est enregistre AVANT startPageTimeTracking : les
        // gestionnaires se declenchent dans l'ordre d'inscription, et la mesure
        // doit lire l'identifiant deja rafraichi.
        if (!import.meta.env.SSR) {
            (window as any).__pageViewId =
                (props.initialPage?.props as any)?.page_view_id ?? null;

            router.on('navigate', (event: any) => {
                (window as any).__pageViewId =
                    event?.detail?.page?.props?.page_view_id ?? null;
            });

            startPageTimeTracking();
        }

        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                    <AdvertisementProvider>
                        <App {...props} />
                    </AdvertisementProvider>
                </ThemeProvider>,
            );
            return;
        }

        createRoot(el).render(
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <AdvertisementProvider>
                    <App {...props} />
                </AdvertisementProvider>
            </ThemeProvider>,
        );
    },
    // Barre de progression visible sur chaque navigation et chaque envoi de
    // formulaire, cote public comme cote administration. Le gris d'origine
    // etait indiscernable du theme : rien ne signalait qu'il se passait
    // quelque chose. Vert de marque, avec le spinner.
    progress: {
        color: '#2f6a11',
        delay: 120,
        includeCSS: true,
        showSpinner: true,
    },
});
