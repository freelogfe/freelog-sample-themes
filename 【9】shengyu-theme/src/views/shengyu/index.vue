<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onActivated,
  onDeactivated,
  onBeforeUnmount
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useGlobalStore } from "@/store/global";
import { useMyPlay, useMyCollection, useMyAuth } from "@/utils/hooks";
import { freelogApp } from "freelog-runtime";
import Comments from "@/components/shengyu-comments.vue";
import Card from "@/components/shengyu-card.vue";
import MusicDetail from "@/components/shengyu-music-detail.vue";
import Sort from "@/components/shengyu-sort.vue";
import MusicList from "@/components/shengyu-music-list.vue";
import LibrarySkeleton from "@/components/shengyu-library-skeleton.vue";
import {
  visibleInCatalog,
  demoMode,
  resourceTypes,
  listEntries,
  listSongsPage,
  recommendedSongs,
  listCollectionsPage,
  refreshEntryAuth,
  unplayable,
  supportsAudio,
  detailAccessMessage,
  sortByRelease,
  collectionEntries,
  getEntry,
  entryKey,
  isCollection,
  entryCategory,
  searchEntries,
  searchCardMode,
  type AudioEntry
} from "@/api/shengyu";
const route = useRoute(),
  router = useRouter(),
  store = useGlobalStore();
const loading = ref(false),
  error = ref(""),
  notice = ref(""),
  expanded = ref(false),
  sort = ref("updateDate:-1");
const groups = ref<Record<string, AudioEntry[]>>({
  songs: [],
  albums: [],
  playlists: [],
  podcasts: [],
  episodes: []
});
const items = ref<AudioEntry[]>([]),
  detail = ref<AudioEntry>(),
  total = ref(0),
  filter = ref<keyof typeof resourceTypes>("songs");
const recommendations = ref<AudioEntry[]>([]);
const bannerDescription = ref<HTMLElement | null>(null);
const bannerOverflow = ref(false);
let bannerObserver: ResizeObserver | undefined;
function measureBannerDescription() {
  const element = bannerDescription.value;
  if (!element || !element.clientWidth) return;
  // Compare against the collapsed height even while the description is expanded.
  const collapsedHeight = parseFloat(getComputedStyle(element).lineHeight) * 5;
  bannerOverflow.value = element.scrollHeight > collapsedHeight + 1;
  if (!bannerOverflow.value) expanded.value = false;
}
watch(bannerDescription, element => {
  bannerObserver?.disconnect();
  if (!element) return;
  bannerObserver = new ResizeObserver(measureBannerDescription);
  bannerObserver.observe(element);
  measureBannerDescription();
}, { flush: "post" });
watch(() => store.nodeInfo.nodeShortDescription, async () => {
  await nextTick();
  measureBannerDescription();
});
onBeforeUnmount(() => bannerObserver?.disconnect());
const loadTrigger = ref<HTMLElement | null>(null);
const exhausted = ref(false);
const retryReset = ref(true);
const nextSkip = ref(0);
const refreshingList = ref(false);
let activatedOnce = false;
let pendingListRefresh = false;
let loadObserver: IntersectionObserver | undefined;
let visible = true;
let savedScrollTop = 0;
function observeLoadTrigger(element: HTMLElement | null) {
  loadObserver?.disconnect();
  if (!element || !visible || !active) return;
  loadObserver = new IntersectionObserver(
    entries => {
      if (
        active &&
        visible &&
        !loading.value &&
        !error.value &&
        hasMore.value &&
        entries.some(entry => entry.isIntersecting)
      ) {
        void load(false);
      }
    },
    { rootMargin: "0px 0px 200px 0px" }
  );
  loadObserver.observe(element);
}
watch(loadTrigger, observeLoadTrigger, { flush: "post" });
onBeforeRouteLeave(() => {
  savedScrollTop = document.getElementById("app")?.scrollTop || 0;
  visible = false;
  loadObserver?.disconnect();
});
onDeactivated(() => {
  visible = false;
  loadObserver?.disconnect();
});
onActivated(async () => {
  visible = true;
  const returning = activatedOnce;
  activatedOnce = true;
  if (returning && isCatalog) refreshCatalog();
  await nextTick();
  if (!active || !visible) return;
  document.getElementById("app")?.scrollTo({ top: savedScrollTop, behavior: "instant" });
  observeLoadTrigger(loadTrigger.value);
});
const recommendationError = ref(false);
const detailCategory = computed(() => (detail.value ? entryCategory(detail.value) : "songs"));
const recommendationTitle = computed(
  () =>
    ({ songs: "推荐音乐", albums: "推荐专辑", playlists: "推荐歌单", podcasts: "推荐节目" })[
      detailCategory.value
    ]
);
const recommendationPath = computed(
  () =>
    ({
      songs: "/voice-list",
      albums: "/album-list",
      playlists: "/play-list",
      podcasts: "/podcast-list"
    })[detailCategory.value]
);
async function loadRecommendations() {
  if (!detail.value) return;
  recommendationError.value = false;
  try {
    const types = resourceTypes[detailCategory.value];
    const count = detailCategory.value === "albums" ? 8 : detailCategory.value === "songs" ? 9 : 10;
    const response =
      detailCategory.value === "songs"
        ? await listSongsPage(0, count + 1)
        : detailCategory.value === "albums" || detailCategory.value === "playlists"
          ? await listCollectionsPage(detailCategory.value, 0, count + 1)
          : await listEntries(types, 0, count + 1);
    if (active)
      recommendations.value = response.dataList
        .filter(item => item.exhibitId !== detail.value?.exhibitId)
        .slice(0, count);
  } catch {
    if (active) recommendationError.value = true;
  }
}
let active = true,
  noticeTimer: ReturnType<typeof setTimeout>;
