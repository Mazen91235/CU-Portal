import { useCallback } from "react";

export const useCheckCrawler = () => {
    const checkCrawler = useCallback(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const crawlerKeywordsSet = new Set([
            // Generic crawler terms
            "bot",
            "crawl",
            "spider",
            "slurp",
            // Google crawlers
            "googlebot",
            "mediapartners-google",
            "adsbot-google",
            "google-inspectiontool",
            "google-structured-data-testing-tool",
            "storebot-google",
            // Bing crawlers
            "bingbot",
            "bingpreview",
            "msnbot",
            // Yahoo
            "slurp",
            // Yandex
            "yandexbot",
            "yandex",
            // Baidu
            "baiduspider",
            // DuckDuckGo
            "duckduckbot",
            // Sogou
            "sogou",
            // Meta/Facebook crawlers
            "facebot",
            "facebookexternalhit",
            "facebook",
            "whatsapp",
            // Twitter/X
            "twitterbot",
            "x-bot",
            // LinkedIn
            "linkedinbot",
            "linkedin",
            // Pinterest
            "pinterest",
            "pinterestbot",
            // Instagram
            "instagram",
            // Other social media
            "slackbot",
            "telegrambot",
            "discordbot",
            // SEO/Analytics tools
            "semrushbot",
            "ahrefsbot",
            "mj12bot",
            "dotbot",
            "rogerbot",
            "screaming frog",
            // Archive bots
            "ia_archiver",
            "archive.org_bot",
            // Other common crawlers
            "exabot",
            "applebot",
            "petalbot",
            "seznambot",
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
        ]);
        const crawlerKeywords = Array.from(crawlerKeywordsSet);
        return crawlerKeywords.some((keyword) => userAgent.includes(keyword));
    }, []);
    return checkCrawler;
};
