import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { ExamSearchDto } from "../../../types/dtos/ExamDTOs";

export const ExamAPI = createApi({
    reducerPath: "examAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/exams"),
            credentials: "include",
        }),
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
