export type GenericAPIResponse<T = null> = {
    success: boolean;
    code?: number | null;
    message?: string | null;
    error?: string | null;
    data?: T | null;
    next_page?: boolean | null;
};


/** RTK Query's rejected response shape used by the error handlers. */
export type DefaultAPIResponse = {
    data?: any;
    error?: any;
    status?: number | string;
};
