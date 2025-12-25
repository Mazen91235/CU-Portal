import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Log } from "../../../types/entities/Log";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { LogSearchDto } from "../../../types/dtos/LogDTOs";
export const AdminLogAPI = createApi({
    reducerPath: "adminLogAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/logs"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getLogs: builder.query<GenericAPIResponse<Log[]>, LogSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
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
        getLog: builder.query<GenericAPIResponse<Log>, { log_id: number }>({
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
    useGetLogActionsQuery,
    useGetLogEntitiesQuery,
    useLazyGetLogQuery,
} = AdminLogAPI;
