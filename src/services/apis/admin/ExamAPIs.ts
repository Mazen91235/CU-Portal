import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    ExamCreateDto,
    ExamResponseDto,
    ExamSearchDto,
    ExamUpdateDto,
} from "../../../types/dtos/ExamDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminExamAPI = createApi({
    reducerPath: "adminExamAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/exams"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getExams: builder.query<GenericAPIResponse<ExamResponseDto[]>, QueryModel<ExamSearchDto>>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
        }),
        getExam: builder.query<GenericAPIResponse<ExamResponseDto>, { exam_id: number }>({
            query: ({ exam_id }) => ({
                url: `/${exam_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createExam: builder.mutation<GenericAPIResponse<ExamResponseDto>, ExamCreateDto>(
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
            GenericAPIResponse<ExamResponseDto>,
            { exam_id: number } & ExamUpdateDto
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
