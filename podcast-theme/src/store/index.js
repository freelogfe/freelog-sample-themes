import Vue from "vue";
import Vuex from "vuex";
import { getSelfConfig, getCurrentUser, getUserData, setUserData } from "@/api/freelog";
import { judgeDevice } from "@/utils/common";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    inMobile: false, // 是否移动端设备
    userData: {}, // 当前登录的用户数据
    selfConfig: {}, // 自定义配置
    locationHistory: [], // 历史路由
    shareInfo: { show: false, exhibit: null }, // 分享数据
    signedList: null, // 签约列表
    collectionIdList: [], // 收藏列表(id)
    collectionList: null, // 收藏列表
    playIdList: [], // 播放列表(id)
    playList: null, // 播放列表
    playingInfo: null, // 播放中的声音信息
    playing: false, // 是否在播放中
    progress: 0, // 当前播放进度
    duration: null, // 当前播放的音频时长
    authIdList: [], // 已授权 id 集合（用于刷新首页列表、声音列表、搜索结果列表、详情页授权状态）
    searchKey: "", // 搜索关键词
  },
  mutations: {
    setData(state, payload) {
      state[payload.key] = payload.value;
    },
  },
  actions: {
    async initStoreData(context) {
      const [userData, selfConfig, collectionIdList = [], playingId] = await Promise.all([
        getCurrentUser(),
        getSelfConfig(),
        getUserData("collectionIdList"),
        getUserData("playingId"),
      ]);

      // 历史路由
      context.commit("setData", { key: "locationHistory", value: [] });

      // 是否移动端
      const inMobile = judgeDevice();
      context.commit("setData", { key: "inMobile", value: inMobile });

      // 当前登录用户数据
      context.commit("setData", {
        key: "userData",
        value: userData ? { ...userData, isLogin: true } : { isLogin: false },
      });

      // 自定义选项
      context.commit("setData", { key: "selfConfig", value: selfConfig });

      useMyAuth.getSignedList();

      // 收藏列表
      context.commit("setData", { key: "collectionIdList", value: collectionIdList || [] });

      // 播放列表
      let playIdList = [];
      if (context.state.userData.isLogin) {
        // 登录时播放列表取用户数据
        playIdList = await getUserData("playIdList");

        // 如果此时本地有播放列表，那需要自动添加至用户数据
        const list = localStorage.getItem("playIdList") || "[]";
        const localPlayIdList = JSON.parse(list);
        if (localPlayIdList.length) {
          playIdList = [...new Set([...playIdList, ...localPlayIdList])];
          setUserData("playIdList", playIdList);
          localStorage.setItem("playIdList", "[]");
        }
      } else {
        // 未登录时播放列表取本地
        const list = localStorage.getItem("playIdList") || "[]";
        playIdList = JSON.parse(list);
      }
      context.commit("setData", { key: "playIdList", value: playIdList || [] });

      const promises = [];
      if (collectionIdList.length) {
        promises.push(useMyCollection.getCollectionList());
      } else {
        context.commit("setData", { key: "collectionList", value: [] });
      }
      if (playIdList && playIdList.length) {
        promises.push(useMyPlay.getPlayList());
      } else {
        context.commit("setData", { key: "playList", value: [] });
      }
      if (promises.length) Promise.all(promises);

      if (playingId) useMyPlay.getPlayingInfo(playingId);
    },
  },
  modules: {},
});
