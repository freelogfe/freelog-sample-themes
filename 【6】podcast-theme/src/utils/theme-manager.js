import Vue from "vue";
// 使用Vue.observable创建响应式状态
import store from "../store"; // 修改为相对路径或确认正确的路径

// 创建响应式状态对象
const state = Vue.observable({
  currentTheme: "light"
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

// 切换主题
export function toggleTheme(theme) {
  applyTheme(theme);
  localStorage.setItem("podcast-theme", theme);
}

// 应用主题
export function applyTheme(theme) {
  currentTheme.value = theme;
  document.documentElement.setAttribute("data-theme", theme);
  console.log(11111, currentTheme.value);
}

// 初始化主题
export function initTheme() {
  // // 检查系统偏好
  // if(Boolean(localStorage.getItem('podcast-systemMode'))){
  //   const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   const mode = isDarkMode ? "dark" : "light";
  //   toggleTheme(mode);
  // }

  // if (!localStorage.getItem("theme")) {
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   currentTheme.value = prefersDark ? "dark" : "light";
  //   localStorage.setItem("theme", currentTheme.value);
  // }

  try {
    const theme =
      localStorage.getItem("podcast-theme") ||
      (store && store.selfConfig && store.selfConfig.options_system_mode) ||
      "light";
    currentTheme.value = theme;

    applyTheme(currentTheme.value);
  } catch (error) {
    console.error("初始化主题失败:", error);
    // 使用默认主题作为后备
    applyTheme("light");
  }
}
