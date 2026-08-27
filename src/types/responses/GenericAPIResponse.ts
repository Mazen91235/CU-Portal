export type GenericAPIResponse<T = null> = {
    success: boolean;
    code?: number | null;
    message?: string | null;
    error?: string | null;
    data?: T | null;
    next_page?: boolean | null;
};
