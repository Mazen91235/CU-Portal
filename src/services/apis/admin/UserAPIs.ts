import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    UserResponseDto,
    UserSearchDto,
    UserGetUserWithDetailsDto,
    UserStatisticsResponseDto,
    UserUpdateUsersDto,
} from "../../../types/dtos/UserDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminUserAPI = createApi({
    reducerPath: "adminUserAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/users"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getUsers: builder.query<
            GenericAPIResponse<UserResponseDto[]>,
            QueryModel<UserSearchDto>
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
        }),
        getUserStatistics: builder.query<
            GenericAPIResponse<UserStatisticsResponseDto>,
            QueryModel<UserSearchDto>
        >({
            query: (query) => ({
                url: "/statistics",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
        }),
        getUser: builder.query<
            GenericAPIResponse<UserGetUserWithDetailsDto>,
            { user_id: number }
        >({
            query: ({ user_id }) => ({
                url: `/${user_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        updateUsers: builder.mutation<GenericAPIResponse, UserUpdateUsersDto>({
            query: (data) => ({
                url: `/`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        suspendUser: builder.mutation<GenericAPIResponse, { user_id: number }>({
            query: ({ user_id }) => ({
                url: `/${user_id}/suspend`,
                method: "PATCH",
                credentials: "include",
            }),
        }),
        unsuspendUser: builder.mutation<
            GenericAPIResponse,
            { user_id: number }
        >({
            query: ({ user_id }) => ({
                url: `/${user_id}/unsuspend`,
                method: "PATCH",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetUsersQuery,
    useLazyGetUserStatisticsQuery,
    useLazyGetUserQuery,
    useUpdateUsersMutation,
    useSuspendUserMutation,
    useUnsuspendUserMutation,
} = AdminUserAPI;
