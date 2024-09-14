import { onUnmounted, reactive, ref, toRefs, watch, watchEffect } from "vue";
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
  const switchPage = (path: string, query: any = {}) => {
    router.push({ path, query });
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

/** 展品列表 hook */
export const useGetList = () => {
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

    if (init) data.loading = true;
    data.myLoading = true;
    data.skip = init ? 0 : data.skip + 30;
    const queryParams = {
      skip: data.skip,
      articleResourceTypes: "文章",
      limit: params.limit || 30,
      isLoadVersionProperty: 1,
      ...params,
    };
    const list = await freelogApp.getExhibitListByPaging(queryParams);
    console.log("list", list);
    
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
    }
    data.listData = init ? dataList.filter(ele => ele.articleInfo.status === 1 && [0, 4].includes(ele.defaulterIdentityType)) 
      : [...data.listData, ...dataList].filter(ele => ele.articleInfo.status === 1 && [0, 4].includes(ele.defaulterIdentityType));
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

/** 签约列表 hook */
export const useMySignedList = () => {
  interface SignedItem {
    subjectId: string;
  }

  const store = useStore();
  const data = reactive({
    mySignedList: <ExhibitItem[] | null>null,
    loading: false,
  });

  /** 获取签约列表 */
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData) return;

    const signedList = await freelogApp.getSignStatistics({ keywords });
    const ids = signedList.data.data.map((item: SignedItem) => item.subjectId).join();

    if (!ids) {
      data.mySignedList = [];
      return;
    }

    const [list, signCountData, statusData] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 }),
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids),
    ]);
    (list.data.data as ExhibitItem[]).forEach((item) => {
      const signCountItem = signCountData.data.data.find((signCount) => signCount.subjectId === item.exhibitId);
      item.signCount = signCountItem?.count;
      const statusItem = statusData.data.data.find((status) => status.exhibitId === item.exhibitId);
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

/** 滚动 hook */
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

  return {
    ...toRefs(data),
    scrollTo,
  };
};
