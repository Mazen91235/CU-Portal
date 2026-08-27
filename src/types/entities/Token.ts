export type Token = {
    id?: number;
    token?: Date;
    is_valid?: boolean;
    expire_at?: Date | null;
    type?: number;
    details?: object;
}