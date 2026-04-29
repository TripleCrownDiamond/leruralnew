import '../css/app.css';
import './bootstrap';

import { ThemeProvider } from '@/Components/ThemeProvider';
import { AdvertisementProvider } from '@/Components/AdSpace';
import { createInertiaApp } from '@inertiajs/react';
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
    progress: {
        color: '#4B5563',
    },
});
