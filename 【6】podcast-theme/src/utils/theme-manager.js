import Vue from "vue";
// 使用Vue.observable创建响应式状态
import store from "../store"; // 修改为相对路径或确认正确的路径

// 创建响应式状态对象
const state = Vue.observable({
  currentTheme: "light",
  currentSystemMode: false
});

// 当前主题 - 提供getter
export const currentTheme = {
  get value() {
    return state.currentTheme;
  },
  set value(theme) {
    state.currentTheme = theme;
  }
};

// 当前系统模式 - 提供getter
export const currentSystemMode = {
  get value() {
    return state.currentSystemMode;
  },
  set value(status) {
    state.currentSystemMode = status;
  }
};

// 切换主题
export function toggleTheme(theme) {
  applyTheme(theme);
  localStorage.setItem("podcast-theme", theme);
}

// 应用主题
export function applyTheme(theme) {
  currentTheme.value = theme;
  document.documentElement.setAttribute("data-theme", theme);
}

// 获取系统模式状态
export function getSystemModeStatus() {
  return JSON.parse(localStorage.getItem("podcast-systemMode") || "false");
}

// 设置系统模式状态
export function setSystemModeStatus(status) {
  currentSystemMode.value = status;
  localStorage.setItem("podcast-systemMode", JSON.stringify(status));
}

// 初始化主题
export function initTheme() {
  const hasStoredTheme = localStorage.getItem("podcast-theme");

  if (hasStoredTheme) {
    // 使用存储的主题
    const systemModeFromStorage = getSystemModeStatus();
    currentSystemMode.value = systemModeFromStorage;

    const theme = localStorage.getItem("podcast-theme") || "light";
    applyTheme(theme);
  } else {
    // 根据配置决定主题
    const configMode = store?.state?.selfConfig?.options_system_mode;

    if (configMode === "跟随系统") {
      // 跟随系统设置
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = isDarkMode ? "dark" : "light";

      currentSystemMode.value = true;
      applyTheme(theme);
    } else {
      // 使用配置的主题
      const theme = configMode ? (configMode === "浅色模式" ? "light" : "dark") : "light";
      applyTheme(theme);
    }
  }
}
