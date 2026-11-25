import { freelogApp } from "freelog-runtime";
// Design fixture mode is retired; all pages now use node data.
export const demoMode = false;
export type AudioEntry = Record<string, any>;
export const resourceTypes = {
  songs: "音乐",
  albums: "音乐专辑",
  playlists: "歌单",
  podcasts: "连载播客,播客节目,播单",
};
export const entryKey = (item: AudioEntry) =>
  `${item.exhibitId}:${item.itemId || ""}`;
export const properties = (item: AudioEntry) =>
  item.versionInfo?.exhibitProperty || item.articleInfo?.articleProperty || {};
export const artist = (item: AudioEntry) =>
  properties(item).display_artist ||
  properties(item).artist ||
  properties(item)["艺人"] ||
  properties(item).author ||
  item.articleInfo?.articleOwnerName ||
  "";
export const isPodcast = (item: AudioEntry) =>
  String(item.parentResourceType || item.articleInfo?.resourceType || "").includes("播");
export const entryCategory = (item: AudioEntry): keyof typeof resourceTypes => {
  if (isPodcast(item)) return "podcasts";
  if (item.itemId) return "songs";
  if (item.articleInfo?.articleType === 1) return "songs";
  if (item.articleInfo?.articleType === 2) return "albums";
  if (item.articleInfo?.articleType === 3) return "playlists";
  const type = String(item.articleInfo?.resourceType || "");
  if (type.includes("音乐专辑")) return "albums";
  if (type.includes("歌单")) return "playlists";
  return "songs";
};
export const searchCardMode = (item: AudioEntry) => {
  if (isPodcast(item)) return "";
  if (entryCategory(item) === 'albums') return "album";
  return "";
};
export const duration = (item: AudioEntry) => {
  const value =
    item.duration ||
    properties(item).duration ||
    properties(item).collection_duration;
  if (!value) return "--:--";
  if (String(value).includes(":")) return value;
  // Freelog audio properties use milliseconds, as in music-theme's secondsToHMS.
  const milliseconds = Number(value);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "--:--";
  const seconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const clock = `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return hours ? `${String(hours).padStart(2, '0')}:${clock}` : clock;
};
export const isCollection = (item: AudioEntry) =>
  !item.itemId && [2, 3].includes(item.articleInfo?.articleType);
export const podcastSubtitle = (item: AudioEntry) => {
  if (!isCollection(item)) return '单集';
  const count = item.totalItem;
  return count != null && Number.isInteger(Number(count)) && Number(count) >= 0
    ? `${Number(count)}集` : '合集';
};
export const authAbnormal = (item: AudioEntry) => ![0, 4].includes(item.defaulterIdentityType);
export const detailAccessMessage = (item: AudioEntry) => {
  if (item.articleInfo?.status === 2) return '此作品因违规无法访问';
  if (item.onlineStatus === 0) return '作品已下架，无法访问';
  return [0, 4, undefined].includes(item.defaulterIdentityType) ? '' : '作品异常，无法访问';
};
// Filter presentation, not upstream pages: pagination must still advance past hidden entries.
export const visibleInCatalog = (item: AudioEntry) => !isPodcast(item) || !authAbnormal(item);
export const supportsAudio = (item: AudioEntry) => isCollection(item) ||
  ['audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/flac'].includes(properties(item).mime);
export const unplayable = (item: AudioEntry) => !supportsAudio(item) || authAbnormal(item) || item.onlineStatus === 0 || item.articleInfo?.status === 2;
export const sortByRelease = (items: AudioEntry[], sort: string) => {
  const timestamp = (item: AudioEntry) => Date.parse(item.updateDate || item.articleInfo?.latestVersionReleaseDate || item.createDate || '') || 0;
  return [...items].sort((a, b) => (timestamp(a) - timestamp(b)) * (sort.endsWith(':1') ? 1 : -1));
};
export const detailLocation = (item: AudioEntry) => ({
  path: "/detail",
  query: {
    id: item.exhibitId,
    ...(item.itemId ? { itemId: item.itemId } : {}),
  },
});
export async function listEntries(
  types: string,
  skip = 0,
  limit = 100,
  sort: string | null = "createDate:-1",
) {
  const response = await freelogApp.getExhibitListByPage({
    articleResourceTypes: types,
    isLoadVersionProperty: 1,
    skip,
    limit,
    ...(sort ? { sort } : {}),
  });
  const data = response.data.data as {
    dataList: AudioEntry[];
    totalItem: number;
  };
  if (data.dataList.length) {
    const statuses = (
      await freelogApp.getExhibitAuthStatus(
        data.dataList.map((x: AudioEntry) => x.exhibitId).join(","),
      )
    ).data.data;
    for (const item of data.dataList)
      item.defaulterIdentityType = statuses.find(
        (x: AudioEntry) => x.exhibitId === item.exhibitId,
      )?.defaulterIdentityType;
  }
  // podcast-theme obtains collection episode counts through this batch endpoint.
  const podcastCollections = data.dataList.filter(item => isPodcast(item) && isCollection(item) && item.totalItem == null);
  if (podcastCollections.length) {
    try {
      const counts = await freelogApp.getCollectionsSubListByPage(podcastCollections.map(item => item.exhibitId).join(','), {
        sortType: 1, skip: 0, limit: podcastCollections.length, isShowDetailInfo: 1,
      });
      if (counts.data.errCode === 0) {
        const countData = counts.data.data;
        const collections = Array.isArray(countData) ? countData : countData.dataList || [];
        for (const item of podcastCollections) {
          const collection = collections.find((entry: AudioEntry) => entry.exhibitId === item.exhibitId);
          if (collection) item.totalItem = collection.totalItem;
        }
      }
    } catch {
      // Keep covers and titles available if optional episode counts cannot be loaded.
    }
  }
  return data;
}
export async function listCollectionsPage(kind: 'albums' | 'playlists', skip = 0, limit = 40, sort = 'updateDate:-1') {
  const page = await listEntries(resourceTypes[kind], skip, limit, sort);
  const nextSkip = skip + page.dataList.length;
  return {
    ...page,
    dataList: page.dataList.filter(item => !item.itemId && !isPodcast(item) &&
      item.articleInfo?.articleType === (kind === 'albums' ? 2 : 3) && !authAbnormal(item)),
    // Advance by upstream exhibits even when this page has no matching collections.
    nextSkip,
    exhausted: page.dataList.length === 0 || nextSkip >= page.totalItem,
  };
}

export async function collectionEntries(parent: AudioEntry, limit = 100): Promise<AudioEntry[]> {
  const result: AudioEntry[] = [];
  let total = Infinity;
  while (result.length < total) {
    const response = await freelogApp.getCollectionSubListByPage(
      parent.exhibitId,
      { skip: result.length, limit, isShowDetailInfo: 1 },
    );
    const { dataList, totalItem } = response.data.data;
    total = totalItem;
    if (!dataList.length) break;
    const statuses = (
      await freelogApp.getCollectionSubAuthStatus(parent.exhibitId, {
        itemIds: dataList.map((x: AudioEntry) => x.itemId).join(","),
      })
    ).data.data;
    result.push(
      ...dataList.map((x: AudioEntry) => ({
        ...x,
        exhibitId: parent.exhibitId,
        exhibitTitle: x.itemTitle,
        albumName: parent.exhibitTitle,
        coverImages: x.coverImages?.length ? x.coverImages : parent.coverImages,
        exhibitIntro: x.articleInfo?.intro,
        updateDate: x.articleInfo?.latestVersionReleaseDate || x.updateDate || parent.updateDate,
        versionInfo: { exhibitProperty: x.articleInfo?.articleProperty },
        parentArticleType: parent.articleInfo?.articleType,
        parentResourceType: parent.articleInfo?.resourceType,
        defaulterIdentityType: statuses.find(
          (s: AudioEntry) => s.itemId === x.itemId,
        )?.defaulterIdentityType,
      })),
    );
  }
  return result;
}
// Keep homepage recommendations aligned with music-theme, independently of catalog pagination.
export async function recommendedSongs(): Promise<AudioEntry[]> {
  const page = await listEntries('音乐,音乐专辑', 0, 20, null);
  const songs: AudioEntry[] = [];
  for (const item of page.dataList) {
    if (item.articleInfo?.articleType === 2) {
      const tracks = await collectionEntries(item, 1000);
      songs.push(...tracks.map(track => ({
        ...track,
        onlineStatus: item.onlineStatus,
        updateDate: track.articleInfo?.latestVersionReleaseDate,
      })));
    } else {
      songs.push(item);
    }
  }
  return songs
    .filter(item => item.articleInfo?.status !== 2 && item.articleInfo?.articleType !== 3)
    .filter(item => !unplayable(item))
    .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
    .slice(0, 12);
}

// The cursor counts upstream exhibits, not the number of songs expanded from albums.
export async function listSongsPage(skip = 0, limit = 40, sort = 'createDate:-1') {
  const page = await listEntries(`${resourceTypes.songs},${resourceTypes.albums}`, skip, limit, sort);
  const songs: AudioEntry[] = [];
  for (const entry of page.dataList) {
    if (isPodcast(entry) || entry.articleInfo?.articleType === 3 || entryCategory(entry) === 'playlists') continue;
    if (entry.articleInfo?.articleType === 2) songs.push(...await collectionEntries(entry));
    else if (entryCategory(entry) === 'songs') songs.push(entry);
  }
  const nextSkip = skip + page.dataList.length;
  return {
    dataList: songs.filter(item => !isPodcast(item) && !isCollection(item) && !authAbnormal(item) && item.articleInfo?.status !== 2),
    totalItem: page.totalItem,
    nextSkip,
    exhausted: !page.dataList.length || nextSkip >= page.totalItem,
  };
}

export async function refreshEntryAuth(entries: AudioEntry[], exhibitIds: string[]) {
  const affected = entries.filter(item => exhibitIds.includes(item.exhibitId));
  for (const id of new Set(affected.map(item => item.exhibitId))) {
    const items = affected.filter(item => item.exhibitId === id);
    const parents = items.filter(item => !item.itemId);
    if (parents.length) {
      const response = await freelogApp.getExhibitAuthStatus(id);
      const status = response.data.data.find((item: AudioEntry) => item.exhibitId === id)?.defaulterIdentityType;
      parents.forEach(item => { item.defaulterIdentityType = status; });
    }
    const children = items.filter(item => item.itemId);
    if (children.length) {
      const response = await freelogApp.getCollectionSubAuthStatus(id, { itemIds: [...new Set(children.map(item => item.itemId))].join(',') });
      children.forEach(item => { item.defaulterIdentityType = response.data.data.find((status: AudioEntry) => status.itemId === item.itemId)?.defaulterIdentityType; });
    }
  }
}
export async function searchEntries(query: string, sort = "createDate:-1", isActive = () => true) {
  const word = query.trim().toLowerCase();
  if (!word) return [];
  const found = new Map<string, AudioEntry>();
  const match = (entry: AudioEntry) => {
    if (`${entry.exhibitTitle || ""} ${artist(entry)} ${entry.albumName || ""}`.toLowerCase().includes(word)) {
      found.set(entryKey(entry), entry);
    }
  };
  let offset = 0, total = Infinity;
  while (offset < total && isActive()) {
    const page = await listEntries(Object.values(resourceTypes).join(","), offset, 100, sort);
    if (!isActive()) return [];
    total = page.totalItem;
    if (!page.dataList.length) break;
    offset += page.dataList.length;
    for (const entry of page.dataList) {
      if (!isActive()) return [];
      match(entry);
      // The music theme also searches collection contents. Preserve that behavior for podcasts.
      if (isCollection(entry)) {
        const children = await collectionEntries(entry);
        if (!isActive()) return [];
        children.forEach(match);
      }
    }
  }
  const result = [...found.values()];
  if (sort === "exhibitTitle:1") result.sort((a, b) => String(a.exhibitTitle).localeCompare(String(b.exhibitTitle)));
  else result.sort((a, b) => String(a.createDate || a.updateDate || "").localeCompare(String(b.createDate || b.updateDate || "")) * (sort === "createDate:1" ? 1 : -1));
  return result;
}
export async function getEntry(id: string) {
  const [entry, status] = await Promise.all([
    freelogApp.getExhibitById(id, { isLoadVersionProperty: 1 }),
    freelogApp.getExhibitAuthStatus(id),
  ]);
  return {
    ...entry.data.data,
    defaulterIdentityType: status.data.data[0]?.defaulterIdentityType,
  };
}
