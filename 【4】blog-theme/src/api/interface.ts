import { ExhibitInfo } from "freelog-runtime";

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
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
    resourceType: string[];
    versions: {
      version: string;
      createDate: string;
    }[];
    otherInfo?: {
      [key: string]: any;
    };
    status: number;
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
