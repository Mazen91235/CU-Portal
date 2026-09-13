import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import Sitemap from "vite-plugin-sitemap";
import { publicRoutes } from "./sitemap.routes";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: "https://cu-portal.com",
      dynamicRoutes: [...publicRoutes],
      exclude: ["/login-success", "/create-profile", "/verify-email"],
      priority: { "/": 1.0, "/login": 0.9, "*": 0.5 },
      changefreq: { "/": "weekly", "*": "monthly" },
      generateRobotsTxt: false, // robots.txt is hand-maintained in public/
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
