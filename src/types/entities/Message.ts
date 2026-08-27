export type Message = {
    id?: number;
    name?: string;
    email?: string;
    phone?: string | null;
    content?: string;
    created_at?: Date | null;
    updated_at?: Date | null;
};
