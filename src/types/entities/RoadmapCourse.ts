import type { Roadmap } from "./Roadmap";
import type { Subject } from "./Subject";

export type RoadmapCourse = {
    id?: number;
    name?: string;
    content?: string;
    roadmap?: Roadmap | null;
    roadmap_id?: number | null;
    course?: Subject | null;
    course_id?: number | null;
    rank?: number;
    url?: string | null;
    urls?: string[];
    details?: object;
    year?: number | null;
    term?: number | null;
};
