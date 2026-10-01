import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { SearchDto } from "./BaseDtos";

export type FacultyCreateDto = {
    name: string;
};

export type FacultyResponseDto = {
    id?: number | null;
    name?: string | null;
    details?: object | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: UserResponseDto[] | null;
    departments?: DepartmentResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
    subjects?: SubjectResponseDto[] | null;
};

export type FacultyUpdateDto = {
    name: string;
};

export type FacultyDeleteDto = {
    id: number;
};

export type FacultySearchDto = {
    id?: number | null;
} & SearchDto;
