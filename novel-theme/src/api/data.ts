import { freelogEntranceItem, shareBtnItem, ThemeItem } from "./interface";

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

// 阅读页主题色
export const readerThemeList: ThemeItem[] = [
  { bookColor: "#ffffff", bgColor: "#efefef", type: 0 },
  { bookColor: "#F6ECC9", bgColor: "#EAD9AA", type: 0 },
  { bookColor: "#E3EFE3", bgColor: "#CEE0CE", type: 0 },
  { bookColor: "#E2EFF2", bgColor: "#D1DEE1", type: 0 },
  { bookColor: "#F5E3E4", bgColor: "#EACECD", type: 0 },
  { bookColor: "#111111", bgColor: "#181818", type: 1 },
];

// freelog相关入口
export const freelogEntrances: freelogEntranceItem[] = [
  { label: "freelog fl-icon-a-featherlogo5", url: "https://www.freelog.com/" },
  {
    label: "关于freelog",
    url: "https://freelog4.freelog.com/$freelog-61f252ef6fe5c1002e2c7b4b=/home_id=62d0d202456ff0002e3295ab",
  },
  {
    label: "使用此主题",
    url: "https://console.freelog.com/resource/details/61f251286fe5c1002e2c7b41",
  },
  { label: "浏览更多主题", url: "https://console.freelog.com/market?query=主题" },
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
