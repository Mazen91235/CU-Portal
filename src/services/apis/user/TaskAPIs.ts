import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { TaskSearchDto } from "../../../types/dtos/TaskDTOs";

export const TaskAPI = createApi({
    reducerPath: "taskAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/tasks"),
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getTasks: builder.query<GenericAPIResponse<Task[]>, TaskSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getTask: builder.query<GenericAPIResponse<Task>, { task_id: number }>({
            query: ({ task_id }) => ({
                url: `/${task_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetTasksQuery, useLazyGetTaskQuery } = TaskAPI;
