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

export type SignupRequestDto = {
    name: string;
    email: string;
    phone: string;
    national_id: string;
    gender: string;
    agreed: boolean;
    early_access: boolean;
    google_details_token: string;
    url?: string;
};

export type SignupResponseDto = {
    can_resend_after: number;
};

export type LoginResponseDto = {
    access_token: string;
    access_expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
};

export type VerifyEmailResponseDto = {
    access_token: string;
    access_expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
};

export type GetVerificationDetailsResponseDto = {
    name: string;
    email: string;
    can_resend_after: number;
};

export type ResendVerificationCodeResponseDto = {
    can_resend_after: number;
};
