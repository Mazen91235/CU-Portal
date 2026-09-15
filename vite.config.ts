import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sitemapPlugin from "vite-plugin-sitemap";

const sitemapRoutes = [
    "/privacy-policy",
    "/terms-of-service",
    "/our-team",
    "/login",
    "/login-success",
    "/create-profile",
    "/verify-email",
    "/user",
    "/user/notifications",
    "/user/settings/profile",
    "/user/settings/academic",
    "/user/settings/courses",
    "/user/system/releases",
    "/user/notes",
    "/user/tasks",
    "/user/exams",
    "/user/announcements",
    "/user/courses",
    "/user/events",
    "/user/event-organizers",
    "/user/materials",
    "/user/other-materials",
    "/user/other-materials/years",
    "/user/other-materials/materials",
    "/user/calendar",
    "/user/timeline",
    "/user/weeks",
];

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        sitemapPlugin({
            hostname: "https://cu-portal.com",
            dynamicRoutes: sitemapRoutes,
            exclude: ["/admin", "/admin/*"],
            readable: true,
        }),
    ],
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: 'https://cu-portal.com',
    //       secure: true,
    //       rewrite: (path) => path.replace('/api', '/api/v1'),
    //     }
    //   }
    // }
});
