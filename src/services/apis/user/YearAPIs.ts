import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    YearResponseDto,
    YearSearchDto,
} from "../../../types/dtos/YearDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const YearAPI = createApi({
    reducerPath: "yearAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/years"),
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
    }),
});

export const { useLazyGetYearsQuery, useLazyGetYearQuery } =
    YearAPI;
