import Vue from "vue";
import Vuex from "vuex";
import { judgeDevice, judgeIOSDevice } from "@/utils/common";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { freelogApp } from "freelog-runtime";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    inMobile: null, // 是否移动端设备
    isIOS: null, // 是否 IOS 设备
    userData: {}, // 当前登录的用户数据
    selfConfig: {}, // 自定义配置
    locationHistory: [], // 历史路由
    routerMode: "push", // 当前路由模式 1-push 2-back
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
    searchKey: "", // 搜索关键词
    cachePool: {}, // 合集id为key, 子作品详情列表为value
    lastestAuthList: [] // 最新的全部展品授权情况列表
  },
  mutations: {
    /** 更新数据 */
    setData(state, payload) {
      state[payload.key] = payload.value;
    },
    /** 更新合集缓存数据 */
    setCachePool(state, payload) {
      state.cachePool[payload.key] = payload.value;
    }
  },
  actions: {
    /** 初始化 store */
    async initStoreData(context) {
      const userData = await freelogApp.getCurrentUser();
      const [selfConfig, collectionIdListResponse, playingIdResponse] = await Promise.all([
        freelogApp.getSelfProperty(),
        freelogApp.getUserData("collectionIdList"),
        freelogApp.getUserData("playingId")
      ]);

      const collectionIdList = collectionIdListResponse?.data?.data || [];
      const playingId = playingIdResponse?.data?.data;

      // 是否移动端设备
      const inMobile = judgeDevice();
      context.commit("setData", { key: "inMobile", value: inMobile });

      if (inMobile) {
        // 是否 IOS 设备
        const isIOS = judgeIOSDevice();
        context.commit("setData", { key: "isIOS", value: isIOS });
      }

      // 当前登录用户数据
      context.commit("setData", {
        key: "userData",
        value: userData ? { ...userData, isLogin: true } : { isLogin: false }
      });

      // 自定义选项
      context.commit("setData", { key: "selfConfig", value: selfConfig });

      // 获取签约列表
      useMyAuth.getSignedList();

      // 收藏列表
      context.commit("setData", { key: "collectionIdList", value: collectionIdList || [] });

      // 播放列表
      let playIdList = [];
      if (context.state.userData.isLogin) {
        // 登录时播放列表取用户数据
        const playIdListResponse = await freelogApp.getUserData("playIdList");
        playIdList = playIdListResponse?.data?.data?.filter(ele => 
          ele && Object.prototype.toString.call(ele) === "[object Object]" && ele.hasOwnProperty('id')) || [];

        // 如果此时本地有播放列表，那需要自动添加至用户数据
        const list = localStorage.getItem("playIdList") || "[]";
        const localPlayIdList = JSON.parse(list);
        if (localPlayIdList.length) {
          playIdList = [...new Set([...playIdList, ...localPlayIdList])];
          freelogApp.setUserData("playIdList", playIdList);
          localStorage.setItem("playIdList", "[]");
        }
      } else {
        // 未登录时播放列表取本地
        const list = localStorage.getItem("playIdList") || "[]";
        playIdList = JSON.parse(list);
      }
      context.commit("setData", { key: "playIdList", value: playIdList || [] });

      // 如果有收藏/播放列表，则获取相应数据
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

      // 如果有之前播放的声音，且声音依然存在于播放列表中，则获取声音信息
      if (playingId && playIdList.includes(playingId)) useMyPlay.getPlayingInfo(playingId);
    },

    /* 更新lastestAuthList */
    async updateLastestAuthList(context) {
      const dataList = await queryList()
      if (dataList.length !== 0) {
        const ids = dataList.map(item => item.exhibitId).join();
        const [statusInfo] = await Promise.all([freelogApp.getExhibitAuthStatus(ids)]);

        const signedList = JSON.parse(JSON.stringify(context.state.signedList))
        const collectionList = JSON.parse(JSON.stringify(context.state.collectionList))
        const playList = JSON.parse(JSON.stringify(context.state.playList))
        statusInfo.data.data.forEach(ele => {     
          if (signedList) {
            signedList.forEach(data => {
              if (data.exhibitId === ele.exhibitId) {
                data.defaulterIdentityType = ele.defaulterIdentityType;
              }
            })
          }
       
          if (collectionList) {
            collectionList.forEach(data => {
              if (data.exhibitId === ele.exhibitId) {
                data.defaulterIdentityType = ele.defaulterIdentityType;
              }
            })
          }
      
          if (playList) {
            playList.forEach(data => {
              if (data.exhibitId === ele.exhibitId) {
                data.defaulterIdentityType = ele.defaulterIdentityType;
              }
            })
          }
        });
        // 更新lastestAuthList
        context.commit("setData", { key: "lastestAuthList", value: statusInfo.data.data })
        // 更新签约列表授权状态
        context.commit("setData", { key: "signedList", value: signedList })
        // 更新播放列表
        context.commit("setData", { key: "playList", value: playList })
        // 更新收藏列表
        context.commit("setData", { key: "collectionList", value: collectionList })
      } else {
        context.commit("setData", { key: "lastestAuthList", value: [] })
      }

      /** 获取展品列表 */
      async function queryList(options = { skip: 0, limit: 100 }) {
        let { skip, limit } = options
        const result = []
        const list = await freelogApp.getExhibitListByPaging({
          ...options,
          articleResourceTypes: "音频",
          isLoadVersionProperty: 1,
        });
        const { dataList, totalItem } = list.data.data;
        result.push(...dataList)
        if (totalItem > (skip + 1) * limit) {
          skip = (skip + 1) * limit
          result.push(...await this.queryList({ skip })) 
        }
        return result
      }
    }
  },
  modules: {}
});
