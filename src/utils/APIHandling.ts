export const maxRetries = 3;
export const timeout = 5000;
export const retryCondition = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __: unknown,
) => {
    const statuses = ["TIMEOUT_ERROR"];
    const status = "status" in error ? error.status : undefined;
    const statusStr = typeof status == "string" ? status : "";
    const statusNum = typeof status == "number" ? status : 0;
    return statuses.includes(statusStr) || statusNum >= 500;
};
