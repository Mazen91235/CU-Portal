import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    YearResponseDto,
    YearSearchDto,
} from "../../../types/dtos/YearDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const YearAPI = createApi({
    reducerPath: "yearAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/years"),
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
    }),
});

export const { useLazyGetYearsQuery, useLazyGetYearQuery } =
    YearAPI;
