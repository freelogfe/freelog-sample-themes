import { freelogEntranceItem, shareBtnItem, ThemeItem } from "../utils/interface";

// 搜索类型
export const bookTypeList = [
  "玄幻",
  "武侠",
  "科幻",
  "都市",
  "言情",
  "历史",
  "军事",
  "游戏",
  "体育",
  "灵异",
  "惊悚",
  "悬疑",
  "推理",
  "名著",
  "外国文学",
];

// 主题选项
export const themeList: ThemeItem[] = [
  { bookColor: "#ffffff", bgColor: "#efefef", type: 0 },
  { bookColor: "#F6ECC9", bgColor: "#EAD9AA", type: 0 },
  { bookColor: "#E3EFE3", bgColor: "#CEE0CE", type: 0 },
  { bookColor: "#E2EFF2", bgColor: "#D1DEE1", type: 0 },
  { bookColor: "#F5E3E4", bgColor: "#EACECD", type: 0 },
  { bookColor: "#111111", bgColor: "#181818", type: 1 },
];

// freelog相关入口
export const freelogEntrances: freelogEntranceItem[] = [
  { label: "freelog", url: "" },
  { label: "关于freelog", url: "" },
  { label: "使用此主题", url: "http://console.testfreelog.com/resource/details/60ef9c4ea11650002e840fcd" },
  { label: "浏览更多主题", url: "http://console.testfreelog.com/market" },
];

// 分享按钮
export const shareBtns: shareBtnItem[] = [
  { name: "qqZone", icon: "fl-icon-kongjian", bgColor: "#66d8f7" },
  { name: "qq", icon: "fl-icon-QQ", bgColor: "#5382d3" },
  { name: "weibo", icon: "fl-icon-weibo", bgColor: "#ff6f68" },
  { name: "wechat", icon: "fl-icon-weixin", bgColor: "#1ec76f" },
  { name: "douban", icon: "fl-icon-douban", bgColor: "#42a151" },
];
