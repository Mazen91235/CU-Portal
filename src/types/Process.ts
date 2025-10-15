export type Process = {
    id?: string;
    name?: string;
    status?: "pending" | "in_progress" | "completed" | "failed";
    progress?: number;
    reason?: string;
    url?: string;
};