import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { User } from "../../../types/entities/User";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const UserAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink(""),
            timeout,
            credentials: "include",
        }),
        {
            maxRetries,
            //@ts-expect-error RTK Query's types don't account for this parameter
            retryCondition,
        },
    ),
    endpoints: (builder) => ({
        getUserData: builder.query<GenericAPIResponse<User>, void>({
            query: () => ({
                url: "/data",
                method: "GET",
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
                        const user = data.data;
                        localStorage.setItem(
                            "user",
                            JSON.stringify({
                                ...user,
                                last_fetched: Date.now(),
                            }),
                        );
                    }
                } catch {
                    return;
                }
            },
        }),
        getUserPermissions: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: "/permissions",
                method: "GET",
                credentials: "include",
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
                        const permissions = data.data;
                        localStorage.setItem(
                            "permissions",
                            JSON.stringify({
                                permissions,
                                last_fetched: Date.now(),
                            }),
                        );
                    }
                } catch {
                    return;
                }
            },
        }),
        checkUserHasPermissions: builder.mutation<
            GenericAPIResponse<boolean>,
            { permissions: string[] }
        >({
            query: ({ permissions }) => ({
                url: "/has-permissions",
                method: "POST",
                credentials: "include",
                body: { permissions },
            }),
        }),
        changeGoogleAccount: builder.query<GenericAPIResponse, void>({
            query: () => ({
                url: "/change-google-account",
                method: "GET",
                credentials: "include",
            }),
        }),
        updateUserData: builder.mutation<
            GenericAPIResponse<User>,
            { name?: string; url?: string }
        >({
            query: (data) => ({
                url: "/",
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
        updateUserAcademicData: builder.mutation<
            GenericAPIResponse<User>,
            {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
                study_type?: string;
            }
        >({
            query: (data) => ({
                url: "/academic-data",
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
    }),
});

export const {
    useLazyGetUserDataQuery,
    useLazyGetUserPermissionsQuery,
    useCheckUserHasPermissionsMutation,
    useLazyChangeGoogleAccountQuery,
    useUpdateUserDataMutation,
    useUpdateUserAcademicDataMutation,
} = UserAPI;
