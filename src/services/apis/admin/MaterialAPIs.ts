import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    MaterialCreateDto,
    MaterialResponseDto,
    MaterialSearchDto,
    MaterialUpdateDto,
    MaterialsFetchFromDriveDto,
    MaterialsCopyOrMoveDto,
} from "../../../types/dtos/MaterialDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import { maxRetries, retryCondition } from "../../../utils/APIHandling";
export const AdminMaterialAPI = createApi({
    reducerPath: "adminMaterialAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/materials"),
            timeout: 60000,
            credentials: "include",
        }),
        {
            maxRetries,
            //@ts-expect-error RTK Query's types don't account for this parameter
            retryCondition,
        },
    ),
    endpoints: (builder) => ({
        getMaterials: builder.query<
            GenericAPIResponse<MaterialResponseDto[]>,
            QueryModel<MaterialSearchDto>
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
        getMaterial: builder.query<
            GenericAPIResponse<MaterialResponseDto>,
            { material_id: number }
        >({
            query: ({ material_id }) => ({
                url: `/${material_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        fetchMaterialsFromDrive: builder.mutation<
            GenericAPIResponse<boolean>,
            MaterialsFetchFromDriveDto
        >({
            query: (data) => ({
                url: `/fetch-from-drive`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        createMaterial: builder.mutation<
            GenericAPIResponse<MaterialResponseDto>,
            MaterialCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateMaterial: builder.mutation<
            GenericAPIResponse<MaterialResponseDto>,
            { material_id: number } & MaterialUpdateDto
        >({
            query: ({ material_id, ...data }) => ({
                url: `/update/${material_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteMaterial: builder.mutation<
            GenericAPIResponse,
            { material_id: number }
        >({
            query: ({ material_id }) => ({
                url: `/${material_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
        copyMaterials: builder.mutation<
            GenericAPIResponse,
            MaterialsCopyOrMoveDto
        >({
            query: (data) => ({
                url: `/copy`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        moveMaterials: builder.mutation<
            GenericAPIResponse,
            MaterialsCopyOrMoveDto
        >({
            query: (data) => ({
                url: `/move`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
    }),
});

export const {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialQuery,
    useFetchMaterialsFromDriveMutation,
    useCreateMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialMutation,
    useCopyMaterialsMutation,
    useMoveMaterialsMutation,
} = AdminMaterialAPI;
