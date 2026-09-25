import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { SearchDto } from "./BaseDtos";
import type { LinkData } from "../entities/Task";

export type AnnouncementCreateDto = {
    title: string;
    content: string;
    date?: string | null;
    subject_id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    details?: { urls?: string[] | null; links?: LinkData[] | null };
};

export type AnnouncementResponseDto = {
    id?: number | null;
    title?: string | null;
    content?: string | null;
    date?: string | null;
    details?: { urls?: string[] | null; links?: LinkData[] | null } | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    attachments?: AttachmentResponseDto[] | null;
};

export type AnnouncementUpdateDto = {
    title: string;
    content: string;
    date?: string | null;
    subject_id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    details?: { urls?: string[] | null; links?: LinkData[] | null };
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
