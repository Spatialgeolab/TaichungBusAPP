import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // 設定網頁進入點
  // base: "/TaichungBusAPP",
  plugins: [react()],
});
