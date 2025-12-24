import type { TimeTable } from "./TimeTable";

export type TableTask = {
    id?: number;
    name?: string;
    timetable?: TimeTable | null;
    timetable_id?: number | null;
    day?: number;
    rank?: number;
    start_time?: string | null;
    end_time?: string | null;
    duration?: number | null;
    details?: object;
    done?: boolean;
    late?: boolean;
};
