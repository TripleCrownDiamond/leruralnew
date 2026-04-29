import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
    type: ToastType;
    text: string;
}

interface NotificationsProps {
    className?: string;
}

const TOAST_DURATION = 5200;

export default function Notifications({ className = '' }: NotificationsProps) {
    const { props } = usePage<any>();
    const flash = (props.flash ?? {}) as FlashMessage;

    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<ToastMessage | null>(null);

    useEffect(() => {
        if (flash.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
            return;
        }

        if (flash.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
            return;
        }

        if (flash.warning) {
            setMessage({ type: 'warning', text: flash.warning });
            setVisible(true);
            return;
        }

        if (flash.info) {
            setMessage({ type: 'info', text: flash.info });
            setVisible(true);
        }
    }, [flash.success, flash.error, flash.warning, flash.info]);

    useEffect(() => {
        if (!visible) return;

        const timer = window.setTimeout(() => {
            setVisible(false);
            window.setTimeout(() => setMessage(null), 220);
        }, TOAST_DURATION);

        return () => window.clearTimeout(timer);
    }, [visible]);

    const config = useMemo(() => {
        switch (message?.type) {
            case 'success':
                return {
                    title: 'Succes',
                    icon: <CheckCircle2 className="h-5 w-5" />,
                    shell: 'border-emerald-200/80 bg-white/95 text-emerald-900 dark:border-emerald-500/25 dark:bg-gray-950/95 dark:text-emerald-100',
                    badge: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.7)]',
                    strip: 'from-emerald-500/85 to-emerald-700/85',
                    close: 'hover:bg-emerald-500/10 focus:ring-emerald-500/40',
                };
            case 'error':
                return {
                    title: 'Erreur',
                    icon: <XCircle className="h-5 w-5" />,
                    shell: 'border-red-200/80 bg-white/95 text-red-900 dark:border-red-500/25 dark:bg-gray-950/95 dark:text-red-100',
                    badge: 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_10px_24px_-10px_rgba(239,68,68,0.7)]',
                    strip: 'from-red-500/85 to-red-700/85',
                    close: 'hover:bg-red-500/10 focus:ring-red-500/40',
                };
            case 'warning':
                return {
                    title: 'Alerte',
                    icon: <AlertTriangle className="h-5 w-5" />,
                    shell: 'border-amber-200/80 bg-white/95 text-amber-900 dark:border-amber-500/25 dark:bg-gray-950/95 dark:text-amber-100',
                    badge: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_10px_24px_-10px_rgba(245,158,11,0.7)]',
                    strip: 'from-amber-400/85 to-amber-600/85',
                    close: 'hover:bg-amber-500/10 focus:ring-amber-500/40',
                };
            case 'info':
            default:
                return {
                    title: 'Info',
                    icon: <Info className="h-5 w-5" />,
                    shell: 'border-sky-200/80 bg-white/95 text-sky-900 dark:border-sky-500/25 dark:bg-gray-950/95 dark:text-sky-100',
                    badge: 'bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-[0_10px_24px_-10px_rgba(59,130,246,0.7)]',
                    strip: 'from-sky-500/85 to-blue-700/85',
                    close: 'hover:bg-sky-500/10 focus:ring-sky-500/40',
                };
        }
    }, [message?.type]);

    if (!message || !visible) return null;

    const closeToast = () => {
        setVisible(false);
        window.setTimeout(() => setMessage(null), 220);
    };

    return (
        <div className={`fixed right-3 top-3 z-[90] w-[min(92vw,28rem)] sm:right-5 sm:top-5 ${className}`}>
            <div
                role="status"
                className={`relative overflow-hidden rounded-2xl border shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 ${
                    visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                } ${config.shell}`}
            >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.strip}`} />

                <div className="flex items-start gap-3 px-4 pb-4 pt-3.5 sm:px-5">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.badge}`}>
                        {config.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-75">{config.title}</p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed">{message.text}</p>
                    </div>

                    <button
                        type="button"
                        onClick={closeToast}
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-current/70 transition-colors focus:outline-none focus:ring-2 ${config.close}`}
                        aria-label="Fermer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
