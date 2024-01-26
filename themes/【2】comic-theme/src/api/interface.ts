// 展品
export interface ExhibitItem {
  exhibitId: string;
  exhibitTitle: string;
  exhibitIntro: string;
  coverImages: string[];
  tags: string[];
  articleInfo: { articleId: string; articleOwnerName: string; resourceType: string };
  versionInfo: { exhibitProperty: { intro: string } };
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
  defaulterIdentityType: number;
}

// 内容图片
export interface ContentImage {
  name: string;
  size: number;
  url: string;
  width: number;
  height: number;
}

// freelog 相关入口
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
