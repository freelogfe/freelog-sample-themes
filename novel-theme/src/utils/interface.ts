// 展品
export interface ExhibitItem {
  presentableId: string;
  coverImages: string[];
  presentableTitle: string;
  tags: string[];
  resourceInfo: { resourceName: string };
  username: string;
  intro: string;
  createDate: string;
  updateDate: string;
  signCount: number;
}

// 资源
export interface ResourceItem {
  presentableId: string;
  resourceId: string;
  coverImages: string[];
  resourceName: string;
  tags: string[];
  username: string;
  intro: string;
  createDate: string;
  updateDate: string;
}

// 目录
export interface DirectoryItem {
  id: string;
  title: string;
  open: boolean;
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
  name: string;
  icon: string;
  bgColor: string;
}
