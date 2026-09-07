import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    DepartmentResponseDto,
    DepartmentSearchDto,
} from "../../../types/dtos/DepartmentDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const DepartmentAPI = createApi({
    reducerPath: "departmentAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/departments"),
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
    }),
});

export const { useLazyGetDepartmentsQuery, useLazyGetDepartmentQuery } =
    DepartmentAPI;