export type GenericAPIResponse<T = null> = {
    status: "success" | "error",
    message: string,
    data?: T | null
};
