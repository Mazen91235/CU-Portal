import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { User } from "../../../types/entities/User";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    UserResponseDto,
    UsersDataResponseDto,
    UsersUpdateDto,
} from "../../../types/dtos/UserDTOs";
import type { UserSearchDto } from "../../../types/dtos/UserDTOs";
export const AdminUserAPI = createApi({
    reducerPath: "adminUserAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/users"),
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getUsers: builder.query<GenericAPIResponse<User[]>, UserSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getUsersData: builder.query<
            GenericAPIResponse<UsersDataResponseDto>,
            void
        >({
            query: () => ({
                url: "/data",
                method: "GET",
                credentials: "include",
            }),
        }),
        getUser: builder.query<
            GenericAPIResponse<UserResponseDto>,
            { user_id: number }
        >({
            query: ({ user_id }) => ({
                url: `/${user_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchUsers: builder.query<GenericAPIResponse<User[]>, UserSearchDto>({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        updateUsers: builder.mutation<GenericAPIResponse<User>, UsersUpdateDto>(
            {
                query: (data) => ({
                    url: `/`,
                    method: "PATCH",
                    credentials: "include",
                    body: data,
                }),
            },
        ),
    }),
});

export const {
    useLazyGetUsersQuery,
    useLazyGetUsersDataQuery,
    useLazyGetUserQuery,
    useLazySearchUsersQuery,
    useUpdateUsersMutation,
} = AdminUserAPI;
