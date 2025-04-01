import { ExhibitInfo } from "freelog-runtime";

// 合集单品列表
export interface CollectionList {
  itemId: string;
  itemTitle: string;
  sortId: number;
  createDate: string;
  articleInfo: ExhibitInfo;
  defaulterIdentityType: number;
}

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  signCount?: number;
  defaulterIdentityType?: number;
  comicMode?: number;
  collectionList?: CollectionList[];
  serializeStatus?: number;
}

/** 内容图片 */
export interface ContentImage {
  name: string;
  size: number;
  url: string;
  width: number;
  height: number;
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
