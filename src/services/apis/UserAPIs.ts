import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type { User } from "../../types/entities/User";
import type { RootState } from "../redux/Store";
export const UserAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/user",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getUserData: builder.query<GenericAPIResponse<User>, void>({
            query: () => ({
                url: "/get-user-data",
                method: "GET",
                credentials: "include",
            }),
        }),
        getUserPermissions: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: "/get-user-permissions",
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetUserDataQuery, useLazyGetUserPermissionsQuery } = UserAPI;
