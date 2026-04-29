import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { Button } from '@/Components/ui/button';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FileStack, Megaphone, Newspaper, Share2 } from 'lucide-react';

const shortcuts = [
    {
        title: 'Annonces',
        description: 'Gerer le fil sticky visible sur la home et les autres pages.',
        href: 'dashboard.announcements.index',
        icon: Megaphone,
    },
    {
        title: 'Emissions',
        description: 'Piloter les playlists et la mise en avant video.',
        href: 'dashboard.emissions.index',
        icon: Newspaper,
    },
    {
        title: 'Reseaux sociaux',
        description: 'Configurer les liens utilises sur la home, le footer et le menu mobile.',
        href: 'dashboard.settings.socials',
        icon: Share2,
    },
] as const;

export default function Index() {
    return (
        <DashboardLayout title="Pages statiques">
            <Head title="Pages statiques" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Contenus annexes"
                    title="Pages statiques"
                    subtitle="Le module pages n'est pas encore detaille. Les contenus publics relies sont actuellement geres via les modules ci-dessous."
                    icon={<FileStack className="h-6 w-6" />}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    {shortcuts.map((shortcut) => {
                        const Icon = shortcut.icon;
                        return (
                            <Link key={shortcut.title} href={route(shortcut.href)} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 dark:border-white/10 dark:bg-gray-900">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-5 text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{shortcut.title}</h2>
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</p>
                                <span className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">Ouvrir</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}

