import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    TaskRegisterDto,
    TaskSearchDto,
} from "../../../types/dtos/TaskDTOs";
export const AdminTaskAPI = createApi({
    reducerPath: "adminTaskAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/tasks"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
            }
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
