import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Department } from "../../../types/entities/Department";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { DepartmentSearchDto } from "../../../types/dtos/DepartmentDTOs";
export const AdminDepartmentAPI = createApi({
    reducerPath: "adminDepartmentAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/departments"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
