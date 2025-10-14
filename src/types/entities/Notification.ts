export type Notification = {
    id?: number;
    content?: string;
    type?: string;
    parent_id?: number | null;
    url?: string;
    created_at?: string;
};