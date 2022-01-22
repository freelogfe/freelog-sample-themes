import { freelogEntranceItem, shareBtnItem } from "./interface";

// 节点主题色
export const themeList: any = {
  酷黑: { gradientColor: "linear-gradient(135deg, #222222, #353535)", deriveColor: "#222222" },
  炫丽: { gradientColor: "linear-gradient(135deg, #C127FF, #35A3C5)", deriveColor: "#C127FF" },
  活力: { gradientColor: "linear-gradient(135deg, #F08840, #F0C23F)", deriveColor: "#F08840" },
  灰度: { gradientColor: "linear-gradient(135deg, #2C3E50, #BDC3C7)", deriveColor: "#2C3E50" },
  蜜桃: { gradientColor: "linear-gradient(135deg, #E7949F, #E2C1A3)", deriveColor: "#E7949F" },
  清新: { gradientColor: "linear-gradient(135deg, #5D9191, #A2D5C5)", deriveColor: "#5D9191" },
  沉静: { gradientColor: "linear-gradient(315deg, #2C5364, #0F2027)", deriveColor: "#0F2027" },
};

// freelog相关入口
export const freelogEntrances: freelogEntranceItem[] = [
  { label: "freelog fl-icon-a-featherlogo5", url: "" },
  { label: "关于freelog", url: "" },
  {
    label: "使用此主题",
    url: "http://console.testfreelog.com/resource/details/617654aae886b0003419469d",
  },
  { label: "浏览更多主题", url: "http://console.testfreelog.com/market" },
];

// 分享按钮
export const shareBtns: shareBtnItem[] = [
  {
    id: "qqZone",
    name: "QQ空间",
    icon: "fl-icon-kongjian",
    bgColor: "#66d8f7",
  },
  { id: "qq", name: "QQ", icon: "fl-icon-QQ", bgColor: "#5382d3" },
  { id: "weibo", name: "微博", icon: "fl-icon-weibo", bgColor: "#ff6f68" },
  { id: "wechat", name: "微信", icon: "fl-icon-weixin", bgColor: "#1ec76f" },
  { id: "douban", name: "豆瓣", icon: "fl-icon-douban", bgColor: "#42a151" },
];
