import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Honour a host-assigned port (preview tooling) but fall back to Vite's
    // default for plain `npm run dev`.
    port: Number(process.env.PORT) || 5173,
  },
});
