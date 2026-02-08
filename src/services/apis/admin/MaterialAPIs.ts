import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Material } from "../../../types/entities/Material";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    MaterialCopyDto,
    MaterialFetchFromDriveDto,
    MaterialRegisterDto,
    MaterialSearchDto,
} from "../../../types/dtos/MaterialDTOs";
export const AdminMaterialAPI = createApi({
    reducerPath: "adminMaterialAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/materials"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getMaterials: builder.query<
            GenericAPIResponse<Material[]>,
            MaterialSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getMaterialParents: builder.query<
            GenericAPIResponse<Material[]>,
            { material_id: number }
        >({
            query: ({ material_id }) => ({
                url: `/${material_id}/parents`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getMaterial: builder.query<
            GenericAPIResponse<Material>,
            { material_id: number }
        >({
            query: ({ material_id }) => ({
                url: `/${material_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getMaterialFromDrive: builder.query<
            GenericAPIResponse<Material>,
            MaterialFetchFromDriveDto
        >({
            query: (query) => ({
                url: `/fetch-one-from-drive`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getMaterialsFromDrive: builder.query<
            GenericAPIResponse<Material>,
            MaterialFetchFromDriveDto
        >({
            query: (query) => ({
                url: `/fetch-from-drive`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        fetchMaterialsFromDrive: builder.mutation<
            GenericAPIResponse<Material>,
            MaterialFetchFromDriveDto
        >({
            query: (data) => ({
                url: `/fetch-from-drive`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        createMaterial: builder.mutation<
            GenericAPIResponse<Material>,
            MaterialRegisterDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateMaterial: builder.mutation<
            GenericAPIResponse<Material>,
            { material_id: number } & MaterialRegisterDto
        >({
            query: ({ material_id, ...data }) => ({
                url: `/${material_id}`,
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
        copyMaterials: builder.mutation<GenericAPIResponse, MaterialCopyDto>({
            query: (query) => ({
                url: `/copy`,
                method: "PATCH",
                credentials: "include",
                body: query,
            }),
        }),
        moveMaterials: builder.mutation<GenericAPIResponse, MaterialCopyDto>({
            query: (query) => ({
                url: `/move`,
                method: "PATCH",
                credentials: "include",
                body: query,
            }),
        }),
    }),
});

export const {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialQuery,
    useLazyGetMaterialParentsQuery,
    useLazyGetMaterialFromDriveQuery,
    useLazyGetMaterialsFromDriveQuery,
    useFetchMaterialsFromDriveMutation,
    useCreateMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialMutation,
    useCopyMaterialsMutation,
    useMoveMaterialsMutation,
} = AdminMaterialAPI;
