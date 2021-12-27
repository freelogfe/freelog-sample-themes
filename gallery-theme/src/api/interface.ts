// 展品
export interface ExhibitItem {
  exhibitId: string;
  exhibitName: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string, resourceType: string };
  versionInfo: { exhibitProperty: { intro: string } };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  isAuth: boolean;
  height: number;
}

// freelog相关入口
export interface freelogEntranceItem {
  label: string;
  url: string;
}