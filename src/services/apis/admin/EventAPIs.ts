import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    EventCreateDto,
    EventResponseDto,
    EventSearchDto,
    EventUpdateDto,
} from "../../../types/dtos/EventDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminEventAPI = createApi({
    reducerPath: "adminEventAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/events"),
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
        createEvent: builder.mutation<
            GenericAPIResponse<EventResponseDto>,
            EventCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateEvent: builder.mutation<
            GenericAPIResponse<EventResponseDto>,
            { event_id: number } & EventUpdateDto
        >({
            query: ({ event_id, ...data }) => ({
                url: `/${event_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteEvent: builder.mutation<GenericAPIResponse, { event_id: number }>({
            query: ({ event_id }) => ({
                url: `/${event_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetEventsQuery,
    useLazyGetEventQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
} = AdminEventAPI;
