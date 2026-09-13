import type { LogResponseDto } from "../../../types/dtos/LogDtos";

export const staticLogs: LogResponseDto[] = [
    { id: 1008, action: "Updated profile", entity: "User", level: "Info", response_code: 200, message: "User profile was updated successfully.", route: "/api/users/12", ip: "192.168.1.42", created_at: "2026-09-05T10:14:00Z", details: { changed_fields: ["phone", "gender"], source: "admin-panel", success: true }, user: { id: 12, name: "Mariam Hassan", email: "mariam@example.com" } },
    { id: 1001, action: "User logged in", entity: "Authentication", level: "Info", response_code: 200, created_at: "2026-09-04T09:42:00Z", user: { id: 12, name: "Mariam Hassan", email: "mariam@example.com" } },
    { id: 1002, action: "Updated course", entity: "Course", level: "Info", response_code: 200, created_at: "2026-09-04T09:18:00Z", user: { id: 7, name: "Omar Khaled", email: "omar@example.com" } },
    { id: 1003, action: "Deleted announcement", entity: "Announcement", level: "Warning", response_code: 204, created_at: "2026-09-03T16:05:00Z", user: { id: 7, name: "Omar Khaled", email: "omar@example.com" } },
    { id: 1004, action: "Failed permission check", entity: "User", level: "Error", response_code: 403, created_at: "2026-09-03T13:27:00Z", user: { id: 21, name: "Nour Adel", email: "nour@example.com" } },
    { id: 1005, action: "Requested user export", entity: "Report", level: "Warning", response_code: 302, created_at: "2026-09-02T11:12:00Z", user: { id: 12, name: "Mariam Hassan", email: "mariam@example.com" } },
    { id: 1006, action: "Created task", entity: "Task", level: "Info", response_code: 201, created_at: "2026-09-01T08:46:00Z", user: { id: 34, name: "Youssef Ali", email: "youssef@example.com" } },
    { id: 1007, action: "Service unavailable", entity: "Authentication", level: "Error", response_code: 503, created_at: "2026-08-31T18:30:00Z", user: { id: 21, name: "Nour Adel", email: "nour@example.com" } },
];
