import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    TaskResponseDto,
    TaskSearchDto,
} from "../../../types/dtos/TaskDtos";
import type { QueryModel } from "../../../types/models/QueryModel";

export const TaskAPI = createApi({
    reducerPath: "taskAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/tasks"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getTasks: builder.query<
            GenericAPIResponse<TaskResponseDto[]>,
            QueryModel<TaskSearchDto>
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
        getTask: builder.query<
            GenericAPIResponse<TaskResponseDto>,
            { task_id: number }
        >({
            query: ({ task_id }) => ({
                url: `/${task_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetTasksQuery, useLazyGetTaskQuery } = TaskAPI;
