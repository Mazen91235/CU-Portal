import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { SearchDto } from "./BaseDtos";

export type AnnouncementCreateDto = {
    title: string;
    content: string;
    date?: string | null;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: Record<string, string>[];
    details?: object;
};

export type AnnouncementResponseDto = {
    id?: number | null;
    title?: string | null;
    content?: string | null;
    date?: string | null;
    urls?: string[] | null;
    links?: Record<string, string>[] | null;
    details?: object | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
};

export type AnnouncementUpdateDto = {
    title: string;
    content: string;
    date?: string | null;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: Record<string, string>[];
    details?: object;
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
    date_from?: string | null;
    date_to?: string | null;
} & SearchDto;
