import { defineStore } from "pinia";
import { nextTick } from "vue";

// @ts-ignore
import { judgeDevice, judgeIOSDevice } from "@/utils/common";
// @ts-ignore
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { currentTheme, ThemeType } from "@/utils/theme-manager";
import { freelogApp, widgetApi } from "freelog-runtime";

interface UserData {
  isLogin: boolean | null;
  [key: string]: any;
}

interface ShareInfo {
  show: boolean;
  exhibit: any | null;
}

export interface State {
  inMobile: boolean | null;
  isIOS: boolean | null;
  userData: UserData;
  selfConfig: Record<string, any>;
  selfWidgetConfig: Record<string, any>;
  locationHistory: string[];
  routerMode: number;
  shareInfo: ShareInfo;
  signedList: any[] | null;
  collectionIdList: string[];
  collectionList: any[] | null;
  playIdList: string[];
  playList: any[] | null;
  playListLoading: boolean;
  playingInfo: any | null;
  playing: boolean;
  initUrl: string;
  progress: number;
  authIdList: string[];
  searchKey: string;
  nodeInfo: Record<string, any>;
  playMode: string | null;
  playerShowStatus: boolean;
  playerCollapsed: boolean;
  theme: ThemeType;
  maskLoading: boolean;
}

export const useGlobalStore = defineStore("global", {
  state: (): State => {
    return {
      inMobile: null, // 是否移动端设备
      isIOS: null, // 是否 IOS 设备
      userData: { isLogin: null }, // 当前登录的用户数据
      selfConfig: {}, // 自定义配置
      selfWidgetConfig: {}, // 自定义插件配置
      locationHistory: [], // 历史路由
      routerMode: 1, // 当前路由模式 1-push 2-back
      shareInfo: { show: false, exhibit: null }, // 分享数据
      signedList: null, // 签约列表
      collectionIdList: [], // 收藏列表(id)
      collectionList: null, // 收藏列表
      playIdList: [], // 播放列表(id)
      playList: [], // 播放列表
      playListLoading: false, // 播放列表加载状态
      playingInfo: null, // 播放中的声音信息
      playing: false, // 是否在播放中
      initUrl: "", // 播放器初始化 url（用于解决 IOS 无法异步播放声音问题）
      progress: 0, // 当前播放进度
      authIdList: [], // 已授权 id 集合（用于刷新首页列表、声音列表、搜索结果列表、详情页授权状态）
      searchKey: "", // 搜索关键词
      nodeInfo: {},
      playMode: null, // 播放模式，顺序播放、随机播放,
      playerShowStatus: true, // 空队列时也显示原播放器入口
      playerCollapsed: true, // 默认使用右下角 compact 态
      theme: currentTheme.value as ThemeType,
      maskLoading: false
    };
  },
  getters: {},
  actions: {
    async setData<K extends keyof State>(payload: { key: K; value: State[K] }) {
      this.$state[payload.key] = payload.value;
      await nextTick(); // 确保所有 DOM 更新完成
    },
    /** 初始化 store */
    async initStoreData() {
      // this.initThemeState();
      // freelogApp.setUserData("playIdList", []);
      // freelogApp.setUserData("collectionIdList", []);

      const userData = freelogApp.getCurrentUser();
      const [
        selfConfig,
        _selfWidgetConfig,
        collectionIdListResponse,
        playingIdResponse,
        playModeResponse
      ] = await Promise.all([
        freelogApp.getSelfPropertyForTheme(),
        freelogApp.getSelfProperty(),
        freelogApp.getUserData("shengyu-collectionIdList"),
        freelogApp.getUserData("shengyu-playingId"),
        freelogApp.getUserData("playMode")
      ]);

      const widgetData = widgetApi.getData();
      const subDepsData = widgetData?.themeInfo?.versionInfo?.dependencyTree?.find(
        (item: any) => item.articleName === "ZhuC/Freelog插件-评论插件"
      );
      const commentWidgetData = subDepsData ? await freelogApp.getExhibitDepInfo(widgetData.themeInfo.exhibitId, {
        articleNids: subDepsData.nid
      }) : null;

      const collectionIdList = collectionIdListResponse?.data?.data || [];
      console.log("collectionIdList", collectionIdList);
      const playingId = playingIdResponse?.data?.data;

      // 节点信息
      this.nodeInfo = freelogApp.nodeInfo;

      // 播放模式
      this.playMode = typeof playModeResponse?.data?.data === "string" ? playModeResponse.data.data : "NORMAL";

      // 是否移动端设备
      const inMobile = judgeDevice();
      this.inMobile = inMobile;

      if (inMobile) {
        // 是否 IOS 设备
        const isIOS = judgeIOSDevice();
        this.isIOS = isIOS;
      }

      // 当前登录用户数据
      this.userData = userData ? { ...userData, isLogin: true } : { isLogin: false };

      // 自定义选项
      this.selfConfig = selfConfig;
      this.selfWidgetConfig = commentWidgetData?.data?.data?.[0]?.articleProperty || {};

      // 获取签约列表
      useMyAuth.getSignedList();

      // 收藏列表
      this.collectionIdList = Array.isArray(collectionIdList) ? collectionIdList : [];

      // 播放列表
      let playIdList = [];
      if (this.userData.isLogin) {
        // 登录时播放列表取用户数据
        const playIdListResponse = await freelogApp.getUserData("shengyu-playIdList");
        playIdList = Array.isArray(playIdListResponse?.data?.data) ? playIdListResponse.data.data : [];

        // 如果此时本地有播放列表，那需要自动添加至用户数据
        const list = localStorage.getItem("shengyu-playIdList") || "[]";
        const localPlayIdList = JSON.parse(list);
        if (localPlayIdList.length) {
          // 合并并去重
          const combinedList = [...playIdList, ...localPlayIdList];
          const uniquePlayIdList = [];

          const map = new Map();
          for (const item of combinedList) {
            const key = `${item.exhibitId}-${item.itemId}`;
            if (!map.has(key)) {
              map.set(key, true);
              uniquePlayIdList.push(item);
            }
          }

          playIdList = uniquePlayIdList;

          freelogApp.setUserData("shengyu-playIdList", playIdList);
          localStorage.setItem("shengyu-playIdList", "[]");
        }
      } else {
        // 未登录时播放列表取本地
        const list = localStorage.getItem("shengyu-playIdList") || "[]";
        playIdList = JSON.parse(list);
      }
      this.playIdList = playIdList || [];

      // 如果有收藏/播放列表，则获取相应数据
      const promises = [];
      if (collectionIdList.length) {
        promises.push(useMyCollection.getCollectionList());
      } else {
        this.collectionList = [];
      }
      if (playIdList && playIdList.length) {
        promises.push(useMyPlay.getPlayList());
      } else {
        this.playList = [];
      }
      if (promises.length) await Promise.all(promises);

      // 如果有之前播放的声音，且声音依然存在于播放列表中，则获取声音信息
      if (playingId && playIdList.includes(playingId)) useMyPlay.getPlayingInfo(playingId);
    }
    // initThemeState() {
    //   this.theme = currentTheme.value;
    // },
    // toggleTheme(theme: ThemeType) {
    //   console.log("来自store", theme);
    //   toggleTheme(theme);

    //   console.log("改完之后的", currentTheme.value);
    //   this.theme = currentTheme.value;
    // }
  }
});
