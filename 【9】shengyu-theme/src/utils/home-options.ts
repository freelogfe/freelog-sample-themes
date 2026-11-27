/**
 * 首页「热门推荐」「最近更新」共用展示条数（options_homeRecentCount）
 * 其他首页模块仍使用主题内固定数量，不受此配置影响。
 */
export function getHomeRecentSectionCount(
  selfConfig: Record<string, unknown> | null | undefined,
  defaultValue = 12,
  max = 60
): number {
  const raw = selfConfig?.options_homeRecentCount;
  if (raw === undefined || raw === null || raw === "") {
    return defaultValue;
  }
  const parsed = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultValue;
  }
  return Math.min(parsed, max);
}