import { nextTick, onUnmounted, reactive, ref, toRefs, watch, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ExhibitItem } from "../api/interface";
import { freelogApp } from "freelog-runtime";

/** 路由 hook */
export const useMyRouter = () => {
  const router = useRouter();
  const route = useRoute();
  const query = ref();

  watchEffect(() => {
    query.value = { ...route.query };
  });

  /** 路由跳转 */
  const switchPage = (path: string, query: any = {}, mode = "push") => {
    if (mode === "push") {
      router.push({ path, query });
    } else if (mode === "replace") {
      router.replace({ path, query });
    }
  };

  /** 路由返回 */
  const routerBack = () => {
    router.back();
  };

  /** 获取当前路由 */
  const getCurrentPath = () => {
    return router.currentRoute.value.fullPath;
  };

  return { query, route, router, switchPage, routerBack, getCurrentPath };
};

/** 路由历史 hook */
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
    { immediate: true, deep: true }
  );
};

/** 展品列表 hook */
export const useGetList = () => {
  const store = useStore();

  const data = reactive({
    listData: <ExhibitItem[]>[],
    loading: false,
    myLoading: false,
    total: 0,
    skip: 0,
  });

  /** 获取展品列表 */
  const getList = async (params: any = {}, init = false) => {
    if (data.myLoading) return;
    if (data.total === data.listData.length && !init) return;

    store.commit("setData", { key: "homeLoading", value: true });
    if (init) data.loading = true;
    data.myLoading = true;
    data.skip = init ? 0 : data.skip + 40;
    const queryParams = { skip: data.skip, articleResourceTypes: "图片,视频", limit: params.limit || 40, ...params };
    const list = await freelogApp.getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const ids = dataList.map((item) => item.exhibitId).join();
      const [signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitSignCount(ids),
        freelogApp.getExhibitAuthStatus(ids),
      ]);
      (dataList as ExhibitItem[]).forEach((item) => {
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
    } else {
      store.commit("setData", { key: "homeLoading", value: false });
    }
    data.listData = init ? dataList : [...data.listData, ...dataList];
    data.total = totalItem;
    if (init) data.loading = false;
    data.myLoading = false;
  };

  /** 清空展品列表 */
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

/** 搜索 hook */
export const useSearchHistory = () => {
  const data = reactive({
    searchHistory: [] as string[],
  });

  /** 获取搜索历史 */
  const getSearchHistory = async () => {
    const json = localStorage.getItem("searchHistory") || "[]";
    data.searchHistory = JSON.parse(json);
  };

  /** 搜索 */
  const searchWord = (keywords = "") => {
    keywords = keywords.trim();
    if (!keywords) return;
    const index = data.searchHistory.findIndex((item) => item === keywords);
    if (index !== -1) data.searchHistory.splice(index, 1);
    if (data.searchHistory.length === 10) data.searchHistory.pop();
    data.searchHistory.unshift(keywords);
    localStorage.setItem("searchHistory", JSON.stringify(data.searchHistory));
  };

  /** 删除搜索词 */
  const deleteWord = (keywords: string) => {
    const index = data.searchHistory.findIndex((item) => item === keywords);
    if (index === -1) return;
    data.searchHistory.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(data.searchHistory));
  };

  /** 清空搜索词 */
  const clearHistory = () => {
    localStorage.setItem("searchHistory", "[]");
    data.searchHistory = [];
  };

  getSearchHistory();

  return { ...toRefs(data), searchWord, deleteWord, clearHistory };
};

/** 签约列表 hook */
export const useMySignedList = () => {
  interface SignedItem {
    subjectId: string;
  }

  const store = useStore();
  const data = reactive({
    mySignedList: <ExhibitItem[]>[],
    loading: false,
  });

  /** 获取已签约列表 */
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const signedList = await freelogApp.getSignStatistics({ keywords });
    const ids = signedList.data.data.map((item: SignedItem) => item.subjectId).join();

    if (!ids) {
      data.mySignedList = [];
      return;
    }

    const [list, signCountData, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids }),
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids),
    ]);
    (list.data.data as ExhibitItem[]).forEach((item) => {
      const signCountItem = signCountData.data.data.find((signCount) => signCount.subjectId === item.exhibitId);
      item.signCount = signCountItem?.count;
      const statusItem = statusList.data.data.find((status) => status.exhibitId === item.exhibitId);
      item.defaulterIdentityType = statusItem?.defaulterIdentityType;
    });
    data.mySignedList = list.data.data.filter((item) => !item.articleInfo.resourceType.includes("主题"));
  };

  getMySignedList();

  return {
    ...toRefs(data),
    getMySignedList,
  };
};

/** 瀑布流 hook */
export const useMyWaterfall = () => {
  const store = useStore();
  const data = reactive({
    listNumber: 0,
    waterfallList: ["first", "second", "third", "fourth", "fifth"],
    waterfall: {} as Record<string, ExhibitItem[]>,
  });
  let heightList: number[] = [];

  /** 根据屏幕宽度判断瀑布流列数 */
  const getListNumber = () => {
    const { clientWidth } = document.body;
    const { inMobile } = store.state;
    if (inMobile) {
      data.listNumber = 2;
    } else {
      // 屏幕宽度小于等于 1600 时，显示 4 列，否则显示 5 列
      const listNumber = clientWidth <= 1600 ? 4 : 5;
      if (data.listNumber !== listNumber) data.listNumber = listNumber;
    }
  };

  /** 初始化瀑布流数据 */
  const initWaterfall = () => {
    heightList = [];
    data.waterfall = {};
    for (let i = 0; i < data.listNumber; i++) {
      data.waterfall[data.waterfallList[i]] = [];
    }
  };

  /** 整理瀑布流数据 */
  const setWaterFall = (listData: ExhibitItem[], startIndex = 0) => {
    for (let i = startIndex; i < listData.length; i++) {
      let minHeightItemIndex = 0;
      if (heightList.length && heightList.length < data.listNumber) {
        minHeightItemIndex = heightList.length;
      } else if (heightList.length === data.listNumber) {
        const minHeight = Math.min(...heightList);
        minHeightItemIndex = heightList.findIndex((item) => item === minHeight);
      }

      data.waterfall[data.waterfallList[minHeightItemIndex]].push(listData[i]);
      heightList[minHeightItemIndex] = (heightList[minHeightItemIndex] || 0) + (listData[i].height || 0);
    }

    nextTick(() => {
      store.commit("setData", { key: "homeLoading", value: false });
    });
  };

  return {
    ...toRefs(data),
    getListNumber,
    initWaterfall,
    setWaterFall,
  };
};

/** 页面滚动 hook */
export const useMyScroll = () => {
  const app = document.getElementById("app");
  const data = reactive({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
  });

  /** 页面滚动 */
  const scroll = () => {
    data.scrollTop = app?.scrollTop || 0;
    data.clientHeight = app?.clientHeight || 0;
    data.scrollHeight = app?.scrollHeight || 0;
  };

  /** 滚动到指定位置 */
  const scrollTo = (top: number, behavior: ScrollBehavior = "smooth") => {
    app?.scroll({ top, behavior });
  };

  app?.addEventListener("scroll", scroll);
  onUnmounted(() => {
    app?.removeEventListener("scroll", scroll);
  });

  scroll();

  return {
    ...toRefs(data),
    scrollTo,
  };
};
