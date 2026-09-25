import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    SubjectCreateDto,
    SubjectResponseDto,
    SubjectSearchDto,
    SubjectUpdateDto,
} from "../../../types/dtos/SubjectDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminCourseAPI = createApi({
    reducerPath: "adminCourseAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/courses"),
        timeout,
        credentials: "include",
    }),
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
