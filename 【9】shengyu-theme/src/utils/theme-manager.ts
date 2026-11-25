import { ref } from "vue";
export type ThemeType = "light" | "dark";
export const currentTheme = ref<ThemeType>("dark");
export const currentSystemMode = ref(false);
const media = window.matchMedia("(prefers-color-scheme: dark)");
export function applyTheme(theme: ThemeType) {
  currentTheme.value = theme;
  // Freelog scopes CSS to the child app; its documentElement is the host's html.
  // Put tokens on an element inside that scope, not only on the host document.
  const root = document.getElementById("app");
  if (root) root.dataset.theme = theme;
  if (!window.__MICRO_APP_ENVIRONMENT__) document.documentElement.dataset.theme = theme;
}
export function getSystemModeStatus() {
  return localStorage.getItem("shengyu-system-mode") === "true";
}
export function setSystemModeStatus(status: boolean) {
  currentSystemMode.value = status;
  localStorage.setItem("shengyu-system-mode", String(status));
  if (status) applyTheme(media.matches ? "dark" : "light");
}
export function toggleTheme(theme: ThemeType) {
  setSystemModeStatus(false);
  applyTheme(theme);
  localStorage.setItem("shengyu-theme", theme);
}
export async function getThemeFromFreelog() {
  return localStorage.getItem("shengyu-theme");
}
export function initTheme() {
  const saved = localStorage.getItem("shengyu-theme");
  currentSystemMode.value = getSystemModeStatus();
  applyTheme(
    currentSystemMode.value
      ? media.matches
        ? "dark"
        : "light"
      : saved === "light"
        ? "light"
        : "dark",
  );
}
const onSystemChange = () => {
  if (currentSystemMode.value) applyTheme(media.matches ? "dark" : "light");
};
export function observeTheme() {
  media.addEventListener("change", onSystemChange);
  return () => media.removeEventListener("change", onSystemChange);
}
