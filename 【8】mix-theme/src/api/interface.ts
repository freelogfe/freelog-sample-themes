import { ExhibitInfo } from "freelog-runtime";

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  [x: string]: any;
  collectionList?: any[];
  signCount?: number;
  latestSignDate?: string;
  defaulterIdentityType?: number;
  intro?: string;
  articleInfo: {
    articleId: string;
    articleName: string;
    articleType: number;
    articleOwnerId: number;
    articleOwnerName: string;
    firstVersionReleaseDate: string;
    resourceType: string[];
    versions: {
      version: string;
      createDate: string;
    }[];
    otherInfo?: {
      [key: string]: any;
    };
    status: number;
    comicMode?: number;
    // collectionList?: CollectionList[];
    serializeStatus?: number;
  };
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

// 合集单品列表
export interface CollectionList {
  itemId: string;
  itemTitle: string;
  sortId: number;
  createDate: string;
  articleInfo: ExhibitInfo;
  defaulterIdentityType: number;
}

/** 内容图片 */
export interface ContentImage {
  name: string;
  size: number;
  url: string;
  width: number;
  height: number;
}
