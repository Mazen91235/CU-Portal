export type Notification = {
    id?: number;
    content?: string;
    type?: string;
    parent_id?: number | null;
    url?: string | null;
    seen?: boolean;
    created_at?: string | null;
};
