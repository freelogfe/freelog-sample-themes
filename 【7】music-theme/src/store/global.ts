import { defineStore } from "pinia";
import { nextTick } from "vue";

// @ts-ignore
import { judgeDevice, judgeIOSDevice } from "@/utils/common";
// @ts-ignore
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { freelogApp } from "freelog-runtime";

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
  locationHistory: string[];
  routerMode: number;
  shareInfo: ShareInfo;
  signedList: any[] | null;
  collectionIdList: string[];
  collectionList: any[] | null;
  playIdList: string[];
  playList: any[] | null;
  playingInfo: any | null;
  playing: boolean;
  initUrl: string;
  progress: number;
  authIdList: string[];
  searchKey: string;
  nodeInfo: Record<string, any>;
  playMode: string | null;
}

export const useGlobalStore = defineStore("global", {
  state: (): State => {
    return {
      inMobile: null, // 是否移动端设备
      isIOS: null, // 是否 IOS 设备
      userData: { isLogin: null }, // 当前登录的用户数据
      selfConfig: {}, // 自定义配置
      locationHistory: [], // 历史路由
      routerMode: 1, // 当前路由模式 1-push 2-back
      shareInfo: { show: false, exhibit: null }, // 分享数据
      signedList: null, // 签约列表
      collectionIdList: [], // 收藏列表(id)
      collectionList: null, // 收藏列表
      playIdList: [], // 播放列表(id)
      playList: null, // 播放列表
      playingInfo: null, // 播放中的声音信息
      playing: false, // 是否在播放中
      initUrl: "", // 播放器初始化 url（用于解决 IOS 无法异步播放声音问题）
      progress: 0, // 当前播放进度
      authIdList: [], // 已授权 id 集合（用于刷新首页列表、声音列表、搜索结果列表、详情页授权状态）
      searchKey: "", // 搜索关键词
      nodeInfo: {},
      playMode: null // 播放模式，顺序播放、随机播放
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
      // freelogApp.setUserData("playIdList", []);
      // freelogApp.setUserData("collectionIdList", []);

      const userData = freelogApp.getCurrentUser();
      const [selfConfig, collectionIdListResponse, playingIdResponse, playModeResponse] =
        await Promise.all([
          freelogApp.getSelfProperty(),
          freelogApp.getUserData("collectionIdList"),
          freelogApp.getUserData("playingId"),
          freelogApp.getUserData("playMode")
        ]);
      const collectionIdList = collectionIdListResponse?.data?.data || [];
      const playingId = playingIdResponse?.data?.data;

      // 节点信息
      this.nodeInfo = freelogApp.nodeInfo;

      // 播放模式
      this.playMode = playModeResponse?.data?.data || "NORMAL";

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

      // 获取签约列表
      useMyAuth.getSignedList();

      // 收藏列表
      this.collectionIdList = collectionIdList || [];

      // 播放列表
      let playIdList = [];
      if (this.userData.isLogin) {
        // 登录时播放列表取用户数据
        const playIdListResponse = await freelogApp.getUserData("playIdList");
        playIdList = playIdListResponse?.data?.data || [];

        // 如果此时本地有播放列表，那需要自动添加至用户数据
        const list = localStorage.getItem("playIdList") || "[]";
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

          freelogApp.setUserData("playIdList", playIdList);
          localStorage.setItem("playIdList", "[]");
        }
      } else {
        // 未登录时播放列表取本地
        const list = localStorage.getItem("playIdList") || "[]";
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
      if (promises.length) Promise.all(promises);

      // 如果有之前播放的声音，且声音依然存在于播放列表中，则获取声音信息
      if (playingId && playIdList.includes(playingId)) useMyPlay.getPlayingInfo(playingId);
    }
  }
});
