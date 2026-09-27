import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    YearCreateDto,
    YearResponseDto,
    YearSearchDto,
    YearUpdateDto,
} from "../../../types/dtos/YearDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminYearAPI = createApi({
    reducerPath: "adminYearAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/years"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getYears: builder.query<
            GenericAPIResponse<YearResponseDto[]>,
            QueryModel<YearSearchDto>
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
        getYear: builder.query<
            GenericAPIResponse<YearResponseDto>,
            { year_id: number }
        >({
            query: ({ year_id }) => ({
                url: `/${year_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createYear: builder.mutation<
            GenericAPIResponse<YearResponseDto>,
            YearCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateYear: builder.mutation<
            GenericAPIResponse<YearResponseDto>,
            { year_id: number } & YearUpdateDto
        >({
            query: ({ year_id, ...data }) => ({
                url: `/${year_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteYear: builder.mutation<GenericAPIResponse, { year_id: number }>({
            query: ({ year_id }) => ({
                url: `/${year_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetYearsQuery,
    useLazyGetYearQuery,
    useCreateYearMutation,
    useUpdateYearMutation,
    useDeleteYearMutation,
} = AdminYearAPI;
