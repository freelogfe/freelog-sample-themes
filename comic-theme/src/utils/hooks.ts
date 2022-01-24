import {
  callLogin,
  getExhibitAuthStatus,
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
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const query = ref();

  watchEffect(() => {
    query.value = { ...route.query };
  });

  // 路由跳转方法
  const switchPage = (path: string, query: any = {}) => {
    const { locationHistory } = store.state;
    router.push({ path, query });
    locationHistory.push({ path, query });

    store.commit("setData", { key: "locationHistory", value: locationHistory });
  };

  // 路由跳转方法
  const routerBack = () => {
    router.back();
  };

  // 获取当前路由方法
  const getCurrentPath: () => any = () => {
    return router.currentRoute.value.fullPath;
  };

  // 初始化路由记录
  const initLocationHistory = () => {
    const { locationHistory } = store.state;
    if (locationHistory.length !== 0) return;

    const { path } = router.currentRoute.value;
    locationHistory.push({ path });
    store.commit("setData", { key: "locationHistory", value: locationHistory });
  };

  initLocationHistory();

  return { route, query, switchPage, routerBack, getCurrentPath };
};

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const store = useStore();
  const { switchPage, getCurrentPath } = useMyRouter();

  const data = reactive({
    shelfIds: [] as string[],
    myShelf: [] as ExhibitItem[],
    isCollected: false,
  });

  // 获取书架数据
  const getMyShelf = async () => {
    // 用户未登录
    if (!store.state.userData && getCurrentPath() === "/shelf") {
      switchPage("/home");
      return;
    }

    if (!store.state.userData) return;

    const ids = await getUserData("shelf");
    data.shelfIds = ids || [];

    if (!ids || ids.length === 0) {
      data.myShelf = [];
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
        statusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          list.data.data[index].isAuth = item.isAuth;
        });
      }
    }
    data.myShelf = list.data.data;
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (exhibitId: string) => {
    const isCollected = data.shelfIds.includes(exhibitId);
    return isCollected;
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    if (!store.state.userData) {
      callLogin();
      return;
    }

    const isThisCollected = ifExistInShelf(exhibit.exhibitId);

    if (isThisCollected) {
      const index = data.shelfIds.findIndex((item) => item === exhibit.exhibitId);
      data.shelfIds.splice(index, 1);
    } else {
      data.shelfIds.push(exhibit.exhibitId);
    }
    const res = await setUserData("shelf", data.shelfIds);
    if (res.data.msg === "success") {
      showToast(isThisCollected ? `已将书籍从书架中移除～` : `已将书籍加入书架～`);
      getMyShelf();
    } else {
      showToast("收藏失败");
    }
  };

  watch(
    () => data.myShelf,
    () => {
      if (id) data.isCollected = ifExistInShelf(id);
    }
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
    total: 0,
    skip: 0,
  });

  const getList = async (params: Partial<GetExhibitListByPagingParams> = {}, init = false) => {
    if (data.loading) return;
    if (data.total === data.listData.length && !init) return;

    data.loading = true;
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
        statusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          dataList[index].isAuth = item.isAuth;
        });
      }
    }
    data.listData = init ? dataList : [...data.listData, ...dataList];
    data.total = totalItem;
    data.loading = false;
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
    mySignedList: <ExhibitItem[]>[],
    loading: false,
  });

  // 获取已签约展品数据
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData) return;

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
      list.data.data.forEach((item: ExhibitItem) => {
        const signedItem = signedList.data.data.find((listItem: SignedItem) => listItem.subjectId === item.exhibitId);
        item.isAuth = signedItem.isAuth;
      });
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
