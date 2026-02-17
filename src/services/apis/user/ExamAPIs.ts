import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { ExamSearchDto } from "../../../types/dtos/ExamDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";

export const ExamAPI = createApi({
    reducerPath: "examAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/exams"),
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
    }),
});

export const { useLazyGetExamsQuery, useLazyGetExamQuery } = ExamAPI;
