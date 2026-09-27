import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    EventResponseDto,
    EventSearchDto,
} from "../../../types/dtos/EventDtos";
import type { UserEventActionDto } from "../../../types/dtos/UserEventDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const EventAPI = createApi({
    reducerPath: "eventAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/events"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getEvents: builder.query<
            GenericAPIResponse<EventResponseDto[]>,
            QueryModel<EventSearchDto>
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
        getEvent: builder.query<
            GenericAPIResponse<EventResponseDto>,
            { event_id: number }
        >({
            query: ({ event_id }) => ({
                url: `/${event_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        registerEvent: builder.mutation<GenericAPIResponse, UserEventActionDto>(
            {
                query: (data) => ({
                    url: `/register`,
                    method: "POST",
                    credentials: "include",
                    body: data,
                }),
            },
        ),
        unregisterEvent: builder.mutation<
            GenericAPIResponse,
            UserEventActionDto
        >({
            query: (data) => ({
                url: `/unregister`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
    }),
});

export const {
    useLazyGetEventsQuery,
    useLazyGetEventQuery,
    useRegisterEventMutation,
    useUnregisterEventMutation,
} = EventAPI;
