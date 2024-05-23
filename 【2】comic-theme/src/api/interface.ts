import { ExhibitInfo } from "freelog-runtime";

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  signCount?: number;
  defaulterIdentityType?: number;
  comicMode?: number;
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
