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
}

// 收藏展品
export interface CollectExhibitItem {
  presentableId: string;
  cover: string;
  presentableTitle: string;
  username: string;
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
  name: string;
  readerBg: string;
}