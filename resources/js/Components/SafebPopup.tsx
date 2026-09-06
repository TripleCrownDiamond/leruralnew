import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Download, MapPin, Wheat, X } from 'lucide-react';
import { useEffect } from 'react';

interface SafebPopupProps {
    pdfUrl?: string | null;
    onClose: () => void;
}

export default function SafebPopup({ pdfUrl = null, onClose }: SafebPopupProps) {
    const resolvedPdfUrl = pdfUrl || route('safeb.pdf');
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[135] flex animate-in fade-in items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Annonce SAFEB 2026"
        >
            <div
                className="relative w-full max-w-lg animate-in zoom-in-95 duration-300 overflow-hidden rounded-[2rem] border border-white/10 bg-gray-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header gradient */}
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0d1d0c_0%,#183a13_52%,#2f6a11_100%)] px-6 pb-6 pt-5 text-white sm:px-7">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl"
                    />
                    <div className="relative flex items-start justify-between gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-amber-300">
                            <Wheat className="h-3 w-3" />
                            LE RURAL présente
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white hover:text-gray-900"
                            aria-label="Fermer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <h2 className="relative mt-4 font-heading text-3xl font-black uppercase leading-[1.05] tracking-tight text-white">
                        SAFEB
                        <span className="mt-1 block bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">
                            2026
                        </span>
                    </h2>
                    <p className="relative mt-2 text-sm font-semibold text-white/85">
                        Salon de l'Autonomisation de la Femme Entrepreneure Rurale
                        du Bénin
                    </p>
                    <div className="relative mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/85">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5">
                            <CalendarDays className="h-3 w-3 text-amber-300" />
                            15-17 Oct 2026
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5">
                            <MapPin className="h-3 w-3 text-amber-300" />
                            Parakou, Bénin
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 sm:px-7 sm:py-6">
                    <p className="text-sm leading-relaxed text-white/70">
                        Expositions, panels, masterclass, concours de pitch,
                        rencontres B2B, village gastronomique et soirée de gala.
                        Participez en tant que panéliste, partenaire ou exposant.
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={route('safeb.index')}
                            onClick={onClose}
                            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-gray-950 shadow-lg shadow-amber-400/30 transition hover:scale-[1.01] hover:bg-amber-300"
                        >
                            Découvrir le SAFEB
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        {resolvedPdfUrl && (
                            <a
                                href={resolvedPdfUrl}
                                download
                                onClick={onClose}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/85 transition hover:bg-white/10"
                            >
                                <Download className="h-4 w-4" />
                                Brochure
                            </a>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full text-center text-[11px] font-semibold text-white/40 transition hover:text-white/70"
                    >
                        Continuer sur le site
                    </button>
                </div>
            </div>
        </div>
    );
}
