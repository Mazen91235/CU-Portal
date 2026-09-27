import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type {
    EventOrganizerCreateDto,
    EventOrganizerResponseDto,
    EventOrganizerSearchDto,
    EventOrganizerUpdateDto,
} from "../../../types/dtos/EventOrganizerDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import { GetAdminApiLink } from "../../../utils/LinkHandler";

export const AdminEventOrganizerAPI = createApi({
    reducerPath: "adminEventOrganizerAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/event-organizers"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getEventOrganizers: builder.query<
            GenericAPIResponse<EventOrganizerResponseDto[]>,
            QueryModel<EventOrganizerSearchDto>
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                params: { query: JSON.stringify(query) },
                credentials: "include",
            }),
        }),
        getEventOrganizer: builder.query<
            GenericAPIResponse<EventOrganizerResponseDto>,
            { event_organizer_id: number }
        >({
            query: ({ event_organizer_id }) => ({
                url: `/${event_organizer_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createEventOrganizer: builder.mutation<
            GenericAPIResponse<EventOrganizerResponseDto>,
            EventOrganizerCreateDto
        >({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
        updateEventOrganizer: builder.mutation<
            GenericAPIResponse<EventOrganizerResponseDto>,
            { event_organizer_id: number } & EventOrganizerUpdateDto
        >({
            query: ({ event_organizer_id, ...data }) => ({
                url: `/${event_organizer_id}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
        }),
        deleteEventOrganizer: builder.mutation<
            GenericAPIResponse,
            { event_organizer_id: number }
        >({
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
} = AdminEventOrganizerAPI;
