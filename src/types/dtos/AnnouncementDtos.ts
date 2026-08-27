import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { SearchDto } from "./BaseDtos";
import type { LinkData } from "./TaskDtos";
import type { FileData } from "../entities/Task";

export type AnnouncementCreateDto = {
    title: string;
    content: string;
    date?: Date | null;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: LinkData[];
    details?: { files_data?: FileData[] };
};

export type AnnouncementResponseDto = {
    id?: number | null;
    title?: string | null;
    content?: string | null;
    date?: Date | null;
    urls?: string[] | null;
    links?: LinkData[] | null;
    details?: { files_data?: FileData[] } | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
};

export type AnnouncementUpdateDto = {
    title: string;
    content: string;
    date?: Date | null;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: LinkData[];
    details?: { files_data?: FileData[] };
};

export type AnnouncementDeleteDto = {
    id: number;
};

export type AnnouncementSearchDto = {
    id?: number | null;
    subject_id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    author_id?: number | null;
    date_from?: Date | null;
    date_to?: Date | null;
} & SearchDto;
