/*
 * @Description:
 * @Author: ldx
 * @Date: 2025-01-14 15:14:05
 * @LastEditors: leidao 18015816566@163.com
 * @LastEditTime: 2025-01-14 17:21:57
 */
import { createApp } from "vue";
import "@/css/style.css";
import "uno.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "simplebar-vue/dist/simplebar.min.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn,
});

app.mount("#app");
