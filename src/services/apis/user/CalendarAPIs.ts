import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    CalendarDayEventsDto,
    CalenderSearchDto,
} from "../../../types/dtos/CalenderDTOs";
export const CalendarAPI = createApi({
    reducerPath: "calendarAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/calendar"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getCalendarTasks: builder.query<
            GenericAPIResponse<CalendarDayEventsDto>,
            CalenderSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
    }),
});

export const { useLazyGetCalendarTasksQuery } = CalendarAPI;
