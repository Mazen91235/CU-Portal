import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { LogResponseDto, LogSearchDto } from "../../../types/dtos/LogDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminLogAPI = createApi({
    reducerPath: "adminLogAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/logs"),
        timeout,
        credentials: "include",
    }),
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
