import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../utils/CustomBaseQuery";
import { SetCookie } from "../../utils/CookiesManager";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type {
    UserCreateDto,
    UserGetStoredAccessTokenDto,
    UserVerifyEmailDto,
    UserTokenDetailsResponseDto,
} from "../../types/dtos/UserDtos";
import { GetApiLink } from "../../utils/LinkHandler";
export const AuthenticateAPI = createApi({
    reducerPath: "authenticateAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetApiLink("/auth"),
        credentials: "include",
    }),
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
                    if (data.success) {
                        SetCookie("google_details_token", "", -1);
                        SetCookie("oauth_state", "", -1);
                        localStorage.removeItem("user");
                        localStorage.removeItem("permissions");
                        localStorage.removeItem("is-logged-in");
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
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success) {
                        localStorage.setItem(
                            "is-logged-in",
                            JSON.stringify({
                                last_fetched: Date.now(),
                            }),
                        );
                    }
                } catch {
                    return;
                }
            },
        }),
        getGoogleStoredToken: builder.mutation<
            GenericAPIResponse<string>,
            UserGetStoredAccessTokenDto
        >({
            query: (data) => ({
                url: "/google-stored-token",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
        getGoogleAccessToken: builder.query<GenericAPIResponse<string>, void>({
            query: () => ({
                url: "/google-access-token",
                method: "GET",
                credentials: "include",
            }),
        }),
        register: builder.mutation<GenericAPIResponse, UserCreateDto>({
            query: (data) => ({
                url: "/register",
                method: "POST",
                body: data,
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const response = (await queryFulfilled).data;
                    if (response.success) {
                        SetCookie("google_details_token", "", -1);
                        SetCookie("oauth_state", "", -1);
                    }
                } catch {
                    return;
                }
            },
        }),
        verifyEmail: builder.mutation<GenericAPIResponse, UserVerifyEmailDto>({
            query: (data) => ({
                url: "/verify-email",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
        resendToken: builder.mutation<GenericAPIResponse, void>({
            query: () => ({
                url: "/resend-token",
                method: "POST",
                credentials: "include",
            }),
        }),
        getTokenDetails: builder.query<
            GenericAPIResponse<UserTokenDetailsResponseDto>,
            void
        >({
            query: () => ({
                url: "/token-details",
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyIsLoggedInQuery,
    useLazyLogoutQuery,
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendTokenMutation,
    useLazyGetTokenDetailsQuery,
} = AuthenticateAPI;
