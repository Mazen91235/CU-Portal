import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    SubjectCreateDto,
    SubjectResponseDto,
    SubjectSearchDto,
    SubjectUpdateDto,
} from "../../../types/dtos/SubjectDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminCourseAPI = createApi({
    reducerPath: "adminCourseAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/courses"),
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
        getCourses: builder.query<
            GenericAPIResponse<SubjectResponseDto[]>,
            QueryModel<SubjectSearchDto>
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
        getCourse: builder.query<
            GenericAPIResponse<SubjectResponseDto>,
            { course_id: number }
        >({
            query: ({ course_id }) => ({
                url: `/${course_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createCourse: builder.mutation<
            GenericAPIResponse<SubjectResponseDto>,
            SubjectCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateCourse: builder.mutation<
            GenericAPIResponse<SubjectResponseDto>,
            { course_id: number } & SubjectUpdateDto
        >({
            query: ({ course_id, ...data }) => ({
                url: `/${course_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteCourse: builder.mutation<
            GenericAPIResponse,
            { course_id: number }
        >({
            query: ({ course_id }) => ({
                url: `/${course_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetCoursesQuery,
    useLazyGetCourseQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
} = AdminCourseAPI;
