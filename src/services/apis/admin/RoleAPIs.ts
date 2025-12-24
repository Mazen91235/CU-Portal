import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Role } from "../../../types/entities/Role";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { RoleSearchDto } from "../../../types/dtos/RoleDTOs";
export const AdminRoleAPI = createApi({
    reducerPath: "adminRoleAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/roles"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getRoles: builder.query<GenericAPIResponse<Role[]>, RoleSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getRole: builder.query<GenericAPIResponse<Role>, { role_id: number }>({
            query: ({ role_id }) => ({
                url: `/${role_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchRoles: builder.query<GenericAPIResponse<Role[]>, RoleSearchDto>({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        countPermissions: builder.query<GenericAPIResponse<number>, void>({
            query: () => ({
                url: `/count-permissions`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createRole: builder.mutation<GenericAPIResponse<Role>, Role>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateRole: builder.mutation<
            GenericAPIResponse<Role>,
            { role_id: number } & Role
        >({
            query: ({ role_id, ...data }) => ({
                url: `/${role_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteRole: builder.mutation<GenericAPIResponse, { role_id: number }>({
            query: ({ role_id }) => ({
                url: `/${role_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetRolesQuery,
    useLazyGetRoleQuery,
    useLazySearchRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} = AdminRoleAPI;
