export const formatDateTime = (
    dateTimeString?: string | null,
    toDate: boolean = false,
): string => {
    if (!dateTimeString) return "N/A";
    let date: Date;
    if (dateTimeString.includes("T")) {
        date = new Date(dateTimeString);
    } else {
        const datePartArray = dateTimeString.split(" ")[0].split("-");
        datePartArray.reverse();
        const datePart = datePartArray.join("-");
        const timePart = dateTimeString.split(" ")[1];
        dateTimeString = datePart + "T" + timePart;
        date = new Date(dateTimeString);
    }
    if (toDate) {
        date.setHours(date.getHours() + getDiffHours(date));
        return date.toISOString();
    }
    return date.toLocaleTimeString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getDiffHours = (date: Date): number => {
    const dateLocal = date.toLocaleString("en-US", {
        timeZone: "Africa/Cairo",
    });
    const dateLocalObj = new Date(dateLocal);
    const dateUTC = date.toLocaleString("en-US", {
        timeZone: "UTC",
    });
    const dateUTCObj = new Date(dateUTC);
    return (dateLocalObj.getTime() - dateUTCObj.getTime()) / (1000 * 60 * 60);
};

export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    let date: Date;
    if (dateString.includes("T")) {
        date = new Date(dateString);
    } else {
        const datePartArray = dateString.split("-");
        datePartArray.reverse();
        const datePart = datePartArray.join("-");
        date = new Date(datePart);
    }
    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatTime = (dateTimeString?: string | null): string => {
    if (!dateTimeString) return "N/A";
    const timePart = dateTimeString.split(" ")[1];
    const date = new Date("1970-01-01T" + timePart);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatTimeAgo = (dateTimeString?: string | null): string => {
    if (!dateTimeString) return "N/A";
    let date: Date;
    const now = new Date();
    if (dateTimeString.includes("T")) {
        date = new Date(dateTimeString);
    } else {
        const datePartArray = dateTimeString.split(" ")[0].split("-");
        datePartArray.reverse();
        const datePart = datePartArray.join("-");
        const timePart = dateTimeString.split(" ")[1];
        dateTimeString = datePart + "T" + timePart;
        date = new Date(dateTimeString);
    }
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };
    for (const interval in intervals) {
        const intervalSeconds = intervals[interval];
        const count = Math.floor(secondsAgo / intervalSeconds);
        if (count >= 1) {
            return `${count} ${interval}${count > 1 ? "s" : ""} ago`;
        }
    }
    return "Just now";
};

export const formatString = (str?: string, maxLength?: number): string => {
    if (!str) return "N/A";
    if (maxLength && str.length > maxLength) {
        return (
            str.substring(0, maxLength - 5) +
            "..." +
            str.substring(str.length - 5)
        );
    }
    return str;
};

export const formatCalendarDay = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const parseDateString = (dateStr: string): Date | null => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
};

export const captitalize = (str?: string): string => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1);
};
