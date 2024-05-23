import { ExhibitInfo } from "freelog-runtime";

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  signCount?: number;
  defaulterIdentityType?: number;
  intro?: string;
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
