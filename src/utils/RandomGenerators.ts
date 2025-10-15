export function GenerateRandomString(length: number = -1): string {
    const randomString = crypto.randomUUID().replace("-", "");
    return length == -1 ? randomString : randomString.slice(0, length);
}
