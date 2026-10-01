import type { DepartmentStudyType } from "../entities/Department";
import type { UserResponseDto } from "./UserDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { SearchDto } from "./BaseDtos";

export type DepartmentCreateDto = {
    name: string;
    code: string;
    faculty_id: number;
    study_type: DepartmentStudyType;
};

export type DepartmentResponseDto = {
    id?: number | null;
    name?: string | null;
    code?: string | null;
    details?: object | null;
    study_type?: DepartmentStudyType | null;
    created_at?: string | null;
    updated_at?: string | null;
    faculty?: FacultyResponseDto | null;
    users?: UserResponseDto[] | null;
    subjects?: SubjectResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
};

export type DepartmentUpdateDto = {
    name: string;
    code: string;
    faculty_id: number;
    study_type: DepartmentStudyType;
};

export type DepartmentSearchDto = {
    id?: number | null;
    faculty_id?: number | null;
    study_type?: DepartmentStudyType | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
