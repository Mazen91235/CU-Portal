import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    WeekResponseDto,
    WeekSearchDto,
} from "../../../types/dtos/WeekDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const WeekAPI = createApi({
    reducerPath: "weekAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/weeks"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getWeeks: builder.query<
            GenericAPIResponse<WeekResponseDto[]>,
            QueryModel<WeekSearchDto>
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
        getWeek: builder.query<
            GenericAPIResponse<WeekResponseDto>,
            { week_id: number }
        >({
            query: ({ week_id }) => ({
                url: `/${week_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetWeeksQuery, useLazyGetWeekQuery } = WeekAPI;
