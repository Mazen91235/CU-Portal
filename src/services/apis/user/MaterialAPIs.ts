import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    MaterialResponseDto,
    MaterialSearchDto,
} from "../../../types/dtos/MaterialDtos";
import type { QueryModel } from "../../../types/models/QueryModel";

export const MaterialAPI = createApi({
    reducerPath: "materialAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/materials"),
        timeout,
        credentials: "include",
    }),
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
        getMaterialParents: builder.query<
            GenericAPIResponse<MaterialResponseDto[]>,
            {
                material_id: number;
            }
        >({
            query: ({ material_id }) => ({
                url: `/${material_id}/parents`,
                method: "GET",
                credentials: "include",
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
    }),
});

export const {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialParentsQuery,
    useLazyGetMaterialQuery,
} = MaterialAPI;
