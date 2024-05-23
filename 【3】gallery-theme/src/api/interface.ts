import { ExhibitInfo } from "freelog-runtime";

/** 展品 */
export interface ExhibitItem extends ExhibitInfo {
  signCount?: number;
  defaulterIdentityType?: number;
  height?: number;
  intro?: string;
}

/** freelog 相关入口 */
export interface freelogEntranceItem {
  label: string;
  url: string;
}
