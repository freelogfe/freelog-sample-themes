import { freelogEntranceItem, shareBtnItem } from "./interface";

// freelog相关入口
export const freelogEntrances: freelogEntranceItem[] = [
  { label: "freelog fl-icon-a-featherlogo5", url: "https://www.freelog.com/" },
  {
    label: "关于freelog",
    url: "https://freelog4.freelog.com/$freelog-61f252ef6fe5c1002e2c7b4b=/home_id=62d0d202456ff0002e3295ab",
  },
  {
    label: "使用此主题",
    url: "https://console.freelog.com/resource/details/61f252ef6fe5c1002e2c7b4b",
  },
  { label: "浏览更多主题", url: "https://console.freelog.com/market?query=主题" },
];

// 展品列表排序映射
export const sortMappings = [
  { label: "更新时间倒序", value: "updateDate:-1" },
  { label: "更新时间正序", value: "updateDate:1" },
  { label: "发布时间倒序", value: "createDate:-1" },
  { label: "发布时间正序", value: "createDate:1" },
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
