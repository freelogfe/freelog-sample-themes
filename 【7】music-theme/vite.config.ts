import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mkcert()],
  server: {
    port: 8107,
    host: true,
    open: "https://192.168.2.8:8107/"
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, ".", "src")
    }
  }
});
