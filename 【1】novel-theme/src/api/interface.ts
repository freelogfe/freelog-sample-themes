import { ExhibitInfo } from "freelog-runtime";

// 合集单品列表

export interface CollectionList {
  itemId: string;
  itemTitle: string;
  sortId: number;
  createDate: string;
  createData: string;
  articleInfo: ExhibitInfo;
  defaulterIdentityType: number;
}

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  signCount?: number;
  defaulterIdentityType?: number;
  collectionList: CollectionList[];
}

/** 主题 */
export interface ThemeItem {
  bookColor: string;
  bgColor: string;
  type: number; // 0-浅色 1-深色
}

/** freelog 相关入口 */
export interface freelogEntranceItem {
  label: string;
  url: string;
}

/** 分享按钮 */
export interface shareBtnItem {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
}
