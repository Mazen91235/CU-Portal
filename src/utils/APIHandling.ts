export const maxRetries = 3;
export const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000; // 60 seconds
export const retryCondition = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    _: unknown,
    { attempt }: { attempt: number },
) => {
    const statuses = ["TIMEOUT_ERROR"];
    const status = "status" in error ? error.status : undefined;
    const statusStr = typeof status == "string" ? status : "";
    const statusNum = typeof status == "number" ? status : 0;
    return (
        (statuses.includes(statusStr) || statusNum >= 500) &&
        attempt < maxRetries
    );
};
