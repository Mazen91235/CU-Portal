import { linkify } from "./Linkify";
import { type ReactNode } from "react";

const getDiffHours = (date: Date): number => {
    const dateLocal = date.toLocaleString("en-US", {
        timeZone: "Africa/Cairo",
    });
    const dateLocalObj = new Date(dateLocal);
    const dateUTC = date.toLocaleString("en-US", {
        timeZone: "UTC",
    });
    const dateUTCObj = new Date(dateUTC);
    return (dateLocalObj.getTime() - dateUTCObj.getTime()) / (1000 * 60 * 60);
};

const parseDateValue = (dateTimeString?: string | Date | null): Date | null => {
    if (!dateTimeString) return null;
    if (dateTimeString instanceof Date) {
        return Number.isNaN(dateTimeString.getTime()) ? null : dateTimeString;
    }
    if (dateTimeString.includes("T")) {
        const date = new Date(dateTimeString);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    if (dateTimeString.includes(" ")) {
        const [datePart, timePart = "00:00:00"] = dateTimeString.split(" ");
        const parts = datePart.split("-");
        if (parts.length === 3) {
            parts.reverse();
            const date = new Date(`${parts.join("-")}T${timePart}`);
            return Number.isNaN(date.getTime()) ? null : date;
        }
    }
    const dateParts = dateTimeString.split("-").map(Number);
    if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) return null;
    const [year, month, day] = dateParts;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateTime = (
    dateTimeString?: string | Date | null,
    toDate = false,
    weekDay = true,
): string => {
    const date = parseDateValue(dateTimeString);
    if (!date) return "N/A";

    const normalized = new Date(date.getTime());
    if (toDate) {
        normalized.setHours(normalized.getHours() + getDiffHours(normalized));
        return normalized.toISOString();
    }
    if (weekDay) {
        return normalized.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            hour12: true,
            minute: "2-digit",
        });
    }
    return normalized.toLocaleTimeString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        hour12: true,
        minute: "2-digit",
    });
};

export const formatDate = (
    dateString?: string | Date | null,
    weekDay = true,
): string => {
    const date = parseDateValue(dateString);
    return date
        ? date.toLocaleDateString([], {
              weekday: weekDay ? "short" : undefined,
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "N/A";
};

export const formatCalendarDate = (
    dateString?: string | Date | null,
    weekDay = true,
): string => {
    if (!dateString) return "N/A";

    const date = formatDateTime(dateString, true);

    return date ? formatDate(date, weekDay) : "N/A";
};

export const formatTime = (dateTimeString?: string | Date | null): string => {
    const date = parseDateValue(dateTimeString);
    return date
        ? date.toLocaleTimeString([], {
              hour: "2-digit",
              hour12: true,
              minute: "2-digit",
          })
        : "N/A";
};

export const formatTimeAgo = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    if (!date) return "N/A";

    const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const interval in intervals) {
        const intervalSeconds = intervals[interval];
        const count = Math.floor(secondsAgo / intervalSeconds);
        if (count >= 1) {
            return `${count} ${interval}${count > 1 ? "s" : ""} ago`;
        }
    }
    return "Just now";
};

export const FORMAT_STRING_LIMITS = {
    CardTitle: 30,
    CardDescription: 60,
    CardContent: 80,
    StatCardContent: 30,
    CalendarCardTitle: 40,
    CalendarCardContent: 80,
    ListTitle: 50,
    ListContent: 100,
    PageTitle: 100,
    PageDescription: 180,
    Content: Infinity,
} as const;

export type FormatStringType = keyof typeof FORMAT_STRING_LIMITS;

export const formatString = (
    str?: string | null,
    viewer: number | FormatStringType = FORMAT_STRING_LIMITS.Content,
): ReactNode => {
    if (!str) return "N/A";

    const maxLength =
        typeof viewer === "number" ? viewer : FORMAT_STRING_LIMITS[viewer];

    const formatted =
        maxLength && str.length > maxLength
            ? str.substring(0, Math.max(0, maxLength - 5)) +
              "..." +
              str.substring(str.length - 5)
            : str;

    return linkify(formatted);
};

export const formatCalendarDay = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const getMonthDateRangeIso = (
    year: number,
    month: number,
): { date_from: string; date_to: string } => ({
    date_from: new Date(year, month, 1, 0, 0, 0, 0).toISOString(),
    date_to: new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(),
});

const padDateValue = (value: number): string => String(value).padStart(2, "0");

export const formatDateWithWeekday = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    if (!date) return "N/A";

    return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const formatDateInputValue = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    return date ? formatCalendarDay(date) : "";
};

export const formatTimeInputValue = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    return date
        ? `${padDateValue(date.getHours())}:${padDateValue(date.getMinutes())}`
        : "";
};

export const formatDateTimeInputValue = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    return date
        ? `${formatCalendarDay(date)}T${padDateValue(
              date.getHours(),
          )}:${padDateValue(date.getMinutes())}`
        : "";
};

export const mergeDateAndTime = (
    dateValue?: string | null,
    timeValue?: string | null,
): Date | undefined => {
    if (!dateValue) return undefined;
    const date = new Date(timeValue ? `${dateValue}T${timeValue}` : dateValue);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

export const toIsoFormat = (
    dateValue?: string | Date | null,
): string | undefined => {
    if (!dateValue) return undefined;

    const date =
        dateValue instanceof Date
            ? new Date(dateValue.getTime())
            : /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
              ? new Date(`${dateValue}T00:00:00`)
              : new Date(dateValue);

    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
};

export const parseDateString = (dateStr: string): Date | null => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
};

export const captitalize = (str?: string): string => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDateIntoPeriod = (
    dateTimeString?: string | Date | null,
): string => {
    const date = parseDateValue(dateTimeString);
    if (!date) return "N/A";

    const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secondsAgo < 60) return "Just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hr ago`;
    if (secondsAgo < 604800)
        return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) > 1 ? "s" : ""} ago`;
    if (secondsAgo < 2592000)
        return `${Math.floor(secondsAgo / 604800)} week${Math.floor(secondsAgo / 604800) > 1 ? "s" : ""} ago`;
    if (secondsAgo < 31536000)
        return `${Math.floor(secondsAgo / 2592000)} month${Math.floor(secondsAgo / 2592000) > 1 ? "s" : ""} ago`;
    return `${Math.floor(secondsAgo / 31536000)} year${Math.floor(secondsAgo / 31536000) > 1 ? "s" : ""} ago`;
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
