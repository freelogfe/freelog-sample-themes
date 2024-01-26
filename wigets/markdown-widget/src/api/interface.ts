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
  defaulterIdentityType: number;
}
