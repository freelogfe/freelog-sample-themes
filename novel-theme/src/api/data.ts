import { freelogEntranceItem, shareBtnItem, ThemeItem } from "./interface";

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

// 节点主题色
export const themeList: any = {
  酷黑: { headerBg: "linear-gradient(135deg, #222222, #353535)" },
  炫丽: { headerBg: "linear-gradient(135deg, #C127FF, #35A3C5)" },
  活力: { headerBg: "linear-gradient(135deg, #F08840, #F0C23F)" },
  灰度: { headerBg: "linear-gradient(135deg, #2C3E50, #BDC3C7)" },
  蜜桃: { headerBg: "linear-gradient(135deg, #E7949F, #E2C1A3)" },
  清新: { headerBg: "linear-gradient(135deg, #5D9191, #A2D5C5)" },
  沉静: { headerBg: "linear-gradient(315deg, #2C5364, #0F2027)" },
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
  { label: "freelog fl-icon-a-featherlogo5", url: "" },
  { label: "关于freelog", url: "" },
  {
    label: "使用此主题",
    url: "http://console.testfreelog.com/resource/details/60ef9c4ea11650002e840fcd",
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

// 路由映射
export const routerMappings: any = {
  home: "首页",
  shelf: "我的书架",
  detail: "书籍详情",
  reader: "",
};
