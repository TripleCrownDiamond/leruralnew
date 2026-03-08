import { useState, ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import Header from '@/Components/Dashboard/Header';
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
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Head title={title} />
            
            {/* Sidebar */}
            <Sidebar 
                user={user} 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
            />

            {/* Content Area */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header 
                    user={user} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
