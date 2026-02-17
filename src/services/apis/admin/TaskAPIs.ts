import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    TaskRegisterDto,
    TaskSearchDto,
} from "../../../types/dtos/TaskDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminTaskAPI = createApi({
    reducerPath: "adminTaskAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/tasks"),
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
        createTask: builder.mutation<GenericAPIResponse<Task>, TaskRegisterDto>(
            {
                query: (data) => ({
                    url: `/`,
                    method: "POST",
                    credentials: "include",
                    body: data,
                }),
            },
        ),
        updateTask: builder.mutation<
            GenericAPIResponse<Task>,
            { task_id: number } & TaskRegisterDto
        >({
            query: ({ task_id, ...data }) => ({
                url: `/${task_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteTask: builder.mutation<GenericAPIResponse, { task_id: number }>({
            query: ({ task_id }) => ({
                url: `/${task_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetTasksQuery,
    useLazyGetTaskQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = AdminTaskAPI;
