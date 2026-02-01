export const formatDateTime = (
    dateTimeString?: string | null,
    toDate: boolean = false,
): string => {
    if (!dateTimeString) return "N/A";
    const datePartArray = dateTimeString.split(" ")[0].split("-");
    datePartArray.reverse();
    const datePart = datePartArray.join("-");
    const timePart = dateTimeString.split(" ")[1];
    dateTimeString = datePart + "T" + timePart;
    const date = new Date(dateTimeString);
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

export const formatString = (str: string, maxLength: number): string => {
    if (str.length > maxLength) {
        return (
            str.substring(0, maxLength - 5) +
            "..." +
            str.substring(str.length - 5)
        );
    }
    return str;
};
