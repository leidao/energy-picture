import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { presetUno } from "unocss";
import Unocss from "unocss/vite";
import { fileURLToPath, URL } from "node:url";
import ElementPlus from "unplugin-element-plus/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      presets: [presetUno()],
    }),
    ElementPlus({
      useSource: true,
    }),
  ],
  server: {
    /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
    host: true, // host: "0.0.0.0"
    /** 端口号 */
    port: 3333,
    /** 是否自动打开浏览器 */
    open: true,
    /** 跨域设置允许 */
    cors: true,
    /** 端口被占用时，是否直接退出 */
    strictPort: false,
    /** 接口代理 */
    proxy: {
      "/weatherData": {
        // target: "http://1081de84.r10.cpolar.top",
        target: "http://192.168.100.100:8090", //穿透地址
        ws: true,
        /** 是否允许跨域 */
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/weatherData/, ""),
      },
    },
    /** 预热常用文件，提高初始页面加载速度 */
    warmup: {
      clientFiles: ["./src/layouts/**/*.vue"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/css/element.scss" as *;`,
      },
    },
  },
});
