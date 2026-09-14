import type { DefaultAPIResponse } from "../types/responses/GenericAPIResponse";
import type { UseFormSetError } from "react-hook-form";
import { showToast } from "./ToastsManager";

type ExtractedError = {
    message: string;
    field?: string;
};

const standardErrorMessage = "An Error Occurred. Please Try Again.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const extractDetails = (value: unknown): ExtractedError[] => {
    if (typeof value === "string" && value.trim()) {
        return [{ message: value }];
    }

    if (value instanceof Error && value.message) {
        return [{ message: value.message }];
    }

    if (!isRecord(value)) return [];

    const directMessage = value.message;
    if (typeof directMessage === "string" && directMessage.trim()) {
        return [{ message: directMessage }];
    }

    const detail = value.detail;
    if (typeof detail === "string" && detail.trim()) {
        return [{ message: detail }];
    }

    if (Array.isArray(detail)) {
        return detail.flatMap((item) => {
            if (!isRecord(item)) {
                return typeof item === "string" ? [{ message: item }] : [];
            }
            const message =
                typeof item.msg === "string" && item.msg.trim()
                    ? item.msg
                    : typeof item.message === "string" && item.message.trim()
                      ? item.message
                      : undefined;
            if (!message) return [];

            const loc = Array.isArray(item.loc) ? item.loc : [];
            const field =
                typeof loc[loc.length - 1] === "string"
                    ? loc[loc.length - 1]
                    : undefined;
            return [{ message, field }];
        });
    }

    const nestedData = value.data;
    if (nestedData !== undefined && nestedData !== value) {
        const nested = extractDetails(nestedData);
        if (nested.length) return nested;
    }

    const error = value.error;
    if (error !== undefined && error !== value) {
        const nested = extractDetails(error);
        if (nested.length) return nested;
    }

    return [];
};

const getErrorDetails = (response: unknown): ExtractedError[] => {
    const details = extractDetails(response);
    return details.length ? details : [{ message: standardErrorMessage }];
};

export const getErrorMessage = (response: unknown): string => {
    const details = getErrorDetails(response);
    return [...new Set(details.map((detail) => detail.message))].join("\n");
};

export const handleErrors = <T extends Record<string, unknown>>(
    response: DefaultAPIResponse | unknown,
    setError: UseFormSetError<T>,
    fallbackMessage = standardErrorMessage,
) => {
    const details = getErrorDetails(response);
    const uniqueMessages = [
        ...new Set(details.map((detail) => detail.message)),
    ];

    details.forEach(({ field, message }) => {
        if (field) {
            setError(field as any, {
                type: "server",
                message,
            });
        }
    });

    setError("root", {
        type: "server",
        message:
            uniqueMessages.length > 0
                ? uniqueMessages.join("\n")
                : fallbackMessage,
    });
};

export const hasMissingProperties = (
    obj: Record<string, unknown>,
    requiredProps?: string[],
): boolean => {
    if (Object.keys(obj).length === 0) return true;
    if (!requiredProps || requiredProps.length < 1) {
        for (const prop in obj) {
            if (obj[prop] === undefined || obj[prop] === null) return true;
        }
        return false;
    }
    return requiredProps.some(
        (prop) =>
            !(prop in obj) || obj[prop] === undefined || obj[prop] === null,
    );
};

const ignoreUnknownError = (error: unknown) => {
    const unknownError = "invalid page number";
    const messages = getErrorDetails(error).map(({ message }) =>
        message.toLowerCase(),
    );
    return messages.some((message) => message === unknownError);
};

export const handlePopupErrors = (response: unknown) => {
    if (ignoreUnknownError(response)) return;

    const details = getErrorDetails(response);
    const message = [...new Set(details.map((detail) => detail.message))].join(
        "\n",
    );
    showToast("error", "Error", message || standardErrorMessage);
};
