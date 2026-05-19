import { getCsrfHeaders } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Radio, Settings, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    url: string | null;
    thumbnail: string | null;
    read: boolean;
    created_at: string;
    created_human: string;
}

interface NotificationBellProps {
    className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
    live_started: <Radio className="h-4 w-4 text-red-500" />,
    live_reminder: <Radio className="h-4 w-4 text-amber-500" />,
    new_article: <Bell className="h-4 w-4 text-primary" />,
    general: <Bell className="h-4 w-4 text-gray-500" />,
};

const typeColors: Record<string, string> = {
    live_started: 'bg-red-500/10 border-red-500/20',
    live_reminder: 'bg-amber-500/10 border-amber-500/20',
    new_article: 'bg-primary/10 border-primary/20',
    general: 'bg-gray-100 border-gray-200 dark:bg-white/5 dark:border-white/10',
};

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<number | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(route('notifications.index'), {
                headers: getCsrfHeaders(),
                credentials: 'same-origin',
            });

            if (!response.ok) return;

            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    }, []);

    // Chargement initial et polling
    useEffect(() => {
        fetchNotifications();

        // Poll toutes les 30 secondes
        pollIntervalRef.current = window.setInterval(fetchNotifications, 30000);

        return () => {
            if (pollIntervalRef.current) {
                window.clearInterval(pollIntervalRef.current);
            }
        };
    }, [fetchNotifications]);

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(route('notifications.read', { id }), {
                method: 'POST',
                headers: getCsrfHeaders(),
                credentials: 'same-origin',
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erreur marquage notification:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await fetch(route('notifications.read-all'), {
                method: 'POST',
                headers: getCsrfHeaders(),
                credentials: 'same-origin',
            });

            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur marquage notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            await fetch(route('notifications.destroy', { id }), {
                method: 'DELETE',
                headers: getCsrfHeaders(),
                credentials: 'same-origin',
            });

            const notification = notifications.find((n) => n.id === id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            
            if (notification && !notification.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Erreur suppression notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        if (notification.url) {
            setIsOpen(false);
            router.visit(notification.url);
        }
    };

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Bouton cloche */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary/30"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />

                {/* Badge compteur */}
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Animation pulse si notifications non lues */}
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-5 w-5 animate-ping rounded-full bg-red-500/50" />
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900 sm:w-96">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white">
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary transition hover:bg-primary/20"
                                >
                                    <CheckCheck className="h-3 w-3" />
                                    Tout lire
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Liste des notifications */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Aucune notification
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            'group relative cursor-pointer px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-white/5',
                                            !notification.read && 'bg-primary/5 dark:bg-primary/10'
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icône */}
                                            <div
                                                className={cn(
                                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                                                    typeColors[notification.type] || typeColors.general
                                                )}
                                            >
                                                {typeIcons[notification.type] || typeIcons.general}
                                            </div>

                                            {/* Contenu */}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={cn(
                                                        'line-clamp-2 text-sm',
                                                        notification.read
                                                            ? 'text-gray-600 dark:text-gray-400'
                                                            : 'font-semibold text-gray-900 dark:text-white'
                                                    )}
                                                >
                                                    {notification.message}
                                                </p>
                                                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                                    {notification.created_human}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex shrink-0 items-start gap-1 opacity-0 transition group-hover:opacity-100">
                                                {!notification.read && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        className="rounded-full p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => deleteNotification(notification.id, e)}
                                                    className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Indicateur non lu */}
                                        {!notification.read && (
                                            <div className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-2 dark:border-white/10">
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-black uppercase tracking-[0.1em] text-gray-500 transition hover:bg-gray-50 hover:text-primary dark:text-gray-400 dark:hover:bg-white/5"
                        >
                            <Settings className="h-3.5 w-3.5" />
                            Gérer les préférences
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}