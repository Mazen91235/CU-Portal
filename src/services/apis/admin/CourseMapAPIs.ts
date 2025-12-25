import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Roadmap } from "../../../types/entities/Roadmap";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { CourseMapSearchDto } from "../../../types/dtos/CourseMapDTOs";
import type {
    CourseMapRegisterDto,
    CourseMapUpdateYearsDto,
    CourseMapAddCoursesDto,
} from "../../../types/dtos/CourseMapDTOs";
export const AdminCourseMapAPI = createApi({
    reducerPath: "adminCourseMapAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/course-maps"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getCourseMaps: builder.query<
            GenericAPIResponse<Roadmap[]>,
            CourseMapSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getCourseMap: builder.query<
            GenericAPIResponse<Roadmap>,
            { course_map_id: number }
        >({
            query: ({ course_map_id }) => ({
                url: `/${course_map_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createCourseMap: builder.mutation<
            GenericAPIResponse<Roadmap>,
            CourseMapRegisterDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateCourseMap: builder.mutation<
            GenericAPIResponse<Roadmap>,
            { course_map_id: number } & CourseMapRegisterDto
        >({
            query: ({ course_map_id, ...data }) => ({
                url: `/${course_map_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        updateCourseMapYears: builder.mutation<
            GenericAPIResponse<Roadmap>,
            { course_map_id: number } & CourseMapUpdateYearsDto
        >({
            query: ({ course_map_id, ...data }) => ({
                url: `/${course_map_id}/years`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        addCourseMapCourses: builder.mutation<
            GenericAPIResponse<Roadmap>,
            { course_map_id: number } & CourseMapAddCoursesDto
        >({
            query: ({ course_map_id, ...data }) => ({
                url: `/${course_map_id}/courses`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateCourseMapCourses: builder.mutation<
            GenericAPIResponse<Roadmap>,
            {
                course_map_id: number;
                course_id: number;
            } & CourseMapAddCoursesDto
        >({
            query: ({ course_map_id, course_id, ...data }) => ({
                url: `/${course_map_id}/courses/${course_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteCourseMapCourses: builder.mutation<
            GenericAPIResponse<Roadmap>,
            {
                course_map_id: number;
                course_id: number;
            }
        >({
            query: ({ course_map_id, course_id }) => ({
                url: `/${course_map_id}/courses/${course_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
        deleteCourseMap: builder.mutation<
            GenericAPIResponse,
            { course_map_id: number }
        >({
            query: ({ course_map_id }) => ({
                url: `/${course_map_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetCourseMapsQuery,
    useLazyGetCourseMapQuery,
    useCreateCourseMapMutation,
    useUpdateCourseMapMutation,
    useUpdateCourseMapYearsMutation,
    useAddCourseMapCoursesMutation,
    useUpdateCourseMapCoursesMutation,
    useDeleteCourseMapCoursesMutation,
    useDeleteCourseMapMutation,
} = AdminCourseMapAPI;
