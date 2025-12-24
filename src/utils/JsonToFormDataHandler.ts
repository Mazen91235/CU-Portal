export const ConvertJsonToFormData = (
    obj: Record<string, unknown>
): FormData => {
    const formData = new FormData();
    for (const key in obj) {
        const value = obj[key];
        const valueType = typeof value;
        let finalValue;
        try {
            finalValue =
                valueType == "object" ? (value as File) : String(value);
        } catch {
            finalValue = String(value);
        }
        if (value != undefined && value != null) {
            formData.append(key, finalValue);
        }
    }
    return formData;
};
