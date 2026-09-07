import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    EventOrganizerCreateDto,
    EventOrganizerResponseDto,
    EventOrganizerSearchDto,
    EventOrganizerUpdateDto,
} from "../../../types/dtos/EventOrganizerDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const EventOrganizerAPI = createApi({
    reducerPath: "eventOrganizerAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/event-organizers"),
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
        getEventOrganizers: builder.query<GenericAPIResponse<EventOrganizerResponseDto[]>, QueryModel<EventOrganizerSearchDto>>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
        }),
        getEventOrganizer: builder.query<GenericAPIResponse<EventOrganizerResponseDto>, { event_organizer_id: number }>({
            query: ({ event_organizer_id }) => ({
                url: `/${event_organizer_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createEventOrganizer: builder.mutation<GenericAPIResponse<EventOrganizerResponseDto>, EventOrganizerCreateDto>(
            {
                query: (data) => ({
                    url: `/`,
                    method: "POST",
                    credentials: "include",
                    body: data,
                }),
            },
        ),
        updateEventOrganizer: builder.mutation<
            GenericAPIResponse<EventOrganizerResponseDto>,
            { event_organizer_id: number } & EventOrganizerUpdateDto
        >({
            query: ({ event_organizer_id, ...data }) => ({
                url: `/${event_organizer_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteEventOrganizer: builder.mutation<GenericAPIResponse, { event_organizer_id: number }>({
            query: ({ event_organizer_id }) => ({
                url: `/${event_organizer_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetEventOrganizersQuery,
    useLazyGetEventOrganizerQuery,
    useCreateEventOrganizerMutation,
    useUpdateEventOrganizerMutation,
    useDeleteEventOrganizerMutation,
} = EventOrganizerAPI;
