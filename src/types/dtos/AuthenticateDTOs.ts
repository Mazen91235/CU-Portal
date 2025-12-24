export type RefreshTokenResponseDto = {
    access_token: string;
    access_expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
};

export type GoogleAccessTokenResponseDto = {
    access_token?: string;
    expires_in?: number;
};
