const MOBILE_DEVICE_MAX_WIDTH = 1024;

export const isMobile = (): boolean =>
    typeof window !== "undefined" && window.innerWidth < MOBILE_DEVICE_MAX_WIDTH;
