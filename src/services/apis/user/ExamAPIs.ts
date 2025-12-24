import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Task } from "../../../types/entities/Task";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { ExamSearchDto } from "../../../types/dtos/ExamDTOs";

export const ExamAPI = createApi({
    reducerPath: "examAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/exams"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
