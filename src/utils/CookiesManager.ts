export function GetCookie(name: string) {
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].trim();
        if (cookiePair.indexOf(name + "=") === 0) {
            return decodeURIComponent(cookiePair.substring(name.length + 1));
        }
    }
    return null;
}

export function SetCookie(name: string, value: string, seconds?: number) {
    let expires = "";
    if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + seconds * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
        name + "=" + encodeURIComponent(value) + expires + "; path=/";
}