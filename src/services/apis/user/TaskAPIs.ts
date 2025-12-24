import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { TaskSearchDto  } from "../../../types/dtos/TaskDTOs";

export const TaskAPI = createApi({
    reducerPath: "taskAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/tasks"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getTasks: builder.query<
            GenericAPIResponse<Task[]>,
            TaskSearchDto
        >({
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
