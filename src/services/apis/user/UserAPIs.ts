import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { User } from "../../../types/entities/User";
import { GetUserApiLink } from "../../../utils/LinkHandler";
export const UserAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink(""),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getUserData: builder.query<GenericAPIResponse<User>, void>({
            query: () => ({
                url: "/data",
                method: "GET",
                credentials: "include",
            }),
        }),
        getUserPermissions: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: "/permissions",
                method: "GET",
                credentials: "include",
            }),
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
