import {
  callLogin,
  getExhibitAuthStatus,
  getExhibitAvailable,
  getExhibitListById,
  GetExhibitListByIdParams,
  getExhibitListByPaging,
  GetExhibitListByPagingParams,
  getExhibitSignCount,
  getSignStatistics,
  getUserData,
  setUserData,
} from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { onUnmounted, reactive, ref, toRefs, watch, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { showToast } from "./common";

/**
 * 路由hook
 */
export const useMyRouter = () => {
  const router = useRouter();
  const route = useRoute();
  const query = ref();

  watchEffect(() => {
    query.value = { ...route.query };
  });

  // 路由跳转方法
  const switchPage = (path: string, query: any = {}) => {
    router.push({ path, query });
  };

  // 路由跳转方法
  const routerBack = () => {
    router.back();
  };

  // 获取当前路由方法
  const getCurrentPath: () => any = () => {
    return router.currentRoute.value.fullPath;
  };

  return { route, router, query, switchPage, routerBack, getCurrentPath };
};

/**
 * 页面路由记录hook
 */
export const useMyLocationHistory = () => {
  const store = useStore();
  const router = useRouter();

  watch(
    () => router,
    (cur) => {
      const { current, replaced } = cur.options.history.state;
      const { locationHistory } = store.state;
      if (!locationHistory.length) {
        locationHistory.push(current);
        store.commit("setData", { key: "locationHistory", value: locationHistory });
        return;
      }

      if (!replaced) {
        locationHistory.push(current);
      } else {
        locationHistory.pop();
      }
      store.commit("setData", { key: "locationHistory", value: locationHistory });
    },
    { immediate: true }
  );
};

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const store = useStore();

  const data = reactive({
    isCollected: false,
  });

  // 获取书架数据
  const getMyShelf = async () => {
    if (!store.state.userData.isLogin) return;

    const ids = await getUserData("shelf");
    const shelfIds = (ids || []).sort();
    const storeShelfIds = store.state.shelfIds.sort();
    let change = false;
    if (shelfIds.length !== storeShelfIds.length) {
      change = true;
    } else {
      for (let i = 0; i < Math.max(shelfIds.length, storeShelfIds.length); i++) {
        if (shelfIds[i] !== storeShelfIds[i]) {
          change = true;
          break;
        }
      }
    }

    if (!change) return;

    store.commit("setData", { key: "shelfIds", value: shelfIds });

    if (!ids || ids.length === 0) {
      store.commit("setData", { key: "myShelf", value: [] });
      return;
    }

    const exhibitIds = ids.join(",");
    const queryParams: GetExhibitListByIdParams = { exhibitIds };
    const list = await getExhibitListById(queryParams);
    if (list.data.data.length !== 0) {
      const idList: string[] = [];
      list.data.data.forEach((item: ExhibitItem) => {
        idList.push(item.exhibitId);
      });
      const ids = idList.join(",");
      const statusInfo = await getExhibitAuthStatus(ids);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; authCode: number }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          list.data.data[index].authCode = item.authCode;
        });
      }
      const authLinkStatusInfo = await getExhibitAvailable(ids);
      if (authLinkStatusInfo.data.data) {
        authLinkStatusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          // 全链路授权码为301时，必定是授权链出错
          list.data.data[index].authLinkNormal = list.data.data[index].authCode === 301 ? false : item.isAuth;
        });
      }
    }
    store.commit("setData", { key: "myShelf", value: list.data.data });
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (exhibitId: string) => {
    const shelfIds = store.state.shelfIds;
    const isCollected = shelfIds.includes(exhibitId);
    return isCollected;
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    if (!store.state.userData.isLogin) {
      callLogin();
      return;
    }

    const isThisCollected = ifExistInShelf(exhibit.exhibitId);

    const shelfIds = [...store.state.shelfIds];
    if (isThisCollected) {
      const index = shelfIds.findIndex((item: string) => item === exhibit.exhibitId);
      shelfIds.splice(index, 1);
    } else {
      shelfIds.push(exhibit.exhibitId);
    }
    const res = await setUserData("shelf", shelfIds);
    if (res.data.msg === "success") {
      showToast(isThisCollected ? `已将书籍从书架中移除～` : `已将书籍加入书架～`);
      getMyShelf();
      if (id) data.isCollected = ifExistInShelf(id);
    } else {
      showToast("收藏失败");
    }
  };

  watch(
    () => store.state.myShelf,
    () => {
      if (id) data.isCollected = ifExistInShelf(id);
    },
    { immediate: true }
  );

  getMyShelf();

  return { ...toRefs(data), operateShelf };
};

/**
 * 搜索历史hook
 */
