import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    NoteCreateDto,
    NoteResponseDto,
    NoteSearchDto,
    NoteUpdateDto,
} from "../../../types/dtos/NoteDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const NoteAPI = createApi({
    reducerPath: "noteAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/notes"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getNotes: builder.query<
            GenericAPIResponse<NoteResponseDto[]>,
            QueryModel<NoteSearchDto>
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
        getNote: builder.query<
            GenericAPIResponse<NoteResponseDto>,
            { note_id: number }
        >({
            query: ({ note_id }) => ({
                url: `/${note_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createNote: builder.mutation<
            GenericAPIResponse<NoteResponseDto>,
            NoteCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateNote: builder.mutation<
            GenericAPIResponse<NoteResponseDto>,
            { note_id: number } & NoteUpdateDto
        >({
            query: ({ note_id, ...data }) => ({
                url: `/${note_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteNote: builder.mutation<GenericAPIResponse, { note_id: number }>({
            query: ({ note_id }) => ({
                url: `/${note_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetNotesQuery,
    useLazyGetNoteQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} = NoteAPI;
