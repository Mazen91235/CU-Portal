import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    FacultyResponseDto,
    FacultySearchDto,
} from "../../../types/dtos/FacultyDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const FacultyAPI = createApi({
    reducerPath: "facultyAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/faculties"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getFaculties: builder.query<
            GenericAPIResponse<FacultyResponseDto[]>,
            QueryModel<FacultySearchDto>
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
        getFaculty: builder.query<
            GenericAPIResponse<FacultyResponseDto>,
            { faculty_id: number }
        >({
            query: ({ faculty_id }) => ({
                url: `/${faculty_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetFacultiesQuery, useLazyGetFacultyQuery } =
    FacultyAPI;
