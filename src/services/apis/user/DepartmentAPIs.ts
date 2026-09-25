import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    DepartmentResponseDto,
    DepartmentSearchDto,
} from "../../../types/dtos/DepartmentDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const DepartmentAPI = createApi({
    reducerPath: "departmentAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/departments"),
        timeout,
        credentials: "include",
    }),
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