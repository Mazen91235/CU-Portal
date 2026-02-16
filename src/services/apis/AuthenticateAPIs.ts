import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { SetCookie } from "../../utils/CookiesManager";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type {
    GoogleAccessTokenResponseDto,
    RefreshTokenResponseDto,
    SignupRequestDto,
    SignupResponseDto,
    VerifyEmailResponseDto,
    GetVerificationDetailsResponseDto,
    ResendVerificationCodeResponseDto,
} from "../../types/dtos/AuthenticateDTOs";
import { GetApiLink } from "../../utils/LinkHandler";
export const AuthenticateAPI = createApi({
    reducerPath: "authenticateAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetApiLink("/auth"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        logout: builder.query<GenericAPIResponse, void>({
            query: () => ({
                url: "/logout",
                method: "GET",
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const data = (await queryFulfilled).data;
                    if (data.status == "success") {
                        SetCookie("google_details_token", "", -1);
                        SetCookie("oauth_state", "", -1);
                    }
                } catch {
                    return;
                }
            },
        }),
        isLoggedIn: builder.query<GenericAPIResponse, void>({
            query: () => ({
                url: "/is-logged-in",
                method: "GET",
                credentials: "include",
            }),
        }),
        refreshToken: builder.mutation<
            GenericAPIResponse<RefreshTokenResponseDto>,
            string
        >({
            query: (refreshToken) => ({
                url: "/refresh",
                method: "POST",
                body: { refresh_token: refreshToken },
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const data = (await queryFulfilled).data;
                    if (data.status == "success") {
                        SetCookie(
                            "access_token",
                            data.data?.access_token || "",
                            data.data?.access_expires_in || 0,
                        );
                    }
                } catch {
                    return;
                }
            },
        }),
        getGoogleStoredToken: builder.mutation<
            GenericAPIResponse<GoogleAccessTokenResponseDto>,
            { oauth_state: string; google_details_token: string }
        >({
            query: ({ oauth_state, google_details_token }) => ({
                url: "/get-google-stored-token",
                method: "POST",
                body: { oauth_state, google_details_token },
                credentials: "include",
            }),
        }),
        getGoogleAccessToken: builder.query<
            GenericAPIResponse<GoogleAccessTokenResponseDto>,
            void
        >({
            query: () => ({
                url: "/get-google-access-token",
                method: "GET",
                credentials: "include",
            }),
        }),
        signup: builder.mutation<
            GenericAPIResponse<SignupResponseDto>,
            SignupRequestDto
        >({
            query: (data) => ({
                url: "/signup",
                method: "POST",
                body: data,
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const response = (await queryFulfilled).data;
                    if (response.status === "success" && response.data) {
                        SetCookie("google_details_token", "", -1);
                        SetCookie("oauth_state", "", -1);
                    }
                } catch {
                    return;
                }
            },
        }),
        verifyEmail: builder.mutation<
            GenericAPIResponse<VerifyEmailResponseDto>,
            { code: string }
        >({
            query: (data) => ({
                url: "/verify-email",
                method: "POST",
                body: data,
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const response = (await queryFulfilled).data;
                    if (response.status === "success" && response.data) {
                        SetCookie(
                            "access_token",
                            response.data.access_token || "",
                            response.data.access_expires_in || 0,
                        );
                        SetCookie(
                            "refresh_token",
                            response.data.refresh_token || "",
                            response.data.refresh_expires_in || 0,
                        );
                    }
                } catch {
                    return;
                }
            },
        }),
        resendVerificationCode: builder.mutation<
            GenericAPIResponse<ResendVerificationCodeResponseDto>,
            void
        >({
            query: () => ({
                url: "/resend-verification-code",
                method: "POST",
                credentials: "include",
            }),
        }),
        getVerificationDetails: builder.query<
            GenericAPIResponse<GetVerificationDetailsResponseDto>,
            void
        >({
            query: () => ({
                url: "/get-verification-details",
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyIsLoggedInQuery,
    useRefreshTokenMutation,
    useLazyLogoutQuery,
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useSignupMutation,
    useVerifyEmailMutation,
    useResendVerificationCodeMutation,
    useLazyGetVerificationDetailsQuery,
} = AuthenticateAPI;
