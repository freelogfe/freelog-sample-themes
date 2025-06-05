import { ref } from "vue";
import { useGlobalStore } from "@/store/global";

// 主题类型
export type ThemeType = "light" | "dark";

// 当前主题
export const currentTheme = ref<ThemeType>("light");

// 切换主题
export function toggleTheme(theme: ThemeType) {
  applyTheme(theme);
  localStorage.setItem("theme", theme);
}

// 应用主题
export function applyTheme(theme: ThemeType) {
  currentTheme.value = theme;
  document.documentElement.setAttribute("data-theme", theme);
}

// 初始化主题
export function initTheme() {
  // // 检查系统偏好
  // if(Boolean(localStorage.getItem('systemMode'))){
  //   const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   const mode = isDarkMode ? "dark" : "light";
  //   toggleTheme(mode);
  // }

  // if (!localStorage.getItem("theme")) {
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   currentTheme.value = prefersDark ? "dark" : "light";
  //   localStorage.setItem("theme", currentTheme.value);
  // }

  const store = useGlobalStore();

  const theme =
    (localStorage.getItem("theme") as ThemeType) || store.selfConfig.options_system_mode || "light";
  currentTheme.value = theme;

  applyTheme(currentTheme.value);
}
