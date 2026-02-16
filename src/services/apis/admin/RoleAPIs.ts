import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Role } from "../../../types/entities/Role";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { RoleDto, RoleSearchDto } from "../../../types/dtos/RoleDTOs";
export const AdminRoleAPI = createApi({
    reducerPath: "adminRoleAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/roles"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getRoles: builder.query<GenericAPIResponse<Role[]>, RoleSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getRole: builder.query<
            GenericAPIResponse<RoleDto>,
            { role_id: number }
        >({
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
                url: `/permissions/count`,
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
    useLazyCountPermissionsQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} = AdminRoleAPI;
