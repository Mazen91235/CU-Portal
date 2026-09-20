export type Token = {
    id?: number;
    token?: string;
    is_valid?: boolean;
    expire_at?: string | null;
    type?: number;
    details?: object;
};
