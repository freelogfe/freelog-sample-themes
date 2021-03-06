import {
  callLogin,
  getExhibitAuthStatus,
  getExhibitListById,
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

    if (!ids || ids.length === 0) {
      store.commit("setData", { key: "myShelf", value: [] });
      return;
    }

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

    const exhibitIds = ids.join(",");
    const [list, statusList] = await Promise.all([
      getExhibitListById({ exhibitIds }),
      getExhibitAuthStatus(exhibitIds),
    ]);
    list.data.data.forEach((item: ExhibitItem) => {
      const statusItem = statusList.data.data.find(
        (status: { exhibitId: string }) => status.exhibitId === item.exhibitId
      );
      item.defaulterIdentityType = statusItem.defaulterIdentityType;
    });
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
      showToast("操作失败");
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
      articleResourceTypes: "图片",
      limit: params.limit || 30,
      ...params,
    };
    const list = await getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const ids = dataList.map((item: ExhibitItem) => item.exhibitId).join();
      const [signCountData, statusInfo] = await Promise.all([getExhibitSignCount(ids), getExhibitAuthStatus(ids)]);
      dataList.forEach((item: ExhibitItem) => {
        let index;
        index = signCountData.data.data.findIndex(
          (resultItem: { subjectId: string }) => resultItem.subjectId === item.exhibitId
        );
        if (index !== -1) item.signCount = signCountData.data.data[index].count;
        index = statusInfo.data.data.findIndex(
          (resultItem: { exhibitId: string }) => resultItem.exhibitId === item.exhibitId
        );
        if (index !== -1) item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
      });
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
    const ids = signedList.data.data.map((item: SignedItem) => item.subjectId).join();

    if (!ids) {
      data.mySignedList = [];
      return;
    }

    const [list, statusList] = await Promise.all([getExhibitListById({ exhibitIds: ids }), getExhibitAuthStatus(ids)]);
    list.data.data.forEach((item: ExhibitItem) => {
      const statusItem = statusList.data.data.find(
        (status: { exhibitId: string }) => status.exhibitId === item.exhibitId
      );
      item.defaulterIdentityType = statusItem.defaulterIdentityType;
    });
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
