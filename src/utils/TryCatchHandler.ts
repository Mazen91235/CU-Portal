import type { GenericAPIResponse } from "../types/responses/GenericAPIResponse";

export async function tryCatch<T, E=GenericAPIResponse>(promise: Promise<T>): Promise<[T | null, E | null]> {
    try {
        const result = await promise;
        return [result, null];
    } catch (error) {
        return [null, error as E];
    }
}
