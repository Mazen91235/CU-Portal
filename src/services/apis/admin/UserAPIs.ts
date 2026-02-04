import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { User } from "../../../types/entities/User";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    UserResponseDto,
    UsersDataResponseDto,
    UsersUpdateDto,
} from "../../../types/dtos/UserDTOs";
import type { UserSearchDto } from "../../../types/dtos/UserDTOs";
export const AdminUserAPI = createApi({
    reducerPath: "adminUserAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/users"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
