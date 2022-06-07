import {
  callLogin,
  getExhibitAuthStatus,
  getExhibitAvailable,
  getExhibitListById,
  getSignStatistics,
  setUserData,
  addAuth,
  getExhibitInfo,
  getExhibitFileStream,
} from "@/api/freelog";
import { showToast } from "./common";
import store from "@/store";

/**
 * 页面路由记录hook
 */
//   export const useMyLocationHistory = () => {
//     const store = useStore();
//     const router = useRouter();

//     watch(
//       () => router,
//       (cur) => {
//         const { current, replaced } = cur.options.history.state;
//         const { locationHistory } = store.state;
//         if (!locationHistory.length) {
//           locationHistory.push(current);
//           store.commit("setData", { key: "locationHistory", value: locationHistory });
//           return;
//         }

//         if (!replaced) {
//           locationHistory.push(current);
//         } else {
//           locationHistory.pop();
//         }
//         store.commit("setData", { key: "locationHistory", value: locationHistory });
//       },
//       { immediate: true }
//     );
//   };

/** 授权 hook */
export const useMyAuth = {
  /** 获取播放列表数据 */
  async getSignedList() {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const signedList = await getSignStatistics();
    const idList = signedList.data.data.map((item) => item.subjectId);
    const ids = idList.join();
    if (!ids) {
      store.commit("setData", { key: "signedList", value: [] });
      return;
    }

    const [list, statusInfo, authLinkStatusInfo] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(ids),
      getExhibitAvailable(ids),
    ]);
    list.data.data.forEach((item) => {
      const statusItem = statusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authCode = statusItem.authCode;
      const authLinkStatusItem = authLinkStatusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authLinkNormal = item.authCode === 301 ? false : authLinkStatusItem.isAuth;
    });
    const result = [];
    idList.forEach((idItem) => {
      const signedItem = list.data.data.find((item) => item.exhibitId === idItem);
      if (signedItem && signedItem.articleInfo.resourceType !== "theme") result.push(signedItem);
    });
    store.commit("setData", { key: "signedList", value: result });
  },

  /** 授权 */
  async getAuth(data) {
    const { exhibitId } = data;
    const authResult = await addAuth(exhibitId);
    const { status } = authResult;
    if (status !== 0) return;
    data.authCode = 200;

    // 同步收藏列表、签约列表、播放列表相应展品的授权状态，更新授权列表
    const { collectionList, signedList, playList, authIdList } = store.state;
    signedList.unshift(data);
    const collectionItem = collectionList.find((item) => item.exhibitId === exhibitId);
    if (collectionItem) collectionItem.authCode = 200;
    const playItem = playList.find((item) => item.exhibitId === exhibitId);
    if (playItem) playItem.authCode = 200;
    authIdList.push(exhibitId);
    store.commit("setData", { key: "collectionList", value: collectionList });
    store.commit("setData", { key: "signedList", value: signedList });
    store.commit("setData", { key: "playList", value: playList });
    store.commit("setData", { key: "playList", value: playList });
    store.commit("setData", { key: "authIdList", value: authIdList });
  },
};

/** 收藏 hook */
export const useMyCollection = {
  /** 获取收藏列表 */
  async getCollectionList() {
    const ids = store.state.collectionIdList.join();
    if (!ids) {
      store.commit("setData", { key: "collectionList", value: [] });
      return;
    }

    const [list, statusInfo, authLinkStatusInfo] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(ids),
      getExhibitAvailable(ids),
    ]);
    list.data.data.forEach((item) => {
      const statusItem = statusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authCode = statusItem.authCode;
      const authLinkStatusItem = authLinkStatusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authLinkNormal = item.authCode === 301 ? false : authLinkStatusItem.isAuth;
    });
    const result = [];
    store.state.collectionIdList.forEach((idItem) => {
      const collectionItem = list.data.data.find((item) => item.exhibitId === idItem);
      if (collectionItem) result.push(collectionItem);
    });
    store.commit("setData", { key: "collectionList", value: result });
  },

  // 判断当前展品是否已被收藏
  ifExist(id) {
    return store.state.collectionIdList.includes(id);
  },

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  async operateCollect(data) {
    if (!store.state.userData.isLogin) {
      callLogin();
      return;
    }

    const { exhibitId } = data;
    const collectionIdList = [...store.state.collectionIdList];
    const collectionList = [...store.state.collectionList];
    const isCollected = collectionIdList.includes(exhibitId);
    if (isCollected) {
      // 取消收藏
      const idIndex = collectionIdList.findIndex((item) => item === exhibitId);
      collectionIdList.splice(idIndex, 1);
      const index = collectionList.findIndex((item) => item.id === exhibitId);
      collectionList.splice(index, 1);
    } else {
      // 收藏
      collectionIdList.unshift(exhibitId);
      collectionList.unshift(data);
    }
    const res = await setUserData("collectionIdList", collectionIdList);
    if (res.data.msg === "success") {
      store.commit("setData", { key: "collectionIdList", value: collectionIdList });
      store.commit("setData", { key: "collectionList", value: collectionList });
    } else {
      showToast("操作失败");
    }
  },
};

