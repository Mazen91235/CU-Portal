import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type {
    UserResponseDto,
    UserUpdateDto,
    UserHasPermissionsDto,
    UserUpdateAcademicDataDto,
} from "../../../types/dtos/UserDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
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
        getUserData: builder.query<
            GenericAPIResponse<UserResponseDto>,
            QueryModel
        >({
            query: (query) => ({
                url: "/me",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success) {
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
                    if (data.success) {
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
            UserHasPermissionsDto
        >({
            query: (data) => ({
                url: "/has-permissions",
                method: "POST",
                credentials: "include",
                body: data,
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
            GenericAPIResponse<UserResponseDto>,
            UserUpdateDto
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
                    if (data.success) {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
        updateUserAcademicData: builder.mutation<
            GenericAPIResponse<UserResponseDto>,
            UserUpdateAcademicDataDto
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
                    if (data.success) {
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
