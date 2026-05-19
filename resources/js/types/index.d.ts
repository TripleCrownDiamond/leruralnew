import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    permissions?: string[];
}

export interface SeoData {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    locale?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        has_active_subscription?: boolean;
    };
    seo?: SeoData;
    ziggy: Config & { location: string };
};
