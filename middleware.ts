const botUserAgents = [
  "googlebot",
  "bingbot",
  "yandex",
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "redditbot",
  "applebot",
  "whatsapp",
  "telegrambot",
  "pinterest",
  "gptbot",
  "oai-searchbot",
  "chatgpt",
  "claudebot",
  "perplexitybot",
  "amazonbot",
];

const ignoredExtensions = [
  ".js",
  ".css",
  ".json",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".webmanifest",
  ".txt",
  ".xml",
];

const neverPrerenderPrefixes = ["/user", "/admin"];

function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return botUserAgents.some((bot) => ua.includes(bot));
}

function isStaticAsset(pathname: string): boolean {
  const ext = pathname.slice(pathname.lastIndexOf("."));
  return ignoredExtensions.includes(ext);
}

export default async function middleware(
  request: Request,
): Promise<Response | undefined> {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent");

  if (
    request.headers.get("x-prerender") ||
    isStaticAsset(url.pathname) ||
    neverPrerenderPrefixes.some((prefix) => url.pathname.startsWith(prefix)) ||
    !isBotRequest(userAgent)
  ) {
    return undefined;
  }

  const prerenderUrl = `https://service.prerender.io/${url.toString()}`;
  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.set("X-Prerender-Token", process.env.PRERENDER_TOKEN ?? "");

  try {
    const prerenderedResponse = await fetch(prerenderUrl, {
      headers: proxyHeaders,
      redirect: "manual",
    });

    const responseHeaders = new Headers(prerenderedResponse.headers);
    responseHeaders.set("X-Prerender-Origin-Url", url.toString());

    return new Response(prerenderedResponse.body, {
      status: prerenderedResponse.status,
      statusText: prerenderedResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return undefined;
  }
}

export const config = {
  runtime: "edge",
  matcher: "/:path*",
};
