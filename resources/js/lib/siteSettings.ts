export type SettingsMap = Record<string, string | null | undefined>;

export function asBool(value: string | null | undefined, fallback = true): boolean {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function normalizeUrl(url?: string | null): string | null {
    if (!url) {
        return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
        return null;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return `https://${trimmed}`;
}

export const socialSettingKeys = [
    { key: 'social_facebook_url', label: 'Facebook' },
    { key: 'social_x_url', label: 'X' },
    { key: 'social_instagram_url', label: 'Instagram' },
    { key: 'social_tiktok_url', label: 'TikTok' },
    { key: 'social_whatsapp_url', label: 'WhatsApp' },
    { key: 'social_linkedin_url', label: 'LinkedIn' },
] as const;
