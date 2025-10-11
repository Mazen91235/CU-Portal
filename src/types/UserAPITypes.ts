export type GetUserDataAPIResponse = {
    status: "success" | "error",
    message: string,
    data: {
        id: number,
        name: string,
        email: string,
        phone: string,
        national_id: string,
        gender: string,
        type: string,
        year: {
            id: number,
            year: number
            details: object
        } | null,
        department: {
            id: number,
            name: string,
            study_type: string,
            code: string,
            details: object,
        } | null,
        faculty: {
            id: number,
            name: string,
            details: object,
        } | null,
        section: number | null,
        status: boolean,
        is_early_access: boolean,
        role: {
            id: number,
            name: string,
            level: number,
        } | null,
        manages: object,
        details: object,
        pending_user: {
            id: number,
            url: string,
        } | null,
        google_name: string | null,
        google_email: string | null,
        google_avatar: string | null,
        ips: string[],
        notifications_count: number,
        created_at: string | null,
        modified_at: string | null,
    }
};