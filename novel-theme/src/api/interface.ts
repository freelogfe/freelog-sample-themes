// 展品
export interface ExhibitItem {
  exhibitId: string;
  exhibitName: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleOwnerName: string };
  versionInfo: { exhibitProperty: { intro: string } };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  isAuth: boolean;
}

// 主题
export interface ThemeItem {
  bookColor: string;
  bgColor: string;
  type: number; // 0-浅色 1-深色
}

// freelog相关入口
export interface freelogEntranceItem {
  label: string;
  url: string;
}

// 分享按钮
export interface shareBtnItem {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
}
