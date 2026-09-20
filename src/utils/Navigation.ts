export const buildRedirectUrl = (path: string): string =>
    `${path}?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`;

export const getRedirectUrl = (
    redirectUrl: string | null,
    fallback: string,
): string => redirectUrl || fallback;
