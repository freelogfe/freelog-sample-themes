import { freelogApp } from "freelog-runtime";

/** 盛域详情页在主题内的路径（与 detailLocation 一致） */
export function shengyuDetailThemePath(exhibit: {
  exhibitId?: string;
  itemId?: string;
}) {
  const exhibitId = exhibit.exhibitId?.trim();
  if (!exhibitId) return "";
  const itemId = exhibit.itemId?.trim();
  return `/detail?id=${encodeURIComponent(exhibitId)}${
    itemId ? `&itemId=${encodeURIComponent(itemId)}` : ""
  }`;
}

/**
 * 在宿主（非插件 iframe）侧生成微信/QQ 扫码链。
 * 首页分享时 runtime 可能把 theme 写成 /home，需将 theme 纠正为 /detail。
 */
export function buildHostWechatQrUrl(tempUrl: string): string {
  if (!tempUrl) return "";
  const changeUrl = (freelogApp as any).getCurrentUrl(tempUrl);
  let qrUrl = (freelogApp as any).getWechatShareURL(changeUrl);
  return qrUrl
    .replace(/([?&]theme=)%2Fhome(?=&|$)/i, "$1%2Fdetail")
    .replace(/([?&]theme=)\/home(?=&|$)/i, "$1/detail");
}

export function buildShengyuExhibitWechatQrUrl(
  exhibit: { exhibitId?: string; itemId?: string }
): string {
  return buildHostWechatQrUrl(shengyuDetailThemePath(exhibit));
}