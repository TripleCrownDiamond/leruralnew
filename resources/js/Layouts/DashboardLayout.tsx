import { useState, ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import Header from '@/Components/Dashboard/Header';
import Notifications from '@/Components/Notifications';
import PendingPurchaseChecker from '@/Components/PendingPurchaseChecker';
import PendingPurchaseBanner from '@/Components/PendingPurchaseBanner';
import PendingActionsBanner from '@/Components/Dashboard/PendingActionsBanner';
import { User } from '@/types';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { props } = usePage<any>();
    const user = props.auth.user as User & { role: string };
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Head title={title} />

            {/* Ambient background — coherent with Sidebar/Header editorial aesthetic */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '26px 26px' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />

            <PendingPurchaseChecker />
            <Notifications />

            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="relative flex flex-1 flex-col overflow-hidden">
                <Header user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                        <PendingPurchaseBanner />
                        <PendingActionsBanner />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
