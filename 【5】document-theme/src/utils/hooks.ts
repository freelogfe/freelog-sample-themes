import { sortMappings } from "@/api/data";
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

  return { query, route, switchPage, routerBack, getCurrentPath };
};

/** 路由历史 hook */
export const useMyLocationHistory = () => {
  const store = useStore();
  const router = useRouter();

  watch(
    () => router,
    cur => {
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
export const useGetList = (inList = false) => {
  const store = useStore();
  const data = reactive({
    listData: <ExhibitItem[]>[],
    loading: false,
    total: 0,
    skip: 0
  });

  /** 获取展品列表 */
  const getList = async (params: any = {}, init = false) => {
    if (data.loading) return;
    if (data.total === data.listData.length && !init) return;

    data.loading = true;
    data.skip = init ? 0 : data.skip + 100;
    const sort = sortMappings.find(
      item =>
        item.label === store.state.selfConfig.options_sort ||
        item.label === store.state.selfConfig.sort
    );
    const queryParams = {
      skip: data.skip,
      articleResourceTypes: "文章",
      limit: params.limit || 100,
      sort: sort?.value || "updateDate:-1",
      isLoadVersionProperty: 1,
      ...params
    };
    const list = await freelogApp.getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const ids = dataList.map(item => item.exhibitId).join();
      const statusInfo = await freelogApp.getExhibitAuthStatus(ids);
      (dataList as ExhibitItem[]).forEach(item => {
        const index = statusInfo.data.data.findIndex(
          (resultItem: { exhibitId: string }) => resultItem.exhibitId === item.exhibitId
        );
        if (index === -1) return;

        const { defaulterIdentityType = -1 } = statusInfo.data.data[index];
        item.defaulterIdentityType = defaulterIdentityType;
      });
    }

    data.listData = init
      ? dataList.filter(
          (i: any) => i.articleInfo?.status !== 2 && [0, 4].includes(i.defaulterIdentityType)
        )
      : [...data.listData, ...dataList].filter(
          (i: any) => i.articleInfo?.status !== 2 && [0, 4].includes(i.defaulterIdentityType)
        );

    inList && store.commit("setData", { key: "listData", value: data.listData });
    data.total = totalItem;
    setTimeout(() => {
      data.loading = false;
    }, 1000);
  };

  /** 清空展品列表 */
  const clearData = () => {
    data.listData = [];
    data.total = 0;
  };

  return {
    ...toRefs(data),
    getList,
    clearData
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
    loading: false
  });

  /** 获取签约列表 */
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const signedList = await freelogApp.getSignStatistics({ keywords });
    const ids = signedList.data.data.map((item: SignedItem) => item.subjectId).join();

    if (!ids) {
      data.mySignedList = [];
      return;
    }

    const [list, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids }),
      freelogApp.getExhibitAuthStatus(ids)
    ]);
    (list.data.data as ExhibitItem[]).forEach(item => {
      const statusItem = statusList.data.data.find(
        (status: { exhibitId: string }) => status.exhibitId === item.exhibitId
      );
      if (!statusItem) return;

      const { defaulterIdentityType = -1 } = statusItem;
      item.defaulterIdentityType = defaulterIdentityType;
    });
    data.mySignedList = list.data.data.filter(
      item => !item.articleInfo.resourceType.includes("主题")
    );
  };

  getMySignedList();

  return {
    ...toRefs(data),
    getMySignedList
  };
};

/** 搜索 hook */
export const useSearchHistory = () => {
  const data = reactive({
    searchHistory: [] as string[]
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
    const index = data.searchHistory.findIndex(item => item === keywords);
    if (index !== -1) data.searchHistory.splice(index, 1);
    if (data.searchHistory.length === 10) data.searchHistory.pop();
    data.searchHistory.unshift(keywords);
    localStorage.setItem("searchHistory", JSON.stringify(data.searchHistory));
  };

  /** 删除搜索词 */
  const deleteWord = (keywords: string) => {
    const index = data.searchHistory.findIndex(item => item === keywords);
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

/** 滚动 hook */
export const useMyScroll = () => {
  const app = document.getElementById("app");
  const data = reactive({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0
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

  /** 回到顶部 */
  const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
    app?.scroll({ top: 0, behavior });
  };

  app?.addEventListener("scroll", scroll);
  onUnmounted(() => {
    app?.removeEventListener("scroll", scroll);
  });

  scroll();

  return {
    ...toRefs(data),
    scrollTo,
    scrollToTop
  };
};
