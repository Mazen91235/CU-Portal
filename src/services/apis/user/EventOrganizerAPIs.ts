import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type {
    EventOrganizerResponseDto,
    EventOrganizerSearchDto,
} from "../../../types/dtos/EventOrganizerDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import { GetUserApiLink } from "../../../utils/LinkHandler";

export const EventOrganizerAPI = createApi({
    reducerPath: "eventOrganizerAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/event-organizers"),
        timeout,
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
    }),
});

export const { useLazyGetEventOrganizersQuery, useLazyGetEventOrganizerQuery } =
    EventOrganizerAPI;
