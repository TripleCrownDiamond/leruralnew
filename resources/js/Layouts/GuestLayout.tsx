import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center">
                    <Link href="/" className="transition-transform hover:scale-105">
                        <ApplicationLogo className="h-24 w-auto" />
                    </Link>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-lg sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Le Rural. Tous droits réservés.
                </div>
            </div>
        </div>
    );
}
