import { useCallback } from "react";

export const useCheckCrawler = () => {
    const checkCrawler = useCallback(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const crawlerKeywords = [
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
        ];
        return crawlerKeywords.some((keyword) => userAgent.includes(keyword));
    }, []);
    return checkCrawler;
};