onBeforeUnmount(() => {
  active = false;
  loadObserver?.disconnect();
  clearTimeout(noticeTimer);
});
const path = route.path,
  home = path === "/home",
  details = path === "/detail",
  collection = path === "/collection-list",
  signed = path === "/signed-list",
  search = path === "/search-list";
const personalLibrary = collection || signed;
const isCatalog = ["/voice-list", "/album-list", "/play-list", "/podcast-list"].includes(path);
function refreshCatalog() {
  if (loading.value) {
    pendingListRefresh = true;
    return;
  }
  void load(true, true);
}
function selectCatalog(to: string) {
  if (to === route.path) refreshCatalog();
  else void router.push(to);
}
const kind =
  path === "/album-list"
    ? "albums"
    : path === "/play-list"
      ? "playlists"
      : path === "/podcast-list"
        ? "podcasts"
        : "songs";
const hasMore = computed(
  () =>
    !home &&
    !details &&
    !collection &&
    !signed &&
    !search &&
    !exhausted.value &&
    nextSkip.value < total.value
);
const showLibrarySkeleton = computed(
  () =>
    ["/voice-list", "/album-list", "/play-list", "/podcast-list", "/search-list"].includes(path) &&
    loading.value &&
    !refreshingList.value &&
    (retryReset.value || !items.value.length)
);
watch(
  () => [...store.authIdList],
  async ids => {
    if (demoMode) return;
    try {
      await refreshEntryAuth(
        [
          ...items.value,
          ...Object.values(groups.value).flat(),
          ...recommendations.value,
          ...(detail.value ? [detail.value] : [])
        ],
        ids
      );
    } catch {
      if (active) notify("授权状态刷新失败，请刷新页面重试");
    }
  }
);
const title = computed(() =>
  search
    ? route.query.q
      ? `“${String(route.query.q)}”的搜索结果`
      : "搜索音乐与播客"
    : collection
      ? "收藏"
      : signed
        ? "签约记录"
      : kind === "podcasts"
        ? "所有播客"
        : "所有音乐"
);
const displayed = computed(() => {
  let data = collection ? store.collectionList || [] : items.value;
  if (!signed) data = data.filter(visibleInCatalog);
  if (personalLibrary || search) data = data.filter(x => entryCategory(x) === filter.value);
  return !personalLibrary && !search && kind === "songs" ? sortByRelease(data, sort.value) : data;
});
const emptyMusicLibrary = computed(() =>
  ["/voice-list", "/album-list", "/play-list", "/podcast-list"].includes(path) &&
  !loading.value && !displayed.value.length && !error.value && !hasMore.value
);
const showSongList = computed(() => (personalLibrary || search)
  ? filter.value === 'songs' && displayed.value.length > 0
  : kind === 'songs');
