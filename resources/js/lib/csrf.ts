/**
 * Utilitaire centralisé pour la gestion des tokens CSRF
 * Résout les problèmes de "CSRF token mismatch" en production
 */

export interface CsrfToken {
    header: 'X-CSRF-TOKEN' | 'X-XSRF-TOKEN' | null;
    token: string;
}

/**
 * Récupère le token CSRF depuis la meta tag ou le cookie XSRF-TOKEN
 */
export function getCsrfToken(): CsrfToken {
    if (typeof document === 'undefined') {
        return { header: null, token: '' };
    }

    // Priorité 1: Meta tag csrf-token (injecté par Laravel Blade)
    const metaToken = document.querySelector("meta[name='csrf-token']")?.getAttribute('content') ?? '';
    if (metaToken) {
        return { header: 'X-CSRF-TOKEN', token: metaToken };
    }

    // Priorité 2: Cookie XSRF-TOKEN (utilisé par Sanctum)
    const cookieMatch = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    if (cookieMatch) {
        return { header: 'X-XSRF-TOKEN', token: decodeURIComponent(cookieMatch[1]) };
    }

    return { header: null, token: '' };
}

/**
 * Retourne les headers nécessaires pour une requête AJAX avec CSRF
 */
export function getCsrfHeaders(): Record<string, string> {
    const csrf = getCsrfToken();
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (csrf.header && csrf.token) {
        headers[csrf.header] = csrf.token;
    }

    return headers;
}

/**
 * Ajoute le token CSRF à un FormData
 */
export function appendCsrfToFormData(formData: FormData): void {
    const csrf = getCsrfToken();
    if (csrf.token) {
        formData.append('_token', csrf.token);
    }
}

/**
 * Configure un XMLHttpRequest avec les headers CSRF appropriés
 */
export function configureCsrfXhr(xhr: XMLHttpRequest): void {
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    const csrf = getCsrfToken();
    if (csrf.header && csrf.token) {
        xhr.setRequestHeader(csrf.header, csrf.token);
    }
}

/**
 * Vérifie si une erreur est une erreur CSRF (code 419)
 */
export function isCsrfError(status: number): boolean {
    return status === 419;
}

/**
 * Gère une erreur CSRF en proposant un rechargement de page
 */
export function handleCsrfError(onError?: (message: string) => void): void {
    const message = 'Session expirée. La page va se recharger...';
    
    if (onError) {
        onError(message);
    } else {
        alert(message);
    }
    
    // Recharger la page après un court délai pour obtenir un nouveau token
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

/**
 * Effectue une requête fetch avec gestion automatique du CSRF
 */
export async function csrfFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const csrf = getCsrfToken();
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers as Record<string, string> || {}),
    };

    if (csrf.header && csrf.token) {
        headers[csrf.header] = csrf.token;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
    });

    // Gestion automatique de l'erreur CSRF
    if (isCsrfError(response.status)) {
        handleCsrfError();
        throw new Error('CSRF token mismatch');
    }

    return response;
}

/**
 * Upload un fichier avec gestion robuste du CSRF
 * Utilise XMLHttpRequest pour le suivi de progression
 */
export function uploadFileWithProgress(
    url: string,
    file: File,
    options: {
        onProgress?: (percent: number) => void;
        onSuccess?: (response: any) => void;
        onError?: (error: string) => void;
        fieldName?: string;
    } = {}
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
        onError?.('Erreur réseau lors de l\'upload');
    };

    xhr.send(formData);

    return {
        xhr,
        abort: () => xhr.abort(),
    };
}