import { callLogin } from "@/api/freelog";
import { showToast } from "./common";
import store from "@/store";
import { freelogApp } from "freelog-runtime";
import Vue from "vue";
import { supportAudio, unSupportAudioIOS } from "@/api/data"

/** 授权 hook */
export const useMyAuth = {
  /** 获取签约列表 */
  async getSignedList() {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const result = [];
    const signedList = await freelogApp.getSignStatistics();
    const idList = signedList.data.data.map(item => item.subjectId);
    if (!idList.length) {
      store.commit("setData", { key: "signedList", value: [] });
      return;
    }

    const ids = idList.join();
    const [list, countList, statusList, totalList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids),
      freelogApp.getCollectionsSubList(ids, { sortType: 1, skip: 0, limit: 2, isShowDetailInfo: 1 })
    ]);
    
    idList.forEach(id => {
      const signedItem = list.data.data.find(item => item.exhibitId === id);
      if (!signedItem || signedItem.articleInfo.resourceType.includes("主题")) return;
      const countItem = countList.data.data.find(item => item.subjectId === id);
      const statusItem = statusList.data.data.find(item => item.exhibitId === id);
      const totalItem = totalList.data.data.find(item => item.exhibitId === id)
      
      result.push({
        ...signedItem,
        signCount: countItem.count,
        defaulterIdentityType: statusItem.defaulterIdentityType,
        totalItem: totalItem?.totalItem || 0
      });
    });
    store.commit("setData", { key: "signedList", value: result });
    store.dispatch("updateLastestAuthList")
  },

  /**
   * 获取授权
   * @param data 展品信息
   * @param play 授权成功是否播放
   */
  async getAuth(data, play = false) {
    const { exhibitId, articleInfo } = data;
    const authResult = await freelogApp.addAuth(exhibitId, { immediate: true });
    const { status } = authResult;
    if (status !== 0) return false;
    data.defaulterIdentityType = 0;

    // 同步收藏列表、签约列表、播放列表相应展品的授权状态，更新授权列表
    const { collectionList, signedList, playList } = store.state;

    const currentSignItem = signedList.find(ele => ele.exhibitId === exhibitId)
    if (currentSignItem) {
      currentSignItem.defaulterIdentityType = 0
    } else {
      signedList.unshift(data);
    }

    if (articleInfo.articleType === 1) {
      const collectionItem = collectionList.find(item => item.exhibitId === exhibitId);
      if (collectionItem) collectionItem.defaulterIdentityType = 0;
      const playItem = playList.find(item => item.exhibitId === exhibitId);
      if (playItem) playItem.defaulterIdentityType = 0;
    } else {
      const collectionItems = collectionList.filter(item => item.exhibitId === exhibitId);
      if (collectionItems.length) {
        for (const collectionItem of collectionItems) {
          collectionItem.defaulterIdentityType = 0; 
        } 
      }
      const playItems = playList.filter(item => item.exhibitId === exhibitId);
      if (playItems.length) {
        for (const playItem of playItems) {
          playItem.defaulterIdentityType = 0;
        }
      } 
    }
    store.commit("setData", { key: "collectionList", value: collectionList });
    store.commit("setData", { key: "signedList", value: signedList });
    store.commit("setData", { key: "playList", value: playList });
    store.dispatch("updateLastestAuthList")

    if (play) {
      if (articleInfo.articleType === 2) {
        /*
        * 合集（1. 添加所的单品到播放列表；2. 播放第一个单品）
        * 合集的子作品
        */
        if (data.child) {
          // 场景二：进去合集里点击某一首歌曲
          useMyPlay.addToPlayList({
            id: exhibitId,
            isExhibit: false,
            itemId: data.child.itemId
          });
          // 获取子作品的播放地址
          const url = await freelogApp.getCollectionSubFileStream(exhibitId, {
            itemId: data.child.itemId,
            returnUrl: true
          });
          Vue.set(data.child, "url", url)
          store.commit("setData", { key: "playingInfo", value: JSON.parse(JSON.stringify(data)) });
          store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify(data)))
          store.commit("setData", { key: "playing", value: true });
          freelogApp.setUserData("playingId", `${exhibitId}=${data.child.itemId}`);
        } else {
          // 场景一：点击播放合集
          // 1. 将合集的所有子作品加入播放列表(子作品有数量限制，暂不支持全量)
          // 2. 播放合集的第一个子作品

          // 获取所有子作品(按数量来确定要请求的数量)
          const res = await useMyPlay.getListInCollection(exhibitId);
          if (!res) { 
            showToast("合集里没有可添加的作品！")
            return
          } 
          store.commit("setCachePool", {
            key: exhibitId,
            value: JSON.parse(JSON.stringify(res))
          });

          // 获取第一个子作品的播放地址
          const availdRes = res.filter(ele => {
            const mime = ele?.articleInfo?.articleProperty?.mime
            if (store.state.isIOS) {
              return supportAudio.includes(mime) && !unSupportAudioIOS.includes(mime)
            }
            return supportAudio.includes(mime)
          })
          if (availdRes.length === 0) {
            showToast("合集里没有可添加的作品！")
            return
          }
          const firstItem = availdRes[0]
          let playingId = firstItem.itemId;
          const url = await freelogApp.getCollectionSubFileStream(exhibitId, {
            itemId: playingId,
            returnUrl: true
          });
          firstItem.url = url;
          await useMyPlay.addToPlayListBatch({
            exhibitId, 
            addArr: availdRes
          })

          const payload = { ...data, child: firstItem }
          store.commit("setData", { key: "playingInfo", value: payload });
          store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify(payload)))
          store.commit("setData", { key: "playing", value: true });
          freelogApp.setUserData("playingId", `${exhibitId}=${playingId}`);
        }
      } else {
        useMyPlay.addToPlayList({
          id: exhibitId,
          isExhibit: true
        });
        freelogApp.setUserData("playingId", exhibitId);
        // 已授权未获取 url
        const url = await freelogApp.getExhibitFileStream(exhibitId, { returnUrl: true });
        Vue.set(data, "url", url)
        store.commit("setData", { key: "playingInfo", value: data });
        store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify(data)))
        store.commit("setData", { key: "playing", value: true });
      }
    }
    return true
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

    const ids = [...new Set(idList.map(ele => ele.id))].join();
    const [list, countList, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids)
    ]);

    const allPoolIds = list.data.data.filter(ele => ele.articleInfo.articleType === 2).map(ele => ele.exhibitId)
    const allPoolUnique = [...new Set(allPoolIds)]
    const allPoolIdsStr = allPoolUnique.join(',')
    const subNumList = await freelogApp.getCollectionsSubList(allPoolIdsStr, {
      sortType: 1, 
      skip: 0,
      limit: 1,
      isShowDetailInfo: 1, 
    });
    const allPoolPromises = allPoolUnique.map(ele => useMyPlay.getListInCollection(ele))
    const allPoolDataList = await Promise.all(allPoolPromises)

    idList.forEach(ele => {
      const { id, itemId, isExhibit } = ele
      const collectionItem = list.data.data.find(item => item.exhibitId === id);
      if (!collectionItem) return;
      const signCountItem = countList.data.data.find(item => item.subjectId === id);
      const statusItem = statusList.data.data.find(item => item.exhibitId === id);
      const subNumItem = subNumList.data.data.find(item => item.exhibitId === id)
      const subListIndex = allPoolUnique.findIndex(item => item === id)
      const subListDataList = subListIndex !== -1 ? allPoolDataList[subListIndex] : []
      const subListItem = subListDataList.find(item => item.itemId === itemId)

      if (isExhibit) {
        const data = JSON.parse(JSON.stringify({
          ...collectionItem,
          signCount: signCountItem.count,
          defaulterIdentityType: statusItem.defaulterIdentityType,
          totalItem: subNumItem?.totalItem
        }))
        result.push(data);
      } else {
        const data = JSON.parse(JSON.stringify({
          ...collectionItem,
          signCount: signCountItem.count,
          defaulterIdentityType: statusItem.defaulterIdentityType,
          totalItem: subNumItem?.totalItem,
          child: subListItem
        }))
        result.push(data);
      }
    });
    store.commit("setData", { key: "collectionList", value: result });
    // store.commit("setData", { key: "lastestAuthList", value: statusList.data.data });
    store.dispatch("updateLastestAuthList")
  },

  /** 判断当前展品是否已被收藏 */
  ifExist(data) {
    if (!data) return false
    const { exhibitId, articleInfo, child } = data
    if (articleInfo.articleType === 1) {
      return store.state.collectionIdList.map(ele => ele.id).includes(exhibitId);
    } else {
      if (child) {
        return store.state.collectionIdList.some(ele => ele.id === exhibitId && ele.itemId === child.itemId)
      } else {
        return store.state.collectionIdList.some(ele => ele.id === exhibitId && !ele.itemId);
      }
    }
  },

  /** 操作收藏（如未收藏则收藏，反之取消收藏） */
  async operateCollect(data) {
    if (!store.state.userData.isLogin) {
      callLogin();
      return;
    }

    const { exhibitId, articleInfo, child } = data;
    const collectionIdList = [...store.state.collectionIdList];
    const collectionList = [...store.state.collectionList];
    let isCollected 
    if (articleInfo.articleType === 1) {
      isCollected = collectionIdList.map(ele => ele.id).includes(exhibitId);
    } else {
      if (child) {
        isCollected = collectionIdList.some(ele => ele.id === exhibitId && ele.itemId === child.itemId)
      } else {
        isCollected = collectionIdList.some(ele => ele.id === exhibitId && !ele.itemId);
      }
    }
    if (isCollected) {
      // 取消收藏
      if (articleInfo.articleType === 1) {
        const idIndex = collectionIdList.findIndex(item => item.id === exhibitId);
        if (idIndex !== -1) {
          collectionIdList.splice(idIndex, 1);
        }
        const index = collectionList.findIndex(item => item.exhibitId === exhibitId);
        if (idIndex !== -1) {
          collectionList.splice(index, 1);
        }
      } else {
        if (child) {
          const idIndex = collectionIdList.findIndex(item => item.id === exhibitId && child.itemId === item.itemId);
          if (idIndex !== -1) {
            collectionIdList.splice(idIndex, 1);
          }
          const index = collectionList.findIndex(item => item.exhibitId === exhibitId && item.child && child.itemId === item.child.itemId);
          if (index !== -1) {
            collectionList.splice(index, 1);
          }
        } else {
          const idIndex = collectionIdList.findIndex(item => item.id === exhibitId && !item.itemId);
          if (idIndex !== -1) {
            collectionIdList.splice(idIndex, 1);
          }
          const index = collectionList.findIndex(item => item.exhibitId === exhibitId && !item.child);
          if (index !== -1) {
            collectionList.splice(index, 1);
          }
        }
      }
    } else {
      // 收藏
      const payload = { ...data }
      if (articleInfo.articleType === 1) {
        collectionIdList.unshift({
          id: exhibitId,
          isExhibit: true
        });
      } else {
        if (child) {
          collectionIdList.unshift({
            id: exhibitId,
            isExhibit: false,
            itemId: child.itemId
          });
        } else {
          collectionIdList.unshift({
            id: exhibitId,
            isExhibit: true
          });
          const subNumList = await freelogApp.getCollectionsSubList(data.exhibitId, {
            sortType: 1, 
            skip: 0,
            limit: 1,
            isShowDetailInfo: 1, 
          });
          payload.totalItem = subNumList.data.data[0].totalItem
        }
      }
      collectionList.unshift(JSON.parse(JSON.stringify(payload)));     
    }
    const res = await freelogApp.setUserData("collectionIdList", collectionIdList);
    if (res.data.msg === "success") {
      store.commit("setData", { key: "collectionIdList", value: collectionIdList });
      store.commit("setData", { key: "collectionList", value: collectionList });
    } else {
      showToast("操作失败");
    }
  }
};

/** 播放 hook */
export const useMyPlay = {
  /** 获取播放列表数据 */
  async getPlayList() {
    const result = [];
    const rawIdList = store.state.playIdList;
    const idList = rawIdList.map(ele => ele.id);
    if (!idList.length) {
      store.commit("setData", { key: "playList", value: [] });
      return;
    }
    const ids = [...new Set(idList)].join();
    // 只获取可播放展品的数据
    const [list, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      freelogApp.getExhibitAuthStatus(ids)
    ]);

    const poolIdList = [...new Set(rawIdList.filter(ele => !ele.isExhibit).map(ele => ele.id))];
    const poolDataPromiseList = [];
    for (const exhibitId of poolIdList) {
      if (!store.state.cachePool[exhibitId]) {
        poolDataPromiseList.push(this.getListInCollection(exhibitId, { skip: 0, limit: 5 }));
      } else {
        poolDataPromiseList.push((async () => store.state.cachePool[exhibitId])());
      }
    }
    const poolDataList = await Promise.all(poolDataPromiseList);
    for (const [index, exhibitId] of poolIdList.entries()) {
      store.commit("setCachePool", {
        key: exhibitId,
        value: poolDataList[index]
      });
    }

    rawIdList.forEach(item => {
      const playItem = list.data.data.find(inner => inner.exhibitId === item.id);
      if (!playItem) return;
      const statusItem = statusList.data.data.find(inner => inner.exhibitId === item.id);
      if (!item.isExhibit && item.itemId) {
        const temp =
          store.state.cachePool[item.id] &&
          store.state.cachePool[item.id].find(inner => inner.itemId === item.itemId);
        const data = JSON.parse(
          JSON.stringify({
            ...playItem,
            defaulterIdentityType: statusItem.defaulterIdentityType,
            child: {
              itemId: item.itemId,
              ...temp
            }
          })
        );
        result.push(data);
      } else {
        result.push({ ...playItem, defaulterIdentityType: statusItem.defaulterIdentityType });
      }
    });
    store.commit("setData", { key: "playList", value: result });
    // store.commit("setData", { key: "lastestAuthList", value: statusList.data.data });
    store.dispatch("updateLastestAuthList")
  },

  /** 判断当前展品是否已存在播放列表中 */
  ifExist(data) {
    if (!data) return false
    const id = data.exhibitId
    if (!store.state.userData.isLogin) {
      // 未登录时播放列表取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      if (data.articleInfo.articleType === 1) {
        return playIdList.map(ele => ele.id).includes(id);
      } else {
        return playIdList.some(ele => ele.id === id && data.child && ele.itemId === data.child.itemId);
      }
    } else {
      // 已登录时播放列表取用户数据
      const playIdList = store.state.playIdList
      if (data.articleInfo.articleType === 1) {
        return playIdList.map(ele => ele.id).includes(id);
      } else {
        // 只针对合集的单个子作品
        return playIdList.some(ele => ele.id === id && data.child && ele.itemId === data.child.itemId);
      }
    }
  },

  /** 将合集/单集移出播放列表 */
  async removePlayListBatch(exhibitId) {
    if (!store.state.userData.isLogin) {
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      const newList = playIdList.filter(ele => ele.id !== exhibitId)
      localStorage.setItem("playIdList", JSON.stringify(newList));
      store.commit("setData", { key: "playIdList", value: newList });
      await useMyPlay.getPlayList();
    } else {
      const playIdList = [...store.state.playIdList];
      const newList = playIdList.filter(ele => ele.id !== exhibitId)
      const res = await freelogApp.setUserData("playIdList", newList);
      
      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: newList });
        await useMyPlay.getPlayList();
      }
    }
  },

  /** 将合集加入播放列表 */
  async addToPlayListBatch(options, bol = false) {
    const { exhibitId, addArr, callback } = options

    // 1.删除之前存在的 
    // 2.批量添加
    if (!store.state.userData.isLogin) {
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      // 1
      const newList = playIdList.filter(ele => ele.id !== exhibitId)
      // 2
      for (let index = addArr.length - 1; index >= 0; index--) {
        const { itemId } = addArr[index];
        newList.unshift({
          id: exhibitId,
          isExhibit: false,
          itemId
        });
      }

      localStorage.setItem("playIdList", JSON.stringify(newList));
      store.commit("setData", { key: "playIdList", value: newList });
      callback && callback();
      bol && showToast("添加成功");
      await useMyPlay.getPlayList();
    } else {
      // 已登录时存在用户数据
      const playIdList = [...store.state.playIdList];
      // 1
      const newList = playIdList.filter(ele => ele.id !== exhibitId)
      
      // 2
      for (let index = addArr.length - 1; index >= 0; index--) {
        const { itemId } = addArr[index];
        newList.unshift({
          id: exhibitId,
          isExhibit: false,
          itemId
        });
      }
      
      const res = await freelogApp.setUserData("playIdList", newList);
      
      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: newList });
        callback && callback();
        bol && showToast("添加成功");
        await useMyPlay.getPlayList();
      } else {
        showToast("加入播放列表失败");
      }
    }

  },

  /** 加入播放列表 */
  async addToPlayList(options) {
    const { id, callback, isExhibit, itemId } = options;
    if (!store.state.userData.isLogin) {
      // 未登录时存在本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      /* 检查是否已在播放列表中
        1.若是可播放展品 */
      if (
        isExhibit &&
        playIdList
          .filter(ele => ele.isExhibit === isExhibit)
          .map(ele => ele.id)
          .includes(id)
      ) {
        return;
      }
      /* 检查是否已在播放列表中
        2.若是合集这种不可播放展品 */
      if (
        !isExhibit &&
        playIdList
          .filter(ele => ele.isExhibit === isExhibit)
          .some(ele => ele.id === id && ele.itemId === itemId)
      ) {
        return
      }
      playIdList.unshift({
        id,
        isExhibit,
        itemId
      });

      localStorage.setItem("playIdList", JSON.stringify(playIdList));
      store.commit("setData", { key: "playIdList", value: playIdList });
      callback && callback();
      await useMyPlay.getPlayList();
    } else {
      // 已登录时存在用户数据
      const playIdList = [...store.state.playIdList];

      /* 检查是否已在播放列表中
        1.若是可播放展品 */
      if (
        isExhibit &&
        playIdList
          .filter(ele => ele.isExhibit === isExhibit)
          .map(ele => ele.id)
          .includes(id)
      ) {
        return;
      }
      /* 检查是否已在播放列表中
          2.若是合集这种不可播放展品 */
      if (
        !isExhibit &&
        playIdList
          .filter(ele => ele.isExhibit === isExhibit)
          .some(ele => ele.id === id && ele.itemId === itemId)
      ) {
        return;
      }

      playIdList.unshift({
        id,
        isExhibit,
        itemId
      });
      const res = await freelogApp.setUserData("playIdList", playIdList);

      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: playIdList });
        callback && callback();
        await useMyPlay.getPlayList();
      } else {
        showToast("加入播放列表失败");
      }
    }
  },

  /** 移出播放列表 */
  async removeFromPlayList(item) {
    const { exhibitId, child, articleInfo } = item
    const { playing, playingInfo } = store.state;

    if (!store.state.userData.isLogin) {
      // 未登录时取本地
      const list = localStorage.getItem("playIdList") || "[]";
      const playIdList = JSON.parse(list);
      const playList = store.state.playList;
      let index = 0
      if (articleInfo.articleType === 1) {
        const idIndex = playIdList.findIndex(item => item.id === exhibitId);
        playIdList.splice(idIndex, 1);
        localStorage.setItem("playIdList", JSON.stringify(playIdList));
        
        index = playList.findIndex(item => item.exhibitId === exhibitId);
        playList.splice(index, 1);
      } else {
        const idIndex = playIdList.findIndex(item => item.id === exhibitId && item.itemId === child.itemId);
        playIdList.splice(idIndex, 1);
        localStorage.setItem("playIdList", JSON.stringify(playIdList));

        index = playList.findIndex(item => item.exhibitId === exhibitId && item.child.itemId === child.itemId);
        playList.splice(index, 1);
      }

      store.commit("setData", { key: "playIdList", value: playIdList });
      store.commit("setData", { key: "playList", value: playList });

      if (exhibitId !== playingInfo?.exhibitId) return;
      if (playing) {
        // 如果移出的声音是当前正在播放的声音，自动播放列表中的下一个声音
        if (playList[index]) {
          useMyPlay.playOrPause(playList[index]);
        } else if (playList[0]) {
          useMyPlay.playOrPause(playList[0]);
        } else {
          store.commit("setData", { key: "playingInfo", value: null });
        }
      } else {
        // 如果移出的声音是当前正在暂停的声音，将播放中的声音信息置空
        store.commit("setData", { key: "playingInfo", value: null });
      }
    } else {
      // 已登录时取用户数据
      const playIdList = [...store.state.playIdList];
      const playList = store.state.playList;

      // 从playIdList中移除
      if (articleInfo.articleType === 1) {
        const index = playIdList.findIndex(item => item.id === exhibitId);
        playIdList.splice(index, 1);
      } else {
        const idIndex = playIdList.findIndex(item => item.id === exhibitId && item.itemId === child.itemId);
        playIdList.splice(idIndex, 1);
      }
      const res = await freelogApp.setUserData("playIdList", playIdList);

      if (res.data.errCode === 0) {
        let index = 0
        if (articleInfo.articleType === 1) {
          index = playList.findIndex(item => item.exhibitId === exhibitId);
          playList.splice(index, 1);
        } else {
          index = playList.findIndex(item => item.exhibitId === exhibitId && item.child.itemId === child.itemId);
          playList.splice(index, 1);
        }

        store.commit("setData", { key: "playIdList", value: playIdList });
        store.commit("setData", { key: "playList", value: playList });

        const cond1 = articleInfo.articleType === 1 && exhibitId === playingInfo?.exhibitId
        const cond2 = articleInfo.articleType === 2 && exhibitId === playingInfo?.exhibitId && child.itemId === playingInfo.child.itemId
        if (!cond1 && !cond2) return;
        if (playing) {
          // 如果移出的声音是当前正在播放的声音，自动播放列表中的下一个声音
          if (playList[index]) {
            useMyPlay.playOrPause(playList[index]);
          } else if (playList[0]) {
            useMyPlay.playOrPause(playList[0]);
          } else {
            store.commit("setData", { key: "playingInfo", value: null });
          }
        } else {
          // 如果移出的声音是当前正在暂停的声音，将播放中的声音信息置空
          store.commit("setData", { key: "playingInfo", value: null });
        }
      } else {
        showToast("操作失败");
      }
    }
  },

  /** 清空播放列表 */
  async clearPlayList() {
    if (!store.state.userData.isLogin) {
      // 未登录时取本地
      localStorage.setItem("playIdList", "[]");
      store.commit("setData", { key: "playIdList", value: [] });
      store.commit("setData", { key: "playList", value: [] });
      store.commit("setData", { key: "playing", value: false });
      store.commit("setData", { key: "playingInfo", value: null });
      store.commit("setData", { key: "progress", value: 0 });
      store.commit("setplayingSuccessRecorder", "init")
    } else {
      // 已登录时取用户数据
      const res = await freelogApp.setUserData("playIdList", []);
      if (res.data.msg === "success") {
        store.commit("setData", { key: "playIdList", value: [] });
        store.commit("setData", { key: "playList", value: [] });
        store.commit("setData", { key: "playing", value: false });
        store.commit("setData", { key: "playingInfo", value: null });
        store.commit("setData", { key: "progress", value: 0 });
        store.commit("setplayingSuccessRecorder", "init")
      } else {
        showToast("清空列表失败");
      }
    }
  },

  /** 播放展品
   * type: "preVoice" 表"上一首"
   * type: "nextVoice" 表"下一首"
   * type: "pool" 表"合集"
   * type: "normal" 表"点选某首歌曲"(不是播放完成后自动播放下一首, 也不是手动点击播放下一首)
   */
  async playOrPause(exhibit, type = "normal", sortType) {
    if (!exhibit) {
      store.commit("setData", { key: "playing", value: false });
      store.commit("setData", { key: "playingInfo", value: null });
      return;
    }

    const { defaulterIdentityType, url, exhibitId, articleInfo, onlineStatus } = exhibit;

    /* part0: 展品被封禁 */
    if (articleInfo.status === 2) {
      // 跳到下一个展品; 若展品是合集则跳过整个合集; 若展品是单集则跳过此单集;
      if (["preVoice", "nextVoice"].includes(type)) {
        useMyPlay[type](exhibit, true)
        showToast(`当前展品《${exhibit.exhibitTitle}》已被封禁，正在为你播放后续歌曲!`)
        return
      }
      showToast(`当前展品《${exhibit.exhibitTitle}》已被封禁`)
      return
    }

    /* part0.1: 展品被封禁 */
    if (onlineStatus === 0) {
      showToast(`当前展品《${exhibit.exhibitTitle}》已被下架`)
      return 
    }

    const { playing, playingSuccessRecorder, playList } = store.state;
    const preplayingInfo = playingSuccessRecorder.length > 0 ? playingSuccessRecorder[playingSuccessRecorder.length - 1] : null;
    
    /* part1: 不管是否有授权, 先设置"正在播放"和"先行暂停" */
    if (type !== "pool") {
      // 合集则暂不设置正在播放
      store.commit("setData", { key: "playingInfo", value: exhibit });
    }
    
    // "先行暂停"的处理逻辑
    if (preplayingInfo) {
      /* 如果有前一首, "当前和前一首"有两种情况
       * 1. 属同一个合集, 或是同一首歌(2.1 同是合集的子作品; 2.2 同是合集; 2.3 同是单集;)
       * 2. 不同的合集, 或是不同的歌
       */
      if (preplayingInfo.exhibitId === exhibitId) {
        if (exhibit.child && preplayingInfo.child) {
          // 2.1
          if (exhibit.child.itemId === preplayingInfo.child.itemId) {
            // 同一合集, 且同一个单品
            store.commit("setData", { key: "playing", value: !playing });
            return
          } else {
            // 同一合集, 不同的单品
            store.commit("setData", { key: "progress", value: 0 });
            store.commit("setData", { key: "playing", value: false });
          }
        } else if (!exhibit.child) {
          // 2.2
          // 播放合集, 删除子作品, 但未删干净, 点击合集, 暂停
          // 播放合集, 删除所有子作品, 点击合集, 添加到播放列表
          if (playList.some(ele => ele.exhibitId === exhibitId)) {
            store.commit("setData", { key: "playing", value: !playing });
            return
          }
        } else {
          // 2.3
          store.commit("setData", { key: "playing", value: !playing });
          return
        }
      } else {
        store.commit("setData", { key: "progress", value: 0 });
        store.commit("setData", { key: "playing", value: false });
      }
    } else {
      // 没有播放过, 先行暂停
      store.commit("setData", { key: "playing", value: false });
    }

    /* part2: 授权相关 */
    if (![0, 4].includes(defaulterIdentityType)) {
      // 授权链异常, defaulterIdentityType: 授权不通过责任方(0:无 1:资源 2:节点 4:c端消费者 128:未知)
      if (["preVoice", "nextVoice"].includes(type)) {
        // 自动按播放列表顺序播放时，直接播放列表中的下一首
        useMyPlay[type](exhibit);
      } else {
        // 非按顺序播放时，弹出提示
        showToast("授权链异常");
      }
      return;
    } else if (defaulterIdentityType === 4) {
      // 未授权, 则获取授权
      const bol = await useMyAuth.getAuth(exhibit, true);
      // 获取授权失败(关闭授权弹框), 若当前是单曲则下一首，若是合集，则跳过此合集
      if (!bol && ["preVoice", "nextVoice"].includes(type)) {
        if (exhibit.articleInfo.articleType === 1) {
          useMyPlay[type](exhibit);
        } else if (exhibit.articleInfo.articleType === 2) {
          useMyPlay[type](exhibit, true);
        }
      }
      return;
    } else if (exhibit.articleInfo.articleType === 1 && !url) {
      // 已授权未获取 url
      const url = await freelogApp.getExhibitFileStream(exhibitId, { returnUrl: true });
      Vue.set(exhibit, "url", url)
    } else if (exhibit.articleInfo.articleType === 2 && exhibit.child && !exhibit.child.url) {
      // 已授权未获取 url
      const detail = await freelogApp.getCollectionSubInfo(exhibitId, {
        itemId: exhibit.child.itemId
      });
      const url = await freelogApp.getCollectionSubFileStream(exhibitId, {
        itemId: exhibit.child.itemId,
        returnUrl: true
      });
      // console.log(url);
      const statusInfo = await freelogApp.getCollectionSubAuth(exhibitId, {
        itemIds: exhibit.child.itemId
      });

      if (detail.data.errCode === 0) {
        Vue.set(exhibit, "child", {
          ...detail.data.data,
          url,
          authCode: statusInfo.data.data[0].authCode
        })
        if (detail.data.data.articleInfo.status === 2) {
          // 延时播放下一首, 目的是先让player.vue中的requestTry的"封禁"先提示;
          setTimeout(() => {
            if (["preVoice", "nextVoice"].includes(type)) {
              // 自动按播放列表顺序播放时，直接播放列表中的下一首
              useMyPlay[type](exhibit);
            }
          }, 1200)
          return
        }
      }
    }
    
    /* part3: 调用场景罗列 */
    if (exhibit.articleInfo.articleType === 2 && !exhibit.child) {
      // 场景一：点击播放合集
      // 1. 将合集的所有子作品加入播放列表(子作品有数量限制，暂不支持全量)
      // 2. 播放合集的第一个子作品

      // 获取所有子作品(按数量来确定要请求的数量)
      const options = sortType ? { sortType } : {}
      const res = await this.getListInCollection(exhibitId, options);
      if (!res) { 
        showToast("合集里没有可添加的作品！")
        return
      } 
      store.commit("setCachePool", {
        key: exhibitId,
        value: JSON.parse(JSON.stringify(res))
      });
      // 获取第一个子作品的播放地址
      const availdRes = res.filter(ele => {
        const mime = ele?.articleInfo?.articleProperty?.mime
        if (store.state.isIOS) {
          return supportAudio.includes(mime) && !unSupportAudioIOS.includes(mime)
        }
        return supportAudio.includes(mime)
      })
      if (availdRes.length === 0) {
        showToast("合集里没有可添加的作品！")
        return
      }
      const firstItem = availdRes[0]
      let playingId = firstItem.itemId;
      
      const url = await freelogApp.getCollectionSubFileStream(exhibitId, {
        itemId: playingId,
        returnUrl: true
      });
      firstItem.url = url;
      await this.addToPlayListBatch({
        exhibitId, 
        addArr: availdRes
      })

      store.commit("setData", { key: "playingInfo", value: { ...exhibit, child: firstItem } });
      store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify({ ...exhibit, child: firstItem })))
      store.commit("setData", { key: "playing", value: true });
      freelogApp.setUserData("playingId", `${exhibitId}=${playingId}`);
    } else if (exhibit.articleInfo.articleType === 2 && exhibit.child) {
      // 场景二：进去合集里点击某一首歌曲
      useMyPlay.addToPlayList({
        id: exhibitId,
        isExhibit: false,
        itemId: exhibit.child.itemId
      });
      store.commit("setData", { key: "playingInfo", value: exhibit });
      store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify(exhibit)))
      store.commit("setData", { key: "playing", value: true });
      freelogApp.setUserData("playingId", `${exhibitId}=${exhibit.child.itemId}`);
    } else {
      // 场景三：点击可播放的展品
      useMyPlay.addToPlayList({
        id: exhibitId,
        isExhibit: true
      });
      store.commit("setData", { key: "playingInfo", value: exhibit });
      store.commit("setplayingSuccessRecorder", JSON.parse(JSON.stringify(exhibit)))
      store.commit("setData", { key: "playing", value: true });
      freelogApp.setUserData("playingId", exhibitId);
    }
  },

  /** 获取播放数据 */
  async getPlayingInfo(id, itemId) {
    if (!itemId) {
      const [info, statusInfo, url] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitAuthStatus(id),
        freelogApp.getExhibitFileStream(id, { returnUrl: true })
      ]);
      info.data.data.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
      info.data.data.url = url;
      store.commit("setData", { key: "playingInfo", value: info.data.data });
    } else {
      const [info, statusInfo, url, detail] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitAuthStatus(id),
        freelogApp.getCollectionSubFileStream(id, {
          itemId: itemId,
          returnUrl: true
        }),
        freelogApp.getCollectionSubInfo(id, {
          itemId: itemId
        })
      ]);
      info.data.data.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
      info.data.data.child = detail.data.data
      info.data.data.child.url = url;
      store.commit("setData", { key: "playingInfo", value: info.data.data });
    }
  },

  /** 上一首 */
  preVoice(data, skip = false) {
    let preVoiceInfo = null;
    const { playList, playingInfo } = store.state;
    const id = data ? data.exhibitId : playingInfo.exhibitId;
    const currentData = data ? data : playingInfo

    let index = 0;
    if (currentData.articleInfo.articleType === 1) {
      index = playList.findIndex(item => item.exhibitId === id);
    } else {
      let itemId
      if (data) {
        if (data.child) itemId = data.child.itemId 
      } else {
        if (playingInfo.child) itemId = playingInfo.child.itemId
      }
      if (!skip) {
        index = playList.findIndex(item => item.exhibitId === id && item?.child?.itemId === itemId);
      } else {
        index = playList.findIndex(item => item.exhibitId === id);
      }
    }
    if (index === 0) {
      preVoiceInfo = playList[playList.length - 1];
    } else {
      preVoiceInfo = playList[index - 1];
    }
    useMyPlay.playOrPause(preVoiceInfo, "preVoice");
  },

  /** 下一首 */
  nextVoice(data, skip = false) {
    let nextVoiceInfo = null;
    const { playList, playingInfo } = store.state;
    const id = data ? data.exhibitId : playingInfo.exhibitId;
    const currentData =  data ? data : playingInfo

    let index = 0;
    if (currentData.articleInfo.articleType === 1) {
      index = playList.findIndex(item => item.exhibitId === id);
    } else {
      let itemId
      if (data) {
        if (data.child) itemId = data.child.itemId 
      } else {
        if (playingInfo.child) itemId = playingInfo.child.itemId
      }
      if (!skip) {
        index = playList.findIndex(item => item.exhibitId === id && item?.child?.itemId === itemId);
      } else {
        index = playList.findLastIndex(item => item.exhibitId === id);
      }
    }
    if (index === playList.length - 1) {
      nextVoiceInfo = playList[0];
    } else {
      nextVoiceInfo = playList[index + 1];
    }
    useMyPlay.playOrPause(nextVoiceInfo, "nextVoice");
  },

  /** 获取数据 */
  async getListInCollection(exhibitId, options = { skip: 0, limit: 100 }) {
    const result = [];
    const res = await freelogApp.getCollectionSubList(exhibitId, {
      isShowDetailInfo: 1,
      ...options
    });
    if (res.data.errCode === 0) {
      let { totalItem, skip, limit, dataList } = res.data.data;
      result.push(...dataList);
      skip = skip + limit;
      if (totalItem > skip) {
        const req = await this.getListInCollection(exhibitId, { skip: skip, limit });
        result.push(...req);
      }
      return result;
    } else {
      console.warn(res.data);
      return null;
    }
  }
};
