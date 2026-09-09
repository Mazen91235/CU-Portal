import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    EventResponseDto,
    EventSearchDto,
} from "../../../types/dtos/EventDtos";
import type { UserEventActionDto } from "../../../types/dtos/UserEventDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const EventAPI = createApi({
    reducerPath: "eventAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/events"),
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
            { event_id: number; includes?: string[] }
        >({
            query: ({ event_id, includes }) => ({
                url: `/${event_id}`,
                method: "GET",
                credentials: "include",
                params: includes?.length
                    ? { query: JSON.stringify({ includes }) }
                    : undefined,
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
