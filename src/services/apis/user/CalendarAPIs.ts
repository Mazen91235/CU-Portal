import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    CalendarDayEventsDto,
    CalenderSearchDto,
} from "../../../types/dtos/CalenderDTOs";
export const CalendarAPI = createApi({
    reducerPath: "calendarAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/calendar"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
