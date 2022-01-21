// 展品
export interface ExhibitItem {
  exhibitId: string;
  exhibitTitle: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string };
  versionInfo: { exhibitProperty: { mime: string }, dependencyTree: any[] };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  isAuth: boolean;
}

// freelog相关入口
export interface freelogEntranceItem {
  label: string;
  url: string;
}
