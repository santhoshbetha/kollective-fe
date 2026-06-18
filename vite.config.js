import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import typography from "@tailwindcss/typography";
import react from "@vitejs/plugin-react-swc";

// Use fileURLToPath for correct __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), typography],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
