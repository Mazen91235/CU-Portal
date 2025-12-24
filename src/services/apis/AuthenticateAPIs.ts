import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SetCookie } from "../../utils/CookiesManager";
import type { RootState } from "../redux/Store";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type {
    GoogleAccessTokenResponseDto,
    RefreshTokenResponseDto,
} from "../../types/dtos/AuthenticateDTOs";
import { GetApiLink } from "../../utils/LinkHandler";
export const AuthenticateAPI = createApi({
    reducerPath: "authenticateAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetApiLink("/auth"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        logout: builder.mutation<GenericAPIResponse, void>({
            query: () => ({
                url: "/logout",
                method: "POST",
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const data = (await queryFulfilled).data;
                    if (data.status == "success") {
                        SetCookie("access_token", "", -1);
                        SetCookie("refresh_token", "", -1);
                        SetCookie("google_details_token", "", -1);
                        SetCookie("oauth_state", "", -1);
                    }
                } catch {
                    return;
                }
            },
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
                            data.data?.access_expires_in || 0
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
    }),
});

export const {
    useRefreshTokenMutation,
    useLogoutMutation,
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
} = AuthenticateAPI;
