import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Department } from "../../../types/entities/Department";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { DepartmentSearchDto } from "../../../types/dtos/DepartmentDTOs";
export const AdminDepartmentAPI = createApi({
    reducerPath: "adminDepartmentAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/departments"),
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getDepartments: builder.query<
            GenericAPIResponse<Department[]>,
            DepartmentSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getDepartment: builder.query<
            GenericAPIResponse<Department>,
            { department_id: number }
        >({
            query: ({ department_id }) => ({
                url: `/view/${department_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchDepartments: builder.query<
            GenericAPIResponse<Department[]>,
            DepartmentSearchDto
        >({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        createDepartment: builder.mutation<
            GenericAPIResponse<Department>,
            Department
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateDepartment: builder.mutation<
            GenericAPIResponse<Department>,
            { department_id: number } & Department
        >({
            query: ({ department_id, ...data }) => ({
                url: `/${department_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteDepartment: builder.mutation<
            GenericAPIResponse,
            { department_id: number }
        >({
            query: ({ department_id }) => ({
                url: `/${department_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetDepartmentsQuery,
    useLazyGetDepartmentQuery,
    useLazySearchDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = AdminDepartmentAPI;
