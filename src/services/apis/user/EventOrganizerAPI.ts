import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { EventOrganizerSearchDto } from "../../../types/dtos/EventOrganizerDTO";
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
    getEventOrganizers: builder.query<
      GenericAPIResponse<EventOrganizer[]>,
      EventOrganizerSearchDto
    >({
      query: (query) => ({
        url: "/",
        method: "GET",
        credentials: "include",
        params: query,
      }),
    }),
    getEventOrganizer: builder.query<
      GenericAPIResponse<EventOrganizer>,
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
