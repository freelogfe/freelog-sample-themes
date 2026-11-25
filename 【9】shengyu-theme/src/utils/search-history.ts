const key = "shengyu-search-history";
export function readSearchHistory(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((x): x is string => typeof x === "string").map(x => x.trim()).filter(Boolean))].slice(0, 10)
      : [];
  } catch { return []; }
}
export function saveSearchHistory(history: string[]): void {
  try { localStorage.setItem(key, JSON.stringify(history)); } catch { /* Search remains usable without storage. */ }
}
export function addSearchHistory(history: string[], query: string): string[] {
  const word = query.trim().slice(0, 100);
  return word ? [word, ...history.filter(x => x.toLowerCase() !== word.toLowerCase())].slice(0, 10) : history;
}
