import {
  callLogin,
  addAuth,
  setUserData,
  getExhibitListById,
  getExhibitSignCount,
  getExhibitAuthStatus,
  getSignStatistics,
  getExhibitInfo,
  getExhibitFileStream,
} from "@/api/freelog";
import { showToast } from "./common";
import store from "@/store";

/** 授权 hook */
export const useMyAuth = {
  /** 获取播放列表数据 */
  async getSignedList() {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const result = [];
    const signedList = await getSignStatistics();
    const idList = signedList.data.data.map((item) => item.subjectId);
    if (!idList.length) {
      store.commit("setData", { key: "signedList", value: [] });
      return;
    }

    const ids = idList.join();
    const [list, countList, statusList] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitSignCount(ids),
      getExhibitAuthStatus(ids),
    ]);
    idList.forEach((id) => {
      const signedItem = list.data.data.find((item) => item.exhibitId === id);
      if (!signedItem || signedItem.articleInfo.resourceType === "theme") return;
      const countItem = countList.data.data.find((item) => item.subjectId === id);
      const statusItem = statusList.data.data.find((item) => item.exhibitId === id);
      result.push({
        ...signedItem,
        signCount: countItem.count,
        defaulterIdentityType: statusItem.defaulterIdentityType,
      });
    });
    store.commit("setData", { key: "signedList", value: result });
  },

  /** 授权 */
  async getAuth(data) {
    const { exhibitId } = data;
    const authResult = await addAuth(exhibitId);
    const { status } = authResult;
    if (status !== 0) return;
    data.defaulterIdentityType = 0;

    // 同步收藏列表、签约列表、播放列表相应展品的授权状态，更新授权列表
    const { collectionList, signedList, playList, authIdList } = store.state;
    signedList.unshift(data);
    const collectionItem = collectionList.find((item) => item.exhibitId === exhibitId);
    if (collectionItem) collectionItem.defaulterIdentityType = 0;
    const playItem = playList.find((item) => item.exhibitId === exhibitId);
    if (playItem) playItem.defaulterIdentityType = 0;
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
    if (!store.state.userData.isLogin) return;

    const result = [];
    const idList = store.state.collectionIdList;
    if (!idList.length) {
      store.commit("setData", { key: "collectionList", value: [] });
      return;
    }

    const ids = idList.join();
    const [list, countList, statusList] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitSignCount(ids),
      getExhibitAuthStatus(ids),
    ]);
    idList.forEach((id) => {
      const collectionItem = list.data.data.find((item) => item.exhibitId === id);
      if (!collectionItem) return;
      const signCountItem = countList.data.data.find((item) => item.subjectId === id);
      const statusItem = statusList.data.data.find((item) => item.exhibitId === id);
      result.push({
        ...collectionItem,
        signCount: signCountItem.count,
        defaulterIdentityType: statusItem.defaulterIdentityType,
      });
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
      const index = collectionList.findIndex((item) => item.exhibitId === exhibitId);
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
    if (!store.state.userData.isLogin) return;

    const result = [];
    const idList = store.state.playIdList;
    if (!idList.length) {
      store.commit("setData", { key: "playList", value: [] });
      return;
    }

    const ids = idList.join();
    const [list, statusList] = await Promise.all([
      getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(ids),
    ]);
    idList.forEach((id) => {
      const playItem = list.data.data.find((item) => item.exhibitId === id);
      if (!playItem) return;
      const statusItem = statusList.data.data.find((item) => item.exhibitId === id);
      result.push({ ...playItem, defaulterIdentityType: statusItem.defaulterIdentityType });
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
      const index = playList.findIndex((item) => item.exhibitId === id);
      playList.splice(index, 1);

      store.commit("setData", { key: "playIdList", value: playIdList });
      store.commit("setData", { key: "playList", value: playList });
      useMyPlay.playOrPause(playList[index]);
    } else {
      // 已登录时取用户数据
      const playIdList = [...store.state.playIdList];
      const index = playIdList.findIndex((item) => item === id);
      playIdList.splice(index, 1);
      const res = await setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        const playList = store.state.playList;
        const index = playList.findIndex((item) => item.exhibitId === id);
        playList.splice(index, 1);

        store.commit("setData", { key: "playIdList", value: playIdList });
        store.commit("setData", { key: "playList", value: playList });
        useMyPlay.playOrPause(playList[index]);
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
      store.commit("setData", { key: "playing", value: false });
      store.commit("setData", { key: "playingInfo", value: null });
    } else {
      // 已登录时取用户数据
      const res = await setUserData("playIdList", []);
      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: [] });
        store.commit("setData", { key: "playList", value: [] });
        store.commit("setData", { key: "playing", value: false });
        store.commit("setData", { key: "playingInfo", value: null });
      } else {
        showToast("清空列表失败");
      }
    }
  },

  // 播放
  async playOrPause(exhibit, type = "normal") {
    if (!exhibit) {
      store.commit("setData", { key: "playing", value: false });
      store.commit("setData", { key: "playingInfo", value: null });
      return;
    }

    const { defaulterIdentityType, url, exhibitId } = exhibit;
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

    if (![0, 4].includes(defaulterIdentityType)) {
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

    if (defaulterIdentityType >= 4) {
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
    const [info, statusInfo] = await Promise.all([
      getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      getExhibitAuthStatus(id),
    ]);
    info.data.data.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
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
