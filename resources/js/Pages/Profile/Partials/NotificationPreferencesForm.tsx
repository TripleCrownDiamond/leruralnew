import { getCsrfHeaders } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import { Bell, Loader2, Mail, Radio, Save, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationPreferences {
    live_start_email: boolean;
    live_start_push: boolean;
    live_reminder_email: boolean;
    live_reminder_push: boolean;
    new_article_email: boolean;
    new_article_push: boolean;
    subscription_email: boolean;
    marketing_email: boolean;
}

const defaultPreferences: NotificationPreferences = {
    live_start_email: true,
    live_start_push: true,
    live_reminder_email: true,
    live_reminder_push: true,
    new_article_email: false,
    new_article_push: true,
    subscription_email: true,
    marketing_email: false,
};

interface PreferenceRowProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    emailKey: keyof NotificationPreferences;
    pushKey: keyof NotificationPreferences;
    preferences: NotificationPreferences;
    onChange: (key: keyof NotificationPreferences, value: boolean) => void;
}

function PreferenceRow({
    icon,
    title,
    description,
    emailKey,
    pushKey,
    preferences,
    onChange,
}: PreferenceRowProps) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 pl-13 sm:pl-0">
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences[emailKey]}
                        onChange={(e) => onChange(emailKey, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email
                    </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences[pushKey]}
                        onChange={(e) => onChange(pushKey, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <Smartphone className="h-4 w-4" />
                        Site
                    </span>
                </label>
            </div>
        </div>
    );
}

export default function NotificationPreferencesForm() {
    const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les préférences actuelles
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const response = await fetch(route('notifications.preferences'), {
                    headers: getCsrfHeaders(),
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const data = await response.json();
                    setPreferences({ ...defaultPreferences, ...data.preferences });
                }
            } catch (err) {
                console.error('Erreur chargement préférences:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, []);

    const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            const response = await fetch(route('notifications.preferences.update'), {
                method: 'PUT',
                headers: {
                    ...getCsrfHeaders(),
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <header>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Bell className="h-5 w-5 text-primary" />
                    Préférences de notification
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Choisissez comment vous souhaitez être notifié des événements importants.
                </p>
            </header>

            <div className="space-y-4">
                <PreferenceRow
                    icon={<Radio className="h-5 w-5" />}
                    title="Démarrage des lives"
                    description="Soyez averti quand une émission en direct commence"
                    emailKey="live_start_email"
                    pushKey="live_start_push"
                    preferences={preferences}
                    onChange={handleChange}
                />

                <PreferenceRow
                    icon={<Radio className="h-5 w-5" />}
                    title="Rappels de live"
                    description="Recevez un rappel 15 minutes avant le début d'un live"
                    emailKey="live_reminder_email"
                    pushKey="live_reminder_push"
                    preferences={preferences}
                    onChange={handleChange}
                />

                <PreferenceRow
                    icon={<Bell className="h-5 w-5" />}
                    title="Nouveaux articles"
                    description="Soyez informé des nouveaux articles publiés"
                    emailKey="new_article_email"
                    pushKey="new_article_push"
                    preferences={preferences}
                    onChange={handleChange}
                />

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Emails de compte</h4>
                            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                                Confirmations d'abonnement, factures et informations importantes
                            </p>
                        </div>
                    </div>
                    <div className="pl-13">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={preferences.subscription_email}
                                onChange={(e) => handleChange('subscription_email', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Recevoir les emails transactionnels
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Communications marketing</h4>
                            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                                Offres spéciales, promotions et actualités du groupe
                            </p>
                        </div>
                    </div>
                    <div className="pl-13">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={preferences.marketing_email}
                                onChange={(e) => handleChange('marketing_email', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Recevoir les emails marketing
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-lg transition',
                        saving
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-primary hover:bg-primary/90 shadow-primary/25'
                    )}
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>

                {saved && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ✓ Préférences enregistrées
                    </span>
                )}
            </div>
        </section>
    );
}