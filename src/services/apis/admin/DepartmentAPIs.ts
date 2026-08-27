import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    DepartmentCreateDto,
    DepartmentResponseDto,
    DepartmentSearchDto,
    DepartmentUpdateDto,
} from "../../../types/dtos/DepartmentDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminDepartmentAPI = createApi({
    reducerPath: "adminDepartmentAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/departments"),
            timeout,
            credentials: "include",
        }),
        {
            maxRetries,
            //@ts-expect-error RTK Query's types don't account for this parameter
            retryCondition,
        },
    ),
    endpoints: (builder) => ({
        getDepartments: builder.query<
            GenericAPIResponse<DepartmentResponseDto[]>,
            QueryModel<DepartmentSearchDto>
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
        getDepartment: builder.query<
            GenericAPIResponse<DepartmentResponseDto>,
            { department_id: number }
        >({
            query: ({ department_id }) => ({
                url: `/${department_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createDepartment: builder.mutation<
            GenericAPIResponse<DepartmentResponseDto>,
            DepartmentCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateDepartment: builder.mutation<
            GenericAPIResponse<DepartmentResponseDto>,
            { department_id: number } & DepartmentUpdateDto
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
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = AdminDepartmentAPI;
