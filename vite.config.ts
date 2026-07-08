import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // Sito one-page: unica entry, la home narrativa (index)
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
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
