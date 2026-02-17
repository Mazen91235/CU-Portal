import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Material } from "../../../types/entities/Material";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { MaterialSearchDto } from "../../../types/dtos/MaterialDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";

export const MaterialAPI = createApi({
    reducerPath: "materialAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/materials"),
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
            GenericAPIResponse<Material>,
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