/** 播放 hook */
export const useMyPlay = {
  /** 获取播放列表数据 */
  async getPlayList() {
    const ids = store.state.playIdList.join();
    if (!ids) {
      store.commit("setData", { key: "playList", value: [] });
      return;
    }

    const [list, statusInfo, authLinkStatusInfo] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(ids),
      getExhibitAvailable(ids),
    ]);
    list.data.data.forEach((item) => {
      const statusItem = statusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authCode = statusItem.authCode;
      const authLinkStatusItem = authLinkStatusInfo.data.data.find((listItem) => listItem.exhibitId === item.exhibitId);
      item.authLinkNormal = item.authCode === 301 ? false : authLinkStatusItem.isAuth;
    });
    const result = [];
    store.state.playIdList.forEach((idItem) => {
      const playItem = list.data.data.find((item) => item.exhibitId === idItem);
      if (playItem) result.push(playItem);
    });
    store.commit("setData", { key: "playList", value: result });
  },

  // 判断当前展品是否已被收藏
  ifExist(id) {
    if (!store.state.userData.isLogin) {
      // 未登录时播放列表取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      return playIdList.includes(id);
    } else {
      // 已登录时播放列表取用户数据
      return store.state.playIdList.includes(id);
    }
  },

  // 加入播放列表
  async addToPlayList(id, callback) {
    if (!store.state.userData.isLogin) {
      // 未登录时存在本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      if (playIdList.includes(id)) return;

      playIdList.unshift(id);

      localStorage.setItem("playIdList", JSON.stringify(playIdList));
      store.commit("setData", { key: "playIdList", value: playIdList });
      callback && callback();
      useMyPlay.getPlayList();
    } else {
      // 已登录时存在用户数据
      const playIdList = [...store.state.playIdList];
      if (playIdList.includes(id)) return;

      playIdList.unshift(id);
      const res = await setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: playIdList });
        callback && callback();
        useMyPlay.getPlayList();
      } else {
        showToast("加入播放列表失败");
      }
    }
  },

  // 移出播放列表
  async removeFromPlayList(id) {
    if (!store.state.userData.isLogin) {
      // 未登录时取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      const idIndex = playIdList.findIndex((item) => item === id);
      playIdList.splice(idIndex, 1);
      localStorage.setItem("playIdList", JSON.stringify(playIdList));

      const playList = store.state.playList;
      const index = playList.findIndex((item) => item.id === id);
      playList.splice(index, 1);

      store.commit("setData", { key: "playIdList", value: playIdList });
      store.commit("setData", { key: "playList", value: playList });
    } else {
      // 已登录时取用户数据
      const playIdList = [...store.state.playIdList];
      const index = playIdList.findIndex((item) => item === id);
      playIdList.splice(index, 1);
      const res = await setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        const playList = store.state.playList;
        const index = playList.findIndex((item) => item.id === id);
        playList.splice(index, 1);

        store.commit("setData", { key: "playIdList", value: playIdList });
        store.commit("setData", { key: "playList", value: playList });
      } else {
        showToast("操作失败");
      }
    }
  },

  // 清空播放列表
  async clearPlayList() {
    if (!store.state.userData.isLogin) {
      // 未登录时取本地
      localStorage.setItem("playIdList", "[]");
      store.commit("setData", { key: "playIdList", value: [] });
      store.commit("setData", { key: "playList", value: [] });
    } else {
      // 已登录时取用户数据
      const res = await setUserData("playIdList", []);
      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: [] });
        store.commit("setData", { key: "playList", value: [] });
      } else {
        showToast("清空列表失败");
      }
    }
  },

  // 播放
  async playOrPause(exhibit, type = "normal") {
    const { authCode, authLinkNormal, url, exhibitId } = exhibit;
    const { playingInfo, playing } = store.state;
    if (playingInfo) {
      const { exhibitId: id, url } = playingInfo;
      if (exhibitId === id && playing) {
        // 暂停
        store.commit("setData", { key: "playing", value: false });
        return;
      } else if (exhibitId === id && !playing && url) {
        // 之前暂停的声音继续播放
        store.commit("setData", { key: "playing", value: true });
        return;
      }
    }

    if (!authLinkNormal) {
      // 授权链异常
      if (type !== "normal") {
        // 自动按播放列表顺序播放时，直接播放列表中的下一首
        useMyPlay[type](exhibit);
      } else {
        // 非按顺序播放时，弹出提示
        showToast("授权链异常");
      }
      return;
    }

    if (![200, 301].includes(authCode)) {
      // 未授权
      useMyAuth.getAuth(exhibit);
      return;
    }

    if (!url) {
      const url = await getExhibitFileStream(exhibitId, true);
      exhibit.url = url;
    }
    useMyPlay.addToPlayList(exhibitId);
    store.commit("setData", { key: "playingInfo", value: exhibit });
    store.commit("setData", { key: "playing", value: true });
    setUserData("playingId", exhibitId);
  },

  // 获取播放数据
  async getPlayingInfo(id) {
    const [info, statusInfo, authLinkStatusInfo] = await Promise.all([
      getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(id),
      getExhibitAvailable(id),
    ]);
    info.data.data.authCode = statusInfo.data.data[0].authCode;
    info.data.data.authLinkNormal = info.data.data.authCode === 301 ? false : authLinkStatusInfo.data.data[0].isAuth;
    store.commit("setData", { key: "playingInfo", value: info.data.data });
  },

  /** 上一首 */
  preVoice(data) {
    let preVoiceInfo = null;
    const { playList, playingInfo } = store.state;
    const id = data ? data.exhibitId : playingInfo.exhibitId;
    const index = playList.findIndex((item) => item.exhibitId === id);
    if (index === 0) {
      preVoiceInfo = playList[playList.length - 1];
    } else {
      preVoiceInfo = playList[index - 1];
    }
    useMyPlay.playOrPause(preVoiceInfo, "preVoice");
  },

  /** 下一首 */
  nextVoice(data) {
    let nextVoiceInfo = null;
    const { playList, playingInfo } = store.state;
    const id = data ? data.exhibitId : playingInfo.exhibitId;
    const index = playList.findIndex((item) => item.exhibitId === id);
    if (index === playList.length - 1) {
      nextVoiceInfo = playList[0];
    } else {
      nextVoiceInfo = playList[index + 1];
    }
    useMyPlay.playOrPause(nextVoiceInfo, "nextVoice");
  },
};

/**
 * 获取页面滚动相关信息hook
 */
//   export const useMyScroll = () => {
//     const app = document.getElementById("app");
//     const data = reactive({
//       scrollTop: 0,
//       clientHeight: 0,
//       scrollHeight: 0,
//     });

//     const scroll = () => {
//       data.scrollTop = app?.scrollTop || 0;
//       data.clientHeight = app?.clientHeight || 0;
//       data.scrollHeight = app?.scrollHeight || 0;
//     };

//     const scrollTo = (top, behavior = "smooth") => {
//       app?.scroll({ top, behavior });
//     };

//     const scrollToTop = () => {
//       app?.scroll({ top: 0, behavior: "smooth" });
//     };

//     app?.addEventListener("scroll", scroll);
//     onUnmounted(() => {
//       app?.removeEventListener("scroll", scroll);
//     });

//     return {
//       ...toRefs(data),
//       scrollTo,
//       scrollToTop,
//     };
//   };
