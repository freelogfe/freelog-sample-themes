/** 展品 */
export interface ExhibitItem {
  exhibitId: string;
  exhibitTitle: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string; resourceType: string };
  versionInfo: { exhibitProperty: { intro: string } };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  defaulterIdentityType: number;
}

/** 分享按钮 */
export interface shareBtnItem {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
}
