import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Subject } from "../../../types/entities/Subject";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { SearchDto } from "../../../types/dtos/SearchDTOs";
export const CourseAPI = createApi({
    reducerPath: "courseAPI",
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
        getEnrolledCourses: builder.query<GenericAPIResponse<Subject[]>, void>({
            query: () => ({
                url: "/enrolled",
                method: "GET",
                credentials: "include",
            }),
        }),
        getEnrolledCourse: builder.query<
            GenericAPIResponse<Subject>,
            { course_id: number }
        >({
            query: ({ course_id }) => ({
                url: `/enrolled/${course_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getAvailableCourses: builder.query<
            GenericAPIResponse<Subject[]>,
            SearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        registerCourse: builder.mutation<
            GenericAPIResponse,
            { course_id: number }
        >({
            query: (query) => ({
                url: `/register`,
                method: "POST",
                credentials: "include",
                body: query,
            }),
        }),
        unregisterCourse: builder.mutation<
            GenericAPIResponse,
            { course_id: number }
        >({
            query: (query) => ({
                url: `/unregister`,
                method: "POST",
                credentials: "include",
                body: query,
            }),
        }),
    }),
});

export const {
    useLazyGetEnrolledCoursesQuery,
    useLazyGetEnrolledCourseQuery,
    useLazyGetAvailableCoursesQuery,
    useRegisterCourseMutation,
    useUnregisterCourseMutation,
} = CourseAPI;
