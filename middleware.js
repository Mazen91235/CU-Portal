const BOT_AGENTS = [
    "googlebot",
    "bingbot",
    "yandex",
    "baiduspider",
    "facebookexternalhit",
    "twitterbot",
    "rogerbot",
    "linkedinbot",
    "embedly",
    "quora link preview",
    "showyoubot",
    "outbrain",
    "pinterest/0.",
    "developers.google.com/+/web/snippet",
    "slackbot",
    "vkShare",
    "w3c_validator",
    "redditbot",
    "applebot",
    "whatsapp",
    "flipboard",
    "tumblr",
    "bitlybot",
    "skypeuripreview",
    "nuzzel",
    "discordbot",
    "google page speed",
    "qwantify",
];

export default async function middleware(request) {
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const url = new URL(request.url);

    // Skip static assets so bots download JS/CSS/Images directly
    const isStaticAsset =
        /\.(js|css|xml|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|mp4|woff|woff2|ttf|eot|svg|json)$/i.test(
            url.pathname,
        );

    // Check if incoming request is from a crawler
    const isBot = BOT_AGENTS.some((bot) => userAgent.includes(bot));

    if (isBot && !isStaticAsset) {
        // 1. Construct the target URL on your Render instance
        const prerenderUrl = `https://prerender-uaiw.onrender.com/${request.url}`;

        // 2. Fetch the pre-rendered HTML using native fetch()
        const prerenderResponse = await fetch(prerenderUrl, {
            headers: {
                "User-Agent": request.headers.get("user-agent") || "",
            },
        });

        const html = await prerenderResponse.text();

        // 3. Return the pre-rendered HTML directly to the crawler
        return new Response(html, {
            status: prerenderResponse.status,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Prerender": "1",
            },
        });
    }

    // Normal users pass through to Vercel's default CDN serving your Vite app
    return;
}
