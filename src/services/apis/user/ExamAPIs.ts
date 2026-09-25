import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    ExamResponseDto,
    ExamSearchDto,
} from "../../../types/dtos/ExamDtos";
import type { QueryModel } from "../../../types/models/QueryModel";

export const ExamAPI = createApi({
    reducerPath: "examAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/exams"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getExams: builder.query<
            GenericAPIResponse<ExamResponseDto[]>,
            QueryModel<ExamSearchDto>
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
        getExam: builder.query<
            GenericAPIResponse<ExamResponseDto>,
            { exam_id: number }
        >({
            query: ({ exam_id }) => ({
                url: `/${exam_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetExamsQuery, useLazyGetExamQuery } = ExamAPI;
