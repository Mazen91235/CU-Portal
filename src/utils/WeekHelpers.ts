import type { WeekResponseDto } from "../types/dtos/WeekDtos";
import { formatDate, formatDateTime } from "./Formatter";

export const getWeekEndDate = (startDate?: string | null) => {
    if (!startDate) return null;
    const date = new Date(formatDateTime(startDate, true));
    date.setUTCDate(date.getUTCDate() + 6);
    return date.toISOString().slice(0, 10);
};

const getTodayKey = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });

export const isCurrentWeek = (week: WeekResponseDto) => {
    if (!week.start_date) return false;
    const startKey = formatDateTime(week.start_date, true).slice(0, 10);
    const endKey = getWeekEndDate(week.start_date);
    const todayKey = getTodayKey();
    return Boolean(endKey && todayKey >= startKey && todayKey <= endKey);
};

export const formatWeekLabel = (week?: WeekResponseDto | null) => {
    if (!week) return "Unknown Week";
    return `Week ${week.week_number ?? ""} (${formatDate(week.start_date, false)} - ${formatDate(getWeekEndDate(week.start_date), false)})${isCurrentWeek(week) ? " (Current)" : ""}`;
};
