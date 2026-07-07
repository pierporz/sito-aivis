import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // Multi-page: la home narrativa (index) e la seconda pagina "Il funnel invisibile" (funnel)
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        funnel: resolve(__dirname, "funnel.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      // Polling rende affidabile l'hot reload dentro il container Docker
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
});
