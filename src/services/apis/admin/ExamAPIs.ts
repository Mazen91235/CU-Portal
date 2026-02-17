import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    ExamRegisterDto,
    ExamSearchDto,
} from "../../../types/dtos/ExamDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminExamAPI = createApi({
    reducerPath: "adminExamAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/exams"),
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
        getExams: builder.query<GenericAPIResponse<Task[]>, ExamSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getExam: builder.query<GenericAPIResponse<Task>, { exam_id: number }>({
            query: ({ exam_id }) => ({
                url: `/${exam_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createExam: builder.mutation<GenericAPIResponse<Task>, ExamRegisterDto>(
            {
                query: (data) => ({
                    url: `/`,
                    method: "POST",
                    credentials: "include",
                    body: data,
                }),
            },
        ),
        updateExam: builder.mutation<
            GenericAPIResponse<Task>,
            { exam_id: number } & ExamRegisterDto
        >({
            query: ({ exam_id, ...data }) => ({
                url: `/${exam_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteExam: builder.mutation<GenericAPIResponse, { exam_id: number }>({
            query: ({ exam_id }) => ({
                url: `/${exam_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetExamsQuery,
    useLazyGetExamQuery,
    useCreateExamMutation,
    useUpdateExamMutation,
    useDeleteExamMutation,
} = AdminExamAPI;