export const useSearchHistory = () => {
  const data = reactive({
    searchHistory: [] as string[],
  });

  // 获取搜索历史
  const getSearchHistory = async () => {
    const json = localStorage.getItem("searchHistory") || "[]";
    data.searchHistory = JSON.parse(json);
  };

  // 搜索
  const searchWord = (keywords: string) => {
    keywords = keywords.trim();
    if (!keywords) return;
    const index = data.searchHistory.findIndex((item) => item === keywords);
    if (index !== -1) data.searchHistory.splice(index, 1);
    if (data.searchHistory.length === 10) data.searchHistory.pop();
    data.searchHistory.unshift(keywords);
    localStorage.setItem("searchHistory", JSON.stringify(data.searchHistory));
  };

  // 删除搜索词
  const deleteWord = (keywords: string) => {
    const index = data.searchHistory.findIndex((item) => item === keywords);
    if (index === -1) return;
    data.searchHistory.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(data.searchHistory));
  };

  // 清空搜索词
  const clearHistory = () => {
    localStorage.setItem("searchHistory", "[]");
    data.searchHistory = [];
  };

  getSearchHistory();

  return { ...toRefs(data), searchWord, deleteWord, clearHistory };
};

/**
 * 获取列表数据hook
 */
export const useGetList = () => {
  const data = reactive({
    listData: <ExhibitItem[]>[],
    loading: false,
    myLoading: false,
    total: 0,
    skip: 0,
  });

  const getList = async (params: Partial<GetExhibitListByPagingParams> = {}, init = false) => {
    if (data.myLoading) return;
    if (data.total === data.listData.length && !init) return;

    if (init) data.loading = true;
    data.myLoading = true;
    data.skip = init ? 0 : data.skip + 30;
    const queryParams: GetExhibitListByPagingParams = {
      skip: data.skip,
      articleResourceTypes: "image",
      limit: params.limit || 30,
      ...params,
    };
    const list = await getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const idList: string[] = [];
      dataList.forEach((item: ExhibitItem) => {
        idList.push(item.exhibitId);
      });
      const ids = idList.join(",");
      const signCountData = await getExhibitSignCount(ids);
      signCountData.data.data.forEach((item: { subjectId: string; count: number }) => {
        const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.subjectId);
        dataList[index].signCount = item.count;
      });
      const statusInfo = await getExhibitAuthStatus(ids);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; authCode: number }) => {
          const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          dataList[index].authCode = item.authCode;
        });
      }
      const authLinkStatusInfo = await getExhibitAvailable(ids);
      if (authLinkStatusInfo.data.data) {
        authLinkStatusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          // 全链路授权码为301时，必定是授权链出错
          dataList[index].authLinkNormal = dataList[index].authCode === 301 ? false : item.isAuth;
        });
      }
    }
    data.listData = init ? dataList : [...data.listData, ...dataList];
    data.total = totalItem;
    if (init) data.loading = false;
    data.myLoading = false;
  };

  const clearData = () => {
    data.listData = [];
    data.total = 0;
  };

  return {
    ...toRefs(data),
    getList,
    clearData,
  };
};

/**
 * 我的已签约展品hook
 */
export const useMySignedList = () => {
  interface SignedItem {
    subjectId: string;
    isAuth: boolean;
  }

  const store = useStore();
  const data = reactive({
    mySignedList: <ExhibitItem[] | null>null,
    loading: false,
  });

  // 获取已签约展品数据
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const signedList: any = await getSignStatistics({ keywords });
    const ids: string[] = [];
    signedList.data.data.forEach((item: SignedItem) => {
      ids.push(item.subjectId);
    });

    if (ids.length === 0) {
      data.mySignedList = [];
      return;
    }

    const exhibitIds = ids.join(",");
    const queryParams: GetExhibitListByIdParams = { exhibitIds };
    const list = await getExhibitListById(queryParams);
    if (list.data.data.length !== 0) {
      const statusInfo = await getExhibitAuthStatus(exhibitIds);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; authCode: number }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          list.data.data[index].authCode = item.authCode;
        });
      }
      const authLinkStatusInfo = await getExhibitAvailable(exhibitIds);
      if (authLinkStatusInfo.data.data) {
        authLinkStatusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          // 全链路授权码为301时，必定是授权链出错
          list.data.data[index].authLinkNormal = list.data.data[index].authCode === 301 ? false : item.isAuth;
        });
      }
    }
    data.mySignedList = list.data.data.filter((item: ExhibitItem) => item.articleInfo.resourceType !== "theme");
  };

  getMySignedList();

  return {
    ...toRefs(data),
    getMySignedList,
  };
};

/**
 * 获取页面滚动相关信息hook
 */
export const useMyScroll = () => {
  const app = document.getElementById("app");
  const data = reactive({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
  });

  const scroll = () => {
    data.scrollTop = app?.scrollTop || 0;
    data.clientHeight = app?.clientHeight || 0;
    data.scrollHeight = app?.scrollHeight || 0;
  };

  const scrollTo = (top: number, behavior: ScrollBehavior = "smooth") => {
    app?.scroll({ top, behavior });
  };

  const scrollToTop = () => {
    app?.scroll({ top: 0, behavior: "smooth" });
  };

  app?.addEventListener("scroll", scroll);
  onUnmounted(() => {
    app?.removeEventListener("scroll", scroll);
  });

  return {
    ...toRefs(data),
    scrollTo,
    scrollToTop,
  };
};
