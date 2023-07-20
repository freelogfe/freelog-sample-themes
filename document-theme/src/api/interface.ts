/** 展品 */
export interface ExhibitItem {
  exhibitId: string;
  exhibitTitle: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string; resourceType: string };
  versionInfo: { exhibitProperty: { mime: string }; dependencyTree: any[] };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  height: number;
  content: string;
  defaulterIdentityType: number;
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
