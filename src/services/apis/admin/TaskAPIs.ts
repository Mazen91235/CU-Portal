import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    TaskCreateDto,
    TaskResponseDto,
    TaskSearchDto,
    TaskUpdateDto,
} from "../../../types/dtos/TaskDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminTaskAPI = createApi({
    reducerPath: "adminTaskAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/tasks"),
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
        createTask: builder.mutation<
            GenericAPIResponse<TaskResponseDto>,
            TaskCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateTask: builder.mutation<
            GenericAPIResponse<TaskResponseDto>,
            { task_id: number } & TaskUpdateDto
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
