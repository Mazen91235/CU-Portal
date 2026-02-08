export type Process = {
    id: string;
    name: string;
    status: "processing" | "pending" | "completed" | "failed";
    progress?: number;
    reason?: string;
    url?: string;
};
