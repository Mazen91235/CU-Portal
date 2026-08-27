export type QueryModel<U = null> = {
    data?: U | null;
    includes?: string[];
    selects?: string[];
    is_and?: boolean;
    starts_with?: boolean;
    is_exact?: boolean;
    order_by?: string[];
    descending?: boolean;
    page?: number;
    limit?: number;
};
