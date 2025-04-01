export interface Exhibit {
  exhibitId: string;
  exhibitName: string;
  exhibitTitle: string;
  exhibitIntro: string;
  exhibitSubjectType: number;
  tags: string[];
  coverImages: string[];
  version: string;
  policies: Policy[];
  onlineStatus: number;
  nodeId: number;
  userId: number;
  articleInfo: ArticleInfo;
  status: number;
  createDate: string;
  updateDate: string;
  versionInfo: VersionInfo;
  defaulterIdentityType: number;
  signCount: number;
}

export interface Policy {
  policyId: string;
  policyName: string;
  status: number;
}

export interface ArticleInfo {
  articleId: string;
  articleName: string;
  resourceType: string[];
  articleType: number;
  serializeStatus: number;
  articleOwnerId: number;
  articleOwnerName: string;
}

export interface VersionInfo {
  exhibitId: string;
  exhibitProperty: ExhibitProperty;
  dependencyTree: DependencyTree[];
}

export interface ExhibitProperty {
  fileSize?: number;
  duration?: number;
  bitRate?: number;
  fileSizeUnit?: string;
  fileNameSuffix?: string;
  mime?: string;
  durationUnit?: string;
}

export interface DependencyTree {
  nid: string;
  articleId: string;
  articleName: string;
  articleType: number;
  version: string;
  versionRange: string;
  resourceType: string[];
  versionId: string;
  deep: number;
  parentNid: string;
  fileSha1: string | null;
}
