/**
 * Centralized CSRF helpers for fetch/XMLHttpRequest uploads.
 * Cookie token is preferred because it is refreshed after login/logout.
 */

export interface CsrfToken {
    header: 'X-CSRF-TOKEN' | 'X-XSRF-TOKEN' | null;
    token: string;
}

function getMetaCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    return document.querySelector("meta[name='csrf-token']")?.getAttribute('content') ?? '';
}

function getCookieCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const cookieMatch = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    return cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
}

export function getCsrfToken(): CsrfToken {
    const cookieToken = getCookieCsrfToken();
    if (cookieToken) {
        return { header: 'X-XSRF-TOKEN', token: cookieToken };
    }

    const metaToken = getMetaCsrfToken();
    if (metaToken) {
        return { header: 'X-CSRF-TOKEN', token: metaToken };
    }

    return { header: null, token: '' };
}

export function getCsrfHeaders(): Record<string, string> {
    const csrf = getCsrfToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (csrf.header && csrf.token) {
        headers[csrf.header] = csrf.token;
    }

    return headers;
}

/**
 * Only append _token when we rely on the meta token.
 * If cookie token exists, rely on X-XSRF-TOKEN header only.
 */
export function appendCsrfToFormData(formData: FormData): void {
    if (getCookieCsrfToken()) {
        return;
    }

    const metaToken = getMetaCsrfToken();
    if (metaToken && !formData.has('_token')) {
        formData.append('_token', metaToken);
    }
}

export function configureCsrfXhr(xhr: XMLHttpRequest): void {
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    const csrf = getCsrfToken();
    if (csrf.header && csrf.token) {
        xhr.setRequestHeader(csrf.header, csrf.token);
    }
}

export function isCsrfError(status: number): boolean {
    return status === 419;
}

export function handleCsrfError(onError?: (message: string) => void): void {
    const message = 'Session expiree. La page va se recharger...';

    if (onError) {
        onError(message);
    } else {
        alert(message);
    }

    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

export async function refreshCsrfCookie(): Promise<void> {
    try {
        await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
    } catch {
        // noop
    }
}

export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const request = async () => {
        const headers: Record<string, string> = {
            ...getCsrfHeaders(),
            ...((options.headers as Record<string, string>) || {}),
        };

        return fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin',
        });
    };

    let response = await request();
    if (!isCsrfError(response.status)) {
        return response;
    }

    await refreshCsrfCookie();
    response = await request();

    if (isCsrfError(response.status)) {
        handleCsrfError();
        throw new Error('CSRF token mismatch');
    }

    return response;
}

export function uploadFileWithProgress(
    url: string,
    file: File,
    options: {
        onProgress?: (percent: number) => void;
        onSuccess?: (response: any) => void;
        onError?: (error: string) => void;
        fieldName?: string;
    } = {},
): { xhr: XMLHttpRequest; abort: () => void } {
    const { onProgress, onSuccess, onError, fieldName = 'file' } = options;
    const xhr = new XMLHttpRequest();

    const formData = new FormData();
    formData.append(fieldName, file);
    appendCsrfToFormData(formData);

    xhr.open('POST', url, true);
    xhr.responseType = 'json';
    xhr.withCredentials = true;

    configureCsrfXhr(xhr);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
        }
    };

    xhr.onload = () => {
        const status = xhr.status ?? 0;

        if (isCsrfError(status)) {
            handleCsrfError(onError);
            return;
        }

        if (status < 200 || status >= 300) {
            const message = xhr.response?.message || `Erreur upload (${status})`;
            onError?.(message);
            return;
        }

        onSuccess?.(xhr.response ?? {});
    };

    xhr.onerror = () => {
        onError?.('Erreur reseau lors de l\'upload');
    };

    xhr.send(formData);

    return {
        xhr,
        abort: () => xhr.abort(),
    };
}
