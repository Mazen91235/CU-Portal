import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import {
  timeout,
  maxRetries,
  retryCondition,
} from "../../../utils/APIHandling";
import type { EventOrganizerSearchDto } from "../../../types/dtos/EventOrganizerDTO";

export const AdminEventOrganizerAPI = createApi({
  reducerPath: "adminEventOrganizerAPI",
  baseQuery: retry(
    fetchBaseQuery({
      baseUrl: GetAdminApiLink("/event-organizers"),
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
    createEventOrganizer: builder.mutation<
      GenericAPIResponse<EventOrganizer>,
      EventOrganizer
    >({
      query: (data) => ({
        url: `/`,
        method: "POST",
        credentials: "include",
        body: data,
      }),
    }),
    updateEventOrganizer: builder.mutation<
      GenericAPIResponse<EventOrganizer>,
      { event_organizer_id: number } & Partial<EventOrganizer>
    >({
      query: ({ event_organizer_id, ...data }) => ({
        url: `/${event_organizer_id}`,
        method: "PATCH",
        credentials: "include",
        body: data,
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
