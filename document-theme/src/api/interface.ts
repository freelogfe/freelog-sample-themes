// 展品
export interface ExhibitItem {
  exhibitId: string;
  exhibitName: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string, resourceType: string };
  versionInfo: { exhibitProperty: { mime: string }, dependencyTree: any[] };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  isAuth: boolean;
  height: number;
  content: string;
}

// freelog相关入口
export interface freelogEntranceItem {
  label: string;
  url: string;
}