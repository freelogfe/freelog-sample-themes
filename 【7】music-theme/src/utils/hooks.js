import { freelogApp } from "freelog-runtime";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";
import { callLogin } from "@/api/freelog";
import { showToast } from "./common";

export const useCommon = {
  async getCollectionList(obj) {
    const { limit = 1_000, isShowDetailInfo = 1 } = obj.options;

    let subTotal = 0;
    let subSkip = 0;
    let subTempData = [];
    const itemsToAdd = []; // 用于存储需要添加的项

    const fetchCollectionList = async () => {
      const subList = await freelogApp.getCollectionSubList(obj.collectionID, {
        skip: subSkip,
        limit,
        isShowDetailInfo
      });

      const { dataList, totalItem } = subList.data.data;
      subTotal = totalItem;

      if (dataList?.length !== 0) {
        const ids = dataList.map(item => item.itemId).join();
        const statusInfo = await freelogApp.getCollectionSubAuth(obj.collectionID, {
          itemIds: ids
        });

        if (statusInfo.data.data) {
          dataList.forEach(item => {
            const index = statusInfo.data.data.findIndex(
              resultItem => resultItem.itemId === item.itemId
            );
            if (index !== -1) {
              item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
            }

            item.updateDate = item.articleInfo.latestVersionReleaseDate;
            item.coverImages = obj.images;
            item.versionInfo = { exhibitProperty: item.articleInfo?.articleProperty };
            item.exhibitTitle = item.itemTitle;
            item.exhibitIntro = item.articleInfo.intro;
            item.albumName = obj.exhibitName;
            item.exhibitId = obj.collectionID;

            itemsToAdd.push({ exhibitId: item.exhibitId, itemId: item.itemId });
          });
        }
      }

      subTempData.push(...dataList);

      if (subTempData.length < subTotal) {
        subSkip += limit;
        await fetchCollectionList();
      } else {
        return {
          data: subTempData,
          itemsToAdd
        };
      }
    };

    return await fetchCollectionList();
  }
};
/** 授权 hook */
export const useMyAuth = {
  /** 获取签约列表 */
  async getSignedList() {
    const store = useGlobalStore();
    const { userData } = storeToRefs(store);

    // 用户未登录
    if (!userData.value.isLogin) return;

    const result = [];
    const signedList = await freelogApp.getSignStatistics();
    const idList = signedList.data.data.map(item => item.subjectId);
    if (!idList.length) {
      store.setData({ key: "signedList", value: [] });
      return;
    }

    const ids = idList.join();
    const [list, countList, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids)
    ]);
    idList.forEach(id => {
      const signedItem = list.data.data.find(item => item.exhibitId === id);
      if (!signedItem || signedItem.articleInfo.resourceType.includes("主题")) return;
      const countItem = countList.data.data.find(item => item.subjectId === id);
      const statusItem = statusList.data.data.find(item => item.exhibitId === id);
      result.push({
        ...signedItem,
        signCount: countItem.count,
        defaulterIdentityType: statusItem.defaulterIdentityType
      });
    });
    store.setData({ key: "signedList", value: result });
  },

  /**
   * 获取授权
   * @param data 展品信息
   * @param play 授权成功是否播放
   */
  async getAuth(data, play = false) {
    const store = useGlobalStore();
    const { exhibitId, itemId } = data;
    const authResult = await freelogApp.addAuth(exhibitId, { immediate: true });
    const { status } = authResult;
    if (status !== 0) return;
    data.defaulterIdentityType = 0;

    // 同步收藏列表、签约列表、播放列表相应展品的授权状态，更新授权列表
    const { collectionList, signedList, playList, authIdList } = store;
    signedList.unshift(data);
    const collectionItem = collectionList.find(item => item.exhibitId === exhibitId);
    if (collectionItem) collectionItem.defaulterIdentityType = 0;
    const playItem = playList.find(item => item.exhibitId === exhibitId);
    if (playItem) playItem.defaulterIdentityType = 0;
    authIdList.push(exhibitId);

    store.setData({ key: "collectionList", value: collectionList });
    store.setData({ key: "signedList", value: signedList });
    store.setData({ key: "playList", value: playList });
    store.setData({ key: "authIdList", value: authIdList });

    if (play) {
      useMyPlay.addToPlayList({ exhibitId, itemId });
      freelogApp.setUserData("playingId", exhibitId);
      // 已授权未获取 url
      const url = await freelogApp.getExhibitFileStream(exhibitId, { returnUrl: true });
      data.url = url;
      store.setData({ key: "playingInfo", value: data });
      store.setData({ key: "playing", value: true });
    }
  }
};