const categoryTabs = [
  { label: "歌曲", value: "songs" },
  { label: "专辑", value: "albums" },
  { label: "歌单", value: "playlists" },
  { label: "播客", value: "podcasts" }
] as const;
const categoryCounts = computed(() => {
  const counts = { songs: 0, albums: 0, playlists: 0, podcasts: 0 };
  for (const item of (collection ? store.collectionList || [] : items.value).filter(item => signed || visibleInCatalog(item)))
    counts[entryCategory(item)]++;
  return counts;
});
const categoryLabel = computed(
  () => categoryTabs.find(tab => tab.value === filter.value)?.label || "歌曲"
);
const sections = [
  {
    key: "songs",
    title: "热门推荐",
    mode: "song",
    path: "/voice-list",
    grid: "songs"
  },
  {
    key: "albums",
    title: "新碟上架",
    mode: "album",
    path: "/album-list",
    grid: "albums"
  },
  {
    key: "playlists",
    title: "热门歌单",
    mode: "",
    path: "/play-list",
    grid: ""
  },
  {
    key: "podcasts",
    title: "热门节目",
    mode: "",
    path: "/podcast-list",
    grid: ""
  },
  {
    key: "episodes",
    title: "最近更新",
    mode: "episode",
    path: "/podcast-list",
    grid: "episodes"
  }
];
function notify(message: string) {
  notice.value = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 3500);
}
async function play(item: AudioEntry, startOnly = false) {
  if (demoMode) {
    notify("预览内容无音频，请接入 Freelog 节点后播放");
    return;
  }
  try {
    if (unplayable(item)) {
      notify(!supportsAudio(item) ? "此作品格式暂不支持访问" : "内容已下架或暂不可用");
      return;
    }
    if (
      startOnly &&
      store.playingInfo &&
      (isCollection(item)
        ? store.playingInfo.exhibitId === item.exhibitId
        : entryKey(store.playingInfo) === entryKey(item))
    ) {
      store.setData({ key: "playing", value: true });
      return;
    }
    if (
      !startOnly &&
      isCollection(item) &&
      store.playing &&
      store.playingInfo?.exhibitId === item.exhibitId
    ) {
      store.setData({ key: "playing", value: false });
      return;
    }
    if (
      !startOnly &&
      !isCollection(item) &&
      item.defaulterIdentityType === 0 &&
      store.playingInfo &&
      entryKey(store.playingInfo) === entryKey(item)
    ) {
      store.setData({ key: "playing", value: !store.playing });
      return;
    }
    if (isCollection(item) && item.defaulterIdentityType === 4) {
      const result = await freelogApp.addAuth(item.exhibitId, { immediate: true });
      if (result.status !== 0) return;
      await refreshEntryAuth([item], [item.exhibitId]);
    }
    const tracks = isCollection(item)
      ? (await collectionEntries(item)).filter(
          track => !unplayable(track) && track.defaulterIdentityType === 0
        )
      : [item];
    const playable = tracks[0];
    if (tracks.length > 1)
      for (const track of tracks)
        await useMyPlay.addToPlayList({
          exhibitId: track.exhibitId,
          itemId: track.itemId
        });
    if (!playable) {
      notify("暂无可播放的内容");
      return;
    }
    await useMyPlay.playOrPause(playable);
  } catch {
    notify("播放失败，请稍后重试");
  }
}
async function authorize(item: AudioEntry) {
  if (demoMode) return notify("请接入 Freelog 节点后授权");
  try {
    await useMyAuth.getAuth(item);
  } catch {
    notify("授权失败，请稍后重试");
  }
}
async function collect(item: AudioEntry) {
  if (demoMode) {
    notify("请接入 Freelog 节点后登录收藏");
    return;
  }
  try {
    await useMyCollection.operateCollect(item);
  } catch {
    notify("收藏失败，请稍后重试");
  }
}
async function addToQueue(target = detail.value) {
  if (!target) return;
  if (unplayable(target)) return notify("内容已下架或暂不可用");
  if (demoMode) {
    notify("请接入 Freelog 节点后使用播放队列");
    return;
  }
  try {
    const data = isCollection(target) ? items.value.filter(item => !unplayable(item)) : [target];
    for (const item of data)
      await useMyPlay.addToPlayList({
        exhibitId: item.exhibitId,
        itemId: item.itemId
      });
  } catch {
    notify("加入失败，请重试");
  }
}
function share(target = detail.value) {
  if (!target) return;
  store.setData({
    key: "shareInfo",
    value: {
      show: true,
      exhibit: {
        ...target,
        shareUrlGenerationException: "声屿主题",
        parentArticleType: target.parentArticleType || target.articleInfo?.articleType || 1
      }
    }
  });
}
async function load(reset = true, preserveList = false) {
  if (loading.value) return;
  refreshingList.value = preserveList && items.value.length > 0;
  retryReset.value = reset;
  if (reset) exhausted.value = false;
  loading.value = true;
  error.value = "";
  try {
    if (home) {
      const results = await Promise.all(
        Object.entries(resourceTypes).map(
          async ([key, type]) =>
            [
              key,
              (key === "songs"
                ? { dataList: await recommendedSongs() }
                : key === "albums" || key === "playlists"
                  ? await listCollectionsPage(key, 0, key === "albums" ? 8 : 10)
                  : await listEntries(type, 0, key === "songs" ? 12 : key === "albums" ? 8 : 10)
              ).dataList
            ] as const
        )
      );
      if (!active) return;
      for (const [key, data] of results)
        groups.value[key] = data;
      const episodes = await Promise.all(
        groups.value.podcasts.map(async p =>
          isCollection(p) ? (await collectionEntries(p)).slice(0, 2) : [p]
        )
      );
      if (active)
        groups.value.episodes = episodes
              .flat()
              .sort((a, b) => String(b.updateDate).localeCompare(String(a.updateDate)))
              .slice(0, 10);
    } else if (details) {
      const parent = await getEntry(String(route.query.id || route.query.exhibitId || ""));
      if (!parent) throw new Error("未找到该内容");
      const children = isCollection(parent) ? await collectionEntries(parent) : [];
      if (!active) return;
      detail.value =
        route.query.itemId
          ? children.find(x => x.itemId === route.query.itemId)
          : parent;
      if (!detail.value) throw new Error("未找到该节目");
      items.value = route.query.itemId ? [] : children;
      if (supportsAudio(detail.value)) void loadRecommendations();
    } else if (signed) {
      if (!demoMode && store.userData.isLogin) {
        await useMyAuth.getSignedList();
        if (active) items.value = store.signedList || [];
      } else if (active) items.value = [];
    } else if (collection) {
      if (!demoMode && store.userData.isLogin) await useMyCollection.getCollectionList();
    } else if (search) {
      const found = await searchEntries(String(route.query.q || ""), sort.value, () => active);
      if (active) {
        items.value = found;
        total.value = found.length;
      }
    } else {
      const offset = reset ? 0 : nextSkip.value;
      // Revalidate all loaded pages so returning to a scrolled list keeps its height.
      const limit = preserveList ? Math.max(40, nextSkip.value) : 40;
      const response =
        kind === "songs"
          ? await listSongsPage(offset, limit, sort.value)
          : kind === "albums" || kind === "playlists"
            ? await listCollectionsPage(kind, offset, limit, sort.value)
            : await listEntries(resourceTypes[kind], offset, limit, sort.value);
      if (active) {
        items.value = reset ? response.dataList : [...items.value, ...response.dataList];
        total.value = response.totalItem;
        nextSkip.value =
          "nextSkip" in response
            ? (response.nextSkip as number)
            : offset + response.dataList.length;
        exhausted.value =
          "exhausted" in response
            ? (response.exhausted as boolean)
            : response.dataList.length === 0 || nextSkip.value >= response.totalItem;
      }
    }
  } catch (e) {
    if (active) error.value = e instanceof Error ? e.message : "加载失败，请重试";
  } finally {
    if (active) loading.value = false;
    refreshingList.value = false;
    if (active && pendingListRefresh) {
      pendingListRefresh = false;
      refreshCatalog();
    }
  }
}
onMounted(() => load());
</script>
<template>
  <template v-if="home">
    <section
      class="sy-banner"
      :class="{ expanded }"
      :style="{
        backgroundImage: store.nodeInfo.coverImage ? `url(${JSON.stringify(store.nodeInfo.coverImage)})` : 'none'
      }"
    >
      <div class="sy-banner-content">
        <h1>
          {{ store.nodeInfo.nodeTitle || store.nodeInfo.nodeName || "FREELOG NODE" }}
        </h1>
        <div class="sy-banner-description">
        <p ref="bannerDescription">
          {{
            store.nodeInfo.nodeShortDescription ||
            "这里有音乐，也有播客\n与你分享生活的点点滴滴\n休闲\n娱乐\n每周日更新\n欢迎关注"
          }}
        </p>
        <button v-if="bannerOverflow && !expanded" class="sy-link" :aria-expanded="expanded" @click="expanded = true">
          更多
        </button>
        </div>
      </div>
    </section>
    <template v-for="(section, index) in sections" :key="section.key">
      <div v-if="index === 0 || index === 3" class="sy-category">
        <h2>
          <img :src="index === 0 ? themeAssets.music : themeAssets.podcast" alt="" />{{
            index === 0 ? "音乐" : "播客"
          }}
        </h2>
      </div>
      <section class="sy-section">
        <div class="sy-heading">
          <h3>{{ section.title }}</h3>
          <RouterLink :to="section.path" class="sy-section-more">
            <span>更多</span>
            <img :src="themeAssets.moreArrow" class="sy-section-more-arrow" alt="" />
          </RouterLink>
        </div>
        <div class="sy-grid" :class="section.grid">
          <Card
            v-for="item in groups[section.key].filter(visibleInCatalog)"
            :key="entryKey(item)"
            :item="item"
            :mode="section.mode"
            @authorize="authorize"
            @play="play"
            @collect="collect"
          />
        </div>
        <p
          v-if="!loading && !error && !groups[section.key].filter(visibleInCatalog).length"
          class="sy-home-empty"
          role="status"
        >
          暂无任何{{ section.key === 'songs' ? '音乐' : section.key === 'albums' ? '专辑' : section.key === 'playlists' ? '歌单' : '播客' }}
        </p>
      </section>
    </template>
  </template>
  <section
    v-else-if="details && detail && !supportsAudio(detail)"
    class="sy-unsupported"
    role="status"
  >
    <i class="freelog fl-icon-yichang_wenjiangeshicuowu" aria-hidden="true"></i>
    <p>此作品格式暂不支持访问</p>
  </section>
  <template v-else-if="details && detail">
    <div v-if="detailAccessMessage(detail)" class="sy-detail-access-alert" role="alert">
      {{ detailAccessMessage(detail) }}
    </div>
    <MusicDetail
      :item="detail"
      :tracks="items.filter(visibleInCatalog)"
      @play="play"
      @queue="addToQueue"
      @collect="collect"
      @share="share"
      @authorize="authorize"
    />
    <Comments v-if="!demoMode" :item="detail" />
    <section
      v-if="recommendations.filter(visibleInCatalog).length || recommendationError"
      class="sy-section sy-detail-recommendations"
    >
      <div class="sy-heading">
        <h3>{{ recommendationTitle }}</h3>
        <RouterLink :to="recommendationPath" class="sy-section-more"
          ><span>更多</span><img :src="themeAssets.moreArrow" class="sy-section-more-arrow" alt=""
        /></RouterLink>
      </div>
      <div
        class="sy-grid"
        :class="{ albums: detailCategory === 'albums', songs: detailCategory === 'songs' }"
      >
        <Card
          v-for="item in recommendations.filter(visibleInCatalog)"
          :key="entryKey(item)"
          :item="item"
          :mode="detailCategory === 'albums' ? 'album' : detailCategory === 'songs' ? 'song' : ''"
          @play="play"
          @collect="collect"
          @authorize="authorize"
        />
      </div>
      <button v-if="recommendationError" class="sy-link" @click="loadRecommendations">
        重新加载推荐
      </button>
    </section>
  </template>
  <section v-else-if="!details" :class="{ 'sy-library': personalLibrary || search, 'sy-music-library': !personalLibrary && !search && kind !== 'podcasts', 'sy-music-library-empty': emptyMusicLibrary, 'sy-podcast-library': !personalLibrary && !search && kind === 'podcasts' }">
    <h1>{{ title }}</h1>
    <nav v-if="!personalLibrary && !search && kind !== 'podcasts'" class="sy-tabs" aria-label="音乐分类">
      <button
        v-for="[label, to] in [
          ['歌曲', '/voice-list'],
          ['专辑', '/album-list'],
          ['歌单', '/play-list']
        ]"
        :key="to"
        :class="{ active: path === to }"
        @click="selectCatalog(to)"
      >
        {{ label }}
      </button>
    </nav>
    <nav
      v-if="personalLibrary || search"
      class="sy-library-tabs"
      :aria-label="search ? '搜索分类' : signed ? '签约分类' : '收藏分类'"
    >
      <button
        v-for="{ label, value } in categoryTabs"
        :key="value"
        :class="{ active: filter === value }"
        :aria-pressed="filter === value"
        @click="filter = value"
      >
        {{ label }}<template v-if="!search || !loading"> ({{ categoryCounts[value] }})</template>
      </button>
    </nav>
    <div v-if="!search && !personalLibrary && !emptyMusicLibrary" class="sy-toolbar">
      <Sort v-model="sort" :disabled="loading" @change="load()" />
    </div>
    <LibrarySkeleton
      v-if="showLibrarySkeleton"
      :kind="search ? filter : kind"
    />
    <MusicList
      v-else-if="showSongList && !emptyMusicLibrary"
      :items="displayed"
      @play="play"
      @queue="addToQueue"
      @collect="collect"
      @share="share"
      @authorize="authorize"
    />
    <div
      v-else-if="!emptyMusicLibrary"
      class="sy-grid"
      :class="{ albums: search || personalLibrary ? filter === 'albums' : kind === 'albums' }"
    >
      <Card
        v-for="item in displayed"
        :key="entryKey(item)"
        :item="item"
        :mode="search || personalLibrary ? searchCardMode(item) : kind === 'albums' ? 'album' : ''"
        @authorize="authorize"
        @play="play"
        @collect="collect"
      />
    </div>
    <p
      v-if="!loading && !displayed.length && !error && !hasMore"
      :class="personalLibrary || search || emptyMusicLibrary ? 'sy-library-empty' : 'sy-status'"
      role="status"
    >
      {{
        collection
          ? `没有收藏任何${categoryLabel}`
          : signed
            ? store.userData.isLogin
              ? `暂无任何${categoryLabel}签约记录`
              : "登录后查看签约记录"
          : search
            ? route.query.q
              ? `没有找到相关${categoryLabel}`
              : "在上方输入关键词，搜索音乐与播客"
            : emptyMusicLibrary
              ? `暂无任何${kind === 'albums' ? '专辑' : kind === 'playlists' ? '歌单' : kind === 'podcasts' ? '播客' : '音乐'}`
              : "暂无内容"
      }}
    </p>
    <div
      v-if="hasMore && !loading && !error"
      ref="loadTrigger"
      class="sy-load-trigger"
      aria-hidden="true"
    ></div>
  </section>
  <div v-if="error" class="sy-status" role="alert">
    <p>{{ error }}</p>
    <button @click="load(retryReset)">重新加载</button>
  </div>
  <div v-if="notice" class="sy-notice" role="status">{{ notice }}</div>
</template>
