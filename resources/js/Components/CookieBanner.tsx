import { useEffect, useState } from 'react';
import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
    const { theme } = useTheme();
    const [show, setShow] = useState(false);
    const [systemDark, setSystemDark] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    useEffect(() => {
        if (theme !== 'system' || typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = () => setSystemDark(media.matches);

        sync();
        media.addEventListener('change', sync);

        return () => media.removeEventListener('change', sync);
    }, [theme]);

    const isDark = theme === 'dark' || (theme === 'system' && systemDark);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
            <div className={`mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border p-4 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-5 ${
                isDark
                    ? 'border-white/10 bg-gray-950/90 text-white'
                    : 'border-stone-200 bg-white/95 text-gray-950'
            }`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10' : 'bg-primary/10'}`}>
                            <Cookie className={`h-6 w-6 ${isDark ? 'text-primary-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Confidentialite
                            </div>
                            <h3 className="mt-3 font-heading text-xl font-black uppercase tracking-tight sm:text-2xl">
                                Vos preferences de navigation
                            </h3>
                            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-white/72' : 'text-gray-600'}`}>
                                Nous utilisons des cookies pour mesurer l'audience, personnaliser les contenus et garder vos choix de session.
                                Vous pouvez accepter ou refuser sans bloquer la lecture du site.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            variant="outline"
                            onClick={handleDecline}
                            className={`rounded-full border px-5 font-black uppercase tracking-[0.14em] ${
                                isDark
                                    ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                                    : 'border-stone-300 bg-white text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            Refuser
                        </Button>
                        <Button
                            onClick={handleAccept}
                            className="rounded-full bg-primary px-5 font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
                        >
                            Tout accepter
                        </Button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleDecline}
                    className={`absolute right-3 top-3 rounded-full border p-1.5 transition hover:scale-105 ${
                        isDark ? 'border-white/10 bg-white/5 text-white/60 hover:text-white' : 'border-stone-200 bg-white text-gray-500 hover:text-gray-800'
                    }`}
                    aria-label="Fermer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
