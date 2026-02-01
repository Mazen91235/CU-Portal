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
