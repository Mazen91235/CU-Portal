import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    RoleCreateDto,
    RoleResponseDto,
    RoleSearchDto,
    RoleUpdateDto,
} from "../../../types/dtos/RoleDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminRoleAPI = createApi({
    reducerPath: "adminRoleAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/roles"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getRoles: builder.query<
            GenericAPIResponse<RoleResponseDto[]>,
            QueryModel<RoleSearchDto>
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
        getRole: builder.query<
            GenericAPIResponse<RoleResponseDto>,
            { role_id: number }
        >({
            query: ({ role_id }) => ({
                url: `/${role_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        countPermissions: builder.query<GenericAPIResponse<number>, void>({
            query: () => ({
                url: `/permissions/count`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getPermissions: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: `/permissions`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createRole: builder.mutation<
            GenericAPIResponse<RoleResponseDto>,
            RoleCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateRole: builder.mutation<
            GenericAPIResponse<RoleResponseDto>,
            { role_id: number } & RoleUpdateDto
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
    useLazyCountPermissionsQuery,
    useLazyGetPermissionsQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} = AdminRoleAPI;
