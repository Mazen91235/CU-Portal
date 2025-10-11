import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SetCookie } from "../../utils/CookiesManager";
import type { LogoutAPIResponse, RefreshAPIResponse } from "../../types/AuthenticateAPITypes";
export const AuthenticateAPI = createApi({
    reducerPath: "authenticateAPI",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/auth" }),
    endpoints: (builder) => ({
        logout: builder.mutation<LogoutAPIResponse, void>({
            query: (access_token) => ({
                url: "/logout",
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access_token}`
                },
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const data: LogoutAPIResponse = (await queryFulfilled).data;
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
        refreshToken: builder.mutation<RefreshAPIResponse, string>({
            query: (refreshToken) => ({
                url: "/refresh",
                method: "POST",
                body: { refresh_token: refreshToken },
                credentials: "include",
            }),
        }),
    }),
});

export const { useRefreshTokenMutation, useLogoutMutation } = AuthenticateAPI;
