import { ref } from "vue";
import { useGlobalStore } from "@/store/global";

// 主题类型
export type ThemeType = "light" | "dark";

// 当前主题
export const currentTheme = ref<ThemeType>("light");
// 当前系统模式
export const currentSystemMode = ref<boolean>(false);

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

// 获取系统模式状态
export function getSystemModeStatus(): boolean {
  return JSON.parse(localStorage.getItem("systemMode") || "false");
}

// 设置系统模式状态
export function setSystemModeStatus(status: boolean) {
  currentSystemMode.value = status;
  localStorage.setItem("systemMode", JSON.stringify(status));
}

// 初始化主题
export function initTheme() {
  const store = useGlobalStore();
  const hasStoredTheme = localStorage.getItem("theme");

  if (hasStoredTheme) {
    // 使用存储的主题
    const systemModeFromStorage = getSystemModeStatus();
    currentSystemMode.value = systemModeFromStorage;

    const theme = (localStorage.getItem("theme") as ThemeType) || "light";
    applyTheme(theme);
  } else {
    // 根据配置决定主题
    const configMode = store.selfConfig?.options_system_mode;

    if (configMode === "system") {
      // 跟随系统设置
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = isDarkMode ? "dark" : "light";

      currentSystemMode.value = true;
      applyTheme(theme);
    } else {
      // 使用配置的主题
      const theme = configMode || "light";
      applyTheme(theme);
    }
  }
}
