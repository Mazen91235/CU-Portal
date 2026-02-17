import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Year } from "../../../types/entities/Year";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { YearSearchDto } from "../../../types/dtos/YearDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminYearAPI = createApi({
    reducerPath: "adminYearAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/years"),
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
        getYears: builder.query<GenericAPIResponse<Year[]>, YearSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getYear: builder.query<GenericAPIResponse<Year>, { year_id: number }>({
            query: ({ year_id }) => ({
                url: `/view/${year_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchYears: builder.query<GenericAPIResponse<Year[]>, YearSearchDto>({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        createYear: builder.mutation<GenericAPIResponse<Year>, Year>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateYear: builder.mutation<
            GenericAPIResponse<Year>,
            { year_id: number } & Year
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
    useLazySearchYearsQuery,
    useCreateYearMutation,
    useUpdateYearMutation,
    useDeleteYearMutation,
} = AdminYearAPI;
