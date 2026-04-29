import { ComponentPropsWithoutRef, ReactNode, forwardRef } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
    primary:
        'bg-gradient-to-br from-primary to-emerald-700 text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:from-primary hover:to-emerald-600',
    secondary:
        'bg-white text-gray-900 ring-1 ring-inset ring-gray-200 hover:ring-primary/40 hover:bg-primary/[0.04] hover:text-primary dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-primary',
    ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white',
    danger:
        'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100 hover:ring-red-300 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20 dark:hover:bg-red-500/20',
};

const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-[11px]',
    md: 'h-11 px-4 text-xs',
    lg: 'h-12 px-5 text-xs',
};

const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-full font-black uppercase tracking-[0.14em] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50';

interface CommonProps {
    variant?: Variant;
    size?: Size;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
}

type AdminButtonProps = CommonProps & ComponentPropsWithoutRef<'button'>;

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
    ({ variant = 'primary', size = 'md', icon, children, className, type = 'button', ...rest }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(baseClass, variants[variant], sizes[size], className)}
            {...rest}
        >
            {icon}
            {children}
        </button>
    )
);
AdminButton.displayName = 'AdminButton';

interface AdminLinkButtonProps extends CommonProps {
    href: string;
    as?: 'a' | 'link';
    target?: string;
    rel?: string;
}

export function AdminLinkButton({
    href,
    as = 'link',
    variant = 'primary',
    size = 'md',
    icon,
    children,
    className,
    target,
    rel,
}: AdminLinkButtonProps) {
    const classes = cn(baseClass, variants[variant], sizes[size], className);

    if (as === 'a') {
        return (
            <a href={href} target={target} rel={rel} className={classes}>
                {icon}
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={classes}>
            {icon}
            {children}
        </Link>
    );
}

export default AdminButton;
