export type LogoutAPIResponse = {
    status: "success" | "error",
    message: string
};
export type RefreshAPIResponse = {
    status: "success" | "error",
    message: string,
    data: {
        access_token: string
        access_expires_in: number,
        refresh_token: string
        refresh_expires_in: number
    }
};
export type GoogleAccessTokenResponse = {
    status: "success" | "error",
    message: string,
    data?: {
        access_token?: string,
        expires_in?: number,
    }
};