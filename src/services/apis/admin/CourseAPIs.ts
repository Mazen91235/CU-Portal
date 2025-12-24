import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Subject } from "../../../types/entities/Subject";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { CourseSearchDto } from "../../../types/dtos/CourseDTOs";
export const AdminCourseAPI = createApi({
    reducerPath: "adminCourseAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/courses"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getCourses: builder.query<
            GenericAPIResponse<Subject[]>,
            CourseSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getCourse: builder.query<
            GenericAPIResponse<Subject>,
            { course_id: number }
        >({
            query: ({ course_id }) => ({
                url: `/${course_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchCourses: builder.query<
            GenericAPIResponse<Subject[]>,
            CourseSearchDto
        >({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        searchRegisteredCourses: builder.query<
            GenericAPIResponse<Subject[]>,
            CourseSearchDto
        >({
            query: (query) => ({
                url: `/search-registered`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        createCourse: builder.mutation<GenericAPIResponse<Subject>, Subject>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateCourse: builder.mutation<
            GenericAPIResponse<Subject>,
            { course_id: number } & Subject
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
    useLazySearchCoursesQuery,
    useLazySearchRegisteredCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
} = AdminCourseAPI;
