import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { LogResponseDto, LogSearchDto } from "../../../types/dtos/LogDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminLogAPI = createApi({
    reducerPath: "adminLogAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/logs"),
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
        getLogs: builder.query<
            GenericAPIResponse<LogResponseDto[]>,
            QueryModel<LogSearchDto>
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
        getLogActions: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: "/actions",
                method: "GET",
                credentials: "include",
            }),
        }),
        getLogEntities: builder.query<GenericAPIResponse<string[]>, void>({
            query: () => ({
                url: "/entities",
                method: "GET",
                credentials: "include",
            }),
        }),
        getLog: builder.query<
            GenericAPIResponse<LogResponseDto>,
            { log_id: number }
        >({
            query: ({ log_id }) => ({
                url: `/${log_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetLogsQuery,
    useLazyGetLogActionsQuery,
    useLazyGetLogEntitiesQuery,
    useLazyGetLogQuery,
} = AdminLogAPI;
