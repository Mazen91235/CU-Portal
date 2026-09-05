import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { UserResponseDto } from "./UserDtos";
import type { TaskResponseDto } from "./TaskDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { MaterialResponseDto } from "./MaterialDtos";
import type { SearchDto } from "./BaseDtos";

export type SubjectCreateDto = {
    name: string;
    code: string;
    faculty_id: number;
    department_id: number;
    year_id: number;
    credits?: number | null;
    details?: object;
};

export type SubjectResponseDto = {
    id?: number | null;
    name?: string | null;
    code?: string | null;
    details?: object | null;
    is_old?: boolean | null;
    year_rank?: number | null;
    term?: number | null;
    credits?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    users?: UserResponseDto[] | null;
    tasks?: TaskResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
    materials?: MaterialResponseDto[] | null;
};

export type SubjectUpdateDto = {
    name: string;
    code: string;
    faculty_id: number;
    department_id: number;
    year_id: number;
    credits?: number | null;
    details?: object;
    is_old?: boolean;
};

export type SubjectSearchDto = {
    id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    is_old?: boolean | null;
    user_id?: number | null;
} & SearchDto;

export type SubjectSearchAvailableDto = {
    department_id: number;
    year_id: number;
} & SearchDto;
