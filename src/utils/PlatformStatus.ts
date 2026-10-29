export const isPlatformSuspended = () =>
    String(import.meta.env.VITE_SUSPENDED).toLowerCase() === "true";