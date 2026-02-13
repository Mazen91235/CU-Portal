import type {
    DefaultAPIResponse,
    GenericAPIResponse,
} from "../types/responses/GenericAPIResponse";
import type { UseFormSetError } from "react-hook-form";
import { showToast } from "./ToastsManager";
export const handleErrors = <T extends Record<string, unknown>>(
    response: DefaultAPIResponse | unknown,
    setError: UseFormSetError<T>,
    standardErrorMessage = "An Error Occurred. Please Try Again.",
) => {
    try {
        const data = (response as DefaultAPIResponse).data;
        if (typeof data == "string") {
            const message = data ?? standardErrorMessage;
            setError("root", { type: "server", message });
        } else {
            const res = data as GenericAPIResponse;
            if (hasMissingProperties(res, ["status", "message"])) {
                setError("root", {
                    type: "server",
                    message: standardErrorMessage,
                });
                return;
            }
            if (res.status == "error") {
                setError("root", {
                    type: "server",
                    message: res.message || standardErrorMessage,
                });
            }
        }
    } catch {
        setError("root", { type: "server", message: standardErrorMessage });
    }
};

export const hasMissingProperties = (
    obj: Record<string, unknown>,
    requiredProps?: string[],
): boolean => {
    if (Object.keys(obj).length === 0) {
        return true;
    }
    if (!requiredProps || requiredProps.length < 1) {
        for (const prop in obj) {
            if (obj[prop] === undefined || obj[prop] === null) {
                return true;
            }
        }
        return false;
    }
    for (const prop of requiredProps) {
        if (!(prop in obj) || obj[prop] === undefined || obj[prop] === null) {
            return true;
        }
    }
    return false;
};

const ignoreUnknownError = (
    error: DefaultAPIResponse | string | Error | unknown,
) => {
    const unKnownError = "invalid page number";
    if (typeof error == "string" && error.toLowerCase() == unKnownError) {
        return true;
    }
    if (error instanceof Error && error.message.toLowerCase() == unKnownError) {
        return true;
    }
    if (typeof error == "object" && error !== null) {
        const data = (error as DefaultAPIResponse).data;
        if (typeof data == "object" && data !== null) {
            const res = data as GenericAPIResponse;
            if (
                res.status == "error" &&
                res.message.toLowerCase() == unKnownError
            ) {
                return true;
            }
        }
    }
};

export const handlePopupErrors = (
    response: DefaultAPIResponse | string | Error | unknown,
) => {
    if (ignoreUnknownError(response)) {
        return;
    }
    if (typeof response === "string") {
        showToast("error", "Error", response);
        return;
    }
    if (response instanceof Error) {
        showToast("error", "Error", response.message);
        return;
    }
    const res = response as DefaultAPIResponse;
    if (res.error) {
        showToast("error", "Error", "An Error Occurred. Please Try Again.");
        return;
    }
    const data = res.data as GenericAPIResponse;
    if (data.status == "error") {
        const message = data.message ?? "An Error Occurred. Please Try Again.";
        showToast("error", "Error", message);
    } else {
        showToast("error", "Error", "An Error Occurred. Please Try Again.");
    }
};