/** 收藏 hook */
export const useMyCollection = {
  /** 获取收藏列表 */
  async getCollectionList() {
    const store = useGlobalStore();
    const { userData } = storeToRefs(store);
    if (!userData.value.isLogin) return;

    const result = [];
    const idList = store.collectionIdList;
    if (!idList.length) {
      store.setData({ key: "collectionList", value: [] });
      return;
    }

    for (const item of idList) {
      if (item.itemId) {
        const [list, subInfo, subStatusList] = await Promise.all([
          freelogApp.getExhibitListById({ exhibitIds: item.exhibitId, isLoadVersionProperty: 1 }),
          freelogApp.getCollectionSubInfo(item.exhibitId, { itemId: item.itemId }),
          freelogApp.getCollectionSubAuth(item.exhibitId, { itemIds: item.itemId })
        ]);
        result.push({
          ...subInfo.data.data,
          coverImages: list.data.data[0].coverImages,
          versionInfo: { exhibitProperty: subInfo.data.data.articleInfo.articleProperty },
          defaulterIdentityType: subStatusList.data.data[0].defaulterIdentityType
        });
      } else {
        const [list, statusList] = await Promise.all([
          freelogApp.getExhibitListById({ exhibitIds: item.exhibitId, isLoadVersionProperty: 1 }),
          freelogApp.getExhibitAuthStatus(item.exhibitId)
        ]);

        result.push({
          ...list.data.data[0],
          defaulterIdentityType: statusList.data.data[0].defaulterIdentityType
        });
      }
    }

    store.setData({ key: "collectionList", value: result });
  },

  /** 判断当前展品是否已被收藏 */
  ifExist(obj) {
    const store = useGlobalStore();

    return store.collectionIdList
      .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
      .includes(`${obj.exhibitId}${obj.itemId ?? ""}`);
  },

  /** 操作收藏（如未收藏则收藏，反之取消收藏） */
  async operateCollect(data) {
    const store = useGlobalStore();
    if (!store.userData.isLogin) {
      callLogin();
      return;
    }

    const { exhibitId, itemId } = data;

    const collectionIdList = [...store.collectionIdList];
    const combineCollectionIdList = store.collectionIdList.map(
      i => `${i.exhibitId}${i.itemId ?? ""}`
    );
    const collectionList = [...store.collectionList];

    const isCollected = combineCollectionIdList.includes(`${exhibitId}${itemId ?? ""}`);
    if (isCollected) {
      // 取消收藏
      const idIndex = combineCollectionIdList.findIndex(
        item => item === `${exhibitId}${itemId ?? ""}`
      );
      collectionIdList.splice(idIndex, 1);
      const index = collectionList.findIndex(
        item => `${item.exhibitId}${item.itemId ?? ""}` === `${exhibitId}${itemId ?? ""}`
      );
      collectionList.splice(index, 1);
    } else {
      // 收藏
      collectionIdList.unshift({ exhibitId, itemId });
      collectionList.unshift(data);
    }
    const res = await freelogApp.setUserData("collectionIdList", collectionIdList);
    if (res.data.msg === "success") {
      store.setData({ key: "collectionIdList", value: collectionIdList });
      store.setData({ key: "collectionList", value: collectionList });
    } else {
      showToast("操作失败");
    }
  }
};

