import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type {
    UserResponseDto,
    UserUpdateDto,
    UserHasPermissionsDto,
    UserUpdateAcademicDataDto,
    UserDeviceActionDto,
} from "../../../types/dtos/UserDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import { GetUserApiLink } from "../../../utils/LinkHandler";
export const UserAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink(""),
        credentials: "include",
    }),
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
        registerDevice: builder.mutation<
            GenericAPIResponse,
            UserDeviceActionDto
        >({
            query: (data) => ({
                url: "/devices/register",
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        unregisterDevice: builder.mutation<
            GenericAPIResponse,
            UserDeviceActionDto
        >({
            query: (data) => ({
                url: "/devices/unregister",
                method: "POST",
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
    useRegisterDeviceMutation,
    useUnregisterDeviceMutation,
} = UserAPI;
