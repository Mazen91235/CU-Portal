import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    CalendarResponseDto,
    CalendarSearchDto,
} from "../../../types/dtos/CalendarDtos";
export const CalendarAPI = createApi({
    reducerPath: "calendarAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/calendar"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getCalendarTasks: builder.query<
            GenericAPIResponse<CalendarResponseDto>,
            CalendarSearchDto
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
