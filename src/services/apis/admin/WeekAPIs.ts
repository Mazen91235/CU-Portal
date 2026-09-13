import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    WeekCreateDto,
    WeekResponseDto,
    WeekSearchDto,
    WeekUpdateDto,
} from "../../../types/dtos/WeekDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminWeekAPI = createApi({
    reducerPath: "adminWeekAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/weeks"),
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
        getWeeks: builder.query<
            GenericAPIResponse<WeekResponseDto[]>,
            QueryModel<WeekSearchDto>
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
        getWeek: builder.query<
            GenericAPIResponse<WeekResponseDto>,
            { week_id: number }
        >({
            query: ({ week_id }) => ({
                url: `/${week_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createWeek: builder.mutation<
            GenericAPIResponse<WeekResponseDto>,
            WeekCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateWeek: builder.mutation<
            GenericAPIResponse<WeekResponseDto>,
            { week_id: number } & WeekUpdateDto
        >({
            query: ({ week_id, ...data }) => ({
                url: `/${week_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteWeek: builder.mutation<
            GenericAPIResponse,
            { week_id: number }
        >({
            query: ({ week_id }) => ({
                url: `/${week_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetWeeksQuery,
    useLazyGetWeekQuery,
    useCreateWeekMutation,
    useUpdateWeekMutation,
    useDeleteWeekMutation,
} = AdminWeekAPI;