export const useMyPlay = {
  /** 获取播放列表数据 */
  async getPlayList() {
    const store = useGlobalStore();
    const playIdList = store.playIdList;

    const result = [];
    if (!playIdList.length) {
      store.setData({ key: "playList", value: [] });
      return;
    }

    playIdList.forEach(async item => {
      if (item.itemId) {
        const [list, subInfo, subStatusList] = await Promise.all([
          freelogApp.getExhibitListById({ exhibitIds: item.exhibitId, isLoadVersionProperty: 1 }),
          freelogApp.getCollectionSubInfo(item.exhibitId, { itemId: item.itemId }),
          freelogApp.getCollectionSubAuth(item.exhibitId, { itemIds: item.itemId })
        ]);
        result.push({
          ...subInfo.data.data,
          coverImages: list.data.data[0].coverImages,
          versionInfo: { exhibitProperty: subInfo.data.data.articleInfo.articleProperty },
          defaulterIdentityType: subStatusList.data.data[0].defaulterIdentityType
        });
      } else {
        const [list, statusList] = await Promise.all([
          freelogApp.getExhibitListById({ exhibitIds: item.exhibitId, isLoadVersionProperty: 1 }),
          freelogApp.getExhibitAuthStatus(item.exhibitId)
        ]);

        if (list.data.data[0].articleInfo.articleType === 2) {
          const params = {
            collectionID: list.data.data[0].exhibitId,
            exhibitName: list.data.data[0].exhibitName,
            images: list.data.data[0].coverImages,
            options: {
              limit: 1_000,
              isShowDetailInfo: 1
            }
          };

          const { data, itemsToAdd } = await useCommon.getCollectionList(params);
          playIdList.unshift(...itemsToAdd);
          result.push(...data);

          const removeIndex = playIdList.findIndex(
            item => `${item.exhibitId}${item.itemId ?? ""}` === `${list.data.data[0].exhibitId}`
          );
          playIdList.splice(removeIndex, 1);
        } else {
          result.push({
            ...list.data.data[0],
            defaulterIdentityType: statusList.data.data[0].defaulterIdentityType
          });
        }
      }
    });

    store.setData({ key: "playList", value: result });
  },

  /** 判断当前展品是否已存在播放列表中 */
  ifExist(obj) {
    const store = useGlobalStore();

    if (!store.userData.isLogin) {
      // 未登录时播放列表取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      return playIdList
        .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
        .includes(`${obj.exhibitId}${obj.itemId ?? ""}`);
    } else {
      // 已登录时播放列表取用户数据
      return store.playIdList
        .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
        .includes(`${obj.exhibitId}${obj.itemId ?? ""}`);
    }
  },

  /** 加入播放列表 */
  async addToPlayList(obj, callback) {
    const store = useGlobalStore();

    if (!store.userData.isLogin) {
      // 未登录时存在本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      if (
        playIdList
          .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
          .includes(`${obj.exhibitId}${obj.itemId ?? ""}`)
      ) {
        return;
      }

      playIdList.unshift(obj);

      localStorage.setItem("playIdList", JSON.stringify(playIdList));
      store.setData({ key: "playIdList", value: playIdList });
      callback && callback();
      useMyPlay.getPlayList();
    } else {
      // 已登录时存在用户数据
      let playIdList = store.playIdList;

      if (obj.itemId) {
        if (
          playIdList
            .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
            .includes(`${obj.exhibitId}${obj.itemId ?? ""}`)
        ) {
          return;
        }

        playIdList.unshift(obj);
      } else {
        const hasDuplicateId = playIdList.findIndex(i => i.exhibitId === obj.exhibitId);
        if (hasDuplicateId !== -1) {
          playIdList = playIdList.filter(item => item.exhibitId !== obj.exhibitId);
        }
        playIdList.unshift(obj);
      }

      const res = await freelogApp.setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        store.setData({ key: "playIdList", value: playIdList });
        callback && callback();
        useMyPlay.getPlayList();
        showToast("添加成功");
      } else {
        showToast("加入播放列表失败");
      }
    }
  },

  /** 移出播放列表 */
  async removeFromPlayList(id, itemId) {
    const store = useGlobalStore();
    const { playing, playingInfo } = store;

    if (!store.userData.isLogin) {
      // 未登录时取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      const idIndex = playIdList.findIndex(
        item => `${item.exhibitId}${item.itemId ?? ""}` === `${id}${itemId ?? ""}`
      );
      playIdList.splice(idIndex, 1);
      localStorage.setItem("playIdList", JSON.stringify(playIdList));

      const playList = store.playList;
      const index = playList.findIndex(
        item => `${item.exhibitId}${item.itemId ?? ""}` === `${id}${itemId ?? ""}`
      );
      playList.splice(index, 1);

      store.setData({ key: "playIdList", value: playIdList });
      store.setData({ key: "playList", value: playList });

      if (id !== playingInfo?.exhibitId) return;
      if (playing) {
        // 如果移出的声音是当前正在播放的声音，自动播放列表中的下一个声音
        useMyPlay.playOrPause(playList[index]);
      } else {
        // 如果移出的声音是当前正在暂停的声音，将播放中的声音信息置空
        store.setData({ key: "playingInfo", value: null });
      }
    } else {
      // 已登录时取用户数据
      const playIdList = store.playIdList;

      const index = playIdList.findIndex(
        item => `${item.exhibitId}${item.itemId ?? ""}` === `${id}${itemId ?? ""}`
      );

      playIdList.splice(index, 1);
      const res = await freelogApp.setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        const playList = store.playList;
        const index = playList.findIndex(
          item => `${item.exhibitId}${item.itemId ?? ""}` === `${id}${itemId ?? ""}`
        );
        playList.splice(index, 1);

        store.setData({ key: "playIdList", value: playIdList });
        store.setData({ key: "playList", value: playList });

        if (id !== playingInfo?.exhibitId) return;
        if (playing) {
          // 如果移出的声音是当前正在播放的声音，自动播放列表中的下一个声音
          useMyPlay.playOrPause(playList[index]);
        } else {
          // 如果移出的声音是当前正在暂停的声音，将播放中的声音信息置空
          store.setData({ key: "playingInfo", value: null });
        }
      } else {
        showToast("操作失败");
      }
    }
  },

  /** 清空播放列表 */
  async clearPlayList() {
    const store = useGlobalStore();

    if (!store.userData.isLogin) {
      // 未登录时取本地
      localStorage.setItem("playIdList", "[]");
      store.setData({ key: "playIdList", value: [] });
      store.setData({ key: "playList", value: [] });
      store.setData({ key: "playing", value: false });
      store.setData({ key: "playingInfo", value: null });
    } else {
      // 已登录时取用户数据
      const res = await freelogApp.setUserData("playIdList", []);
      if (res.data.msg === "success") {
        store.setData({ key: "playIdList", value: [] });
        store.setData({ key: "playList", value: [] });
        store.setData({ key: "playing", value: false });
        store.setData({ key: "playingInfo", value: null });
      } else {
        showToast("清空列表失败");
      }
    }
  },

  /** 播放 */
  async playOrPause(exhibit, type = "normal", callback) {
    const store = useGlobalStore();

    if (!exhibit) {
      store.setData({ key: "playing", value: false });
      store.setData({ key: "playingInfo", value: null });
      return;
    }

    const { initUrl, playingInfo, playing } = store;

    if (initUrl) {
      setTimeout(() => {
        store.setData({ key: "initUrl", value: null });
      }, 0);
    } else if (initUrl === "") {
      // 部分设备（已知部分 ios）上无法直接播放音频，需要先使用任意 url 初始化播放器，才可播放音频
      store.setData({
        key: "initUrl",
        value: "https://file.testfreelog.com/exhibits/64d1ed97cc4a64002f632b0d"
      });
      this.playOrPause(exhibit, type, callback);
      return;
    }

    const { defaulterIdentityType, url, exhibitId, itemId } = exhibit;
    if (playingInfo && defaulterIdentityType === 0 && url) {
      const { exhibitId: id, url: playingUrl } = playingInfo;
      if (exhibitId === id && playing && type === "normal" && playingUrl === url) {
        // 暂停
        store.setData({ key: "playing", value: false });
        return;
      } else if (exhibitId === id && !playing && playingUrl) {
        // 之前暂停的声音继续播放
        store.setData({ key: "playing", value: true });
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
    } else if (defaulterIdentityType === 4) {
      // 未授权
      useMyAuth.getAuth(exhibit, true);
      return;
    } else if (!url) {
      // 已授权未获取 url
      const url = itemId
        ? await freelogApp.getCollectionSubFileStream(exhibitId, {
            itemId,
            returnUrl: true
          })
        : await freelogApp.getExhibitFileStream(exhibitId, { returnUrl: true });
      exhibit.url = url;
    }
    await useMyPlay.addToPlayList({ exhibitId, itemId });
    store.setData({ key: "playingInfo", value: exhibit });
    store.setData({ key: "playing", value: true });
    freelogApp.setUserData("playingId", { exhibitId, itemId });
    callback && callback();
  },

  /** 获取播放数据 */
  async getPlayingInfo(id) {
    const store = useGlobalStore();
    const [info, statusInfo, url] = await Promise.all([
      freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      freelogApp.getExhibitAuthStatus(id),
      freelogApp.getExhibitFileStream(id, { returnUrl: true })
    ]);
    info.data.data.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
    info.data.data.url = url;
    store.setData({ key: "playingInfo", value: info.data.data });
  },

  /** 上一首 */
  preVoice(data) {
    const store = useGlobalStore();
    let preVoiceInfo = null;
    const { playList, playingInfo, playMode } = store;
    const id = data
      ? `${data.exhibitId}${data.itemId ?? ""}`
      : `${playingInfo.exhibitId}${playingInfo.itemId ?? ""}`;
    const index = playList.findIndex(item => `${item.exhibitId}${item.itemId ?? ""}` === id);

    if (playMode === "NORMAL") {
      if (index === 0) {
        preVoiceInfo = playList[playList.length - 1];
      } else {
        preVoiceInfo = playList[index - 1];
      }
    } else {
      preVoiceInfo = playList[index];
    }

    useMyPlay.playOrPause(preVoiceInfo, "preVoice");
  },

  /** 下一首 */
  nextVoice(data) {
    const store = useGlobalStore();
    let nextVoiceInfo = null;
    const { playList, playingInfo, playMode } = store;
    const id = data
      ? `${data.exhibitId}${data.itemId ?? ""}`
      : `${playingInfo.exhibitId}${playingInfo.itemId ?? ""}`;
    const index = playList.findIndex(item => `${item.exhibitId}${item.itemId ?? ""}` === id);

    if (playMode === "NORMAL") {
      if (index === playList.length - 1) {
        nextVoiceInfo = playList[0];
      } else {
        nextVoiceInfo = playList[index + 1];
      }
    } else {
      nextVoiceInfo = playList[index];
    }

    useMyPlay.playOrPause(nextVoiceInfo, "nextVoice");
  }
};
