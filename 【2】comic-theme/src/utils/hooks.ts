import { callLogin } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { onUnmounted, reactive, ref, toRefs, watch, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { showToast } from "./common";
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

  return { route, router, query, switchPage, routerBack };
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
    { immediate: true }
  );
};

/** 收藏 hook */
export const useMyShelf = (id?: string) => {
  const store = useStore();

  const data = reactive({
    isCollected: false
  });

  /** 获取收藏数据 */
  const getMyShelf = async () => {
    if (!store.state.userData.isLogin) return;

    const res = await freelogApp.getUserData("shelf");
    const ids = res?.data?.data || [];

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
    const [list, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds }),
      freelogApp.getExhibitAuthStatus(exhibitIds)
    ]);
    (list.data.data as ExhibitItem[]).forEach(item => {
      const statusItem = statusList.data.data.find(
        (status: { exhibitId: string }) => status.exhibitId === item.exhibitId
      );
      item.defaulterIdentityType = statusItem?.defaulterIdentityType;
    });
    store.commit("setData", { key: "myShelf", value: list.data.data });
  };

  /** 判断当前资源是否已被收藏 */
  const ifExistInShelf = (exhibitId: string) => {
    const shelfIds = store.state.shelfIds;
    const isCollected = shelfIds.includes(exhibitId);
    return isCollected;
  };

  /** 操作收藏（如未收藏则收藏，反之取消收藏） */
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
    const res = await freelogApp.setUserData("shelf", shelfIds);
    if (res.data.errCode === 0) {
      showToast(isThisCollected ? `已将漫画从收藏中移除～` : `已将漫画加入收藏～`);
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

/** 展品列表 hook */
export const useGetList = () => {
  const data = reactive({
    listData: <ExhibitItem[]>[],
    loading: false,
    myLoading: false,
    total: 0,
    skip: 0
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
      articleResourceTypes: "漫画",
      limit: params.limit || 30,
      ...params
    };
    const list = await freelogApp.getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const ids = dataList.map(item => item.exhibitId).join();
      const [signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitSignCount(ids),
        freelogApp.getExhibitAuthStatus(ids)
      ]);
      (dataList as ExhibitItem[]).forEach(item => {
        let index;
        index = signCountData.data.data.findIndex(
          (resultItem: { subjectId: string }) => resultItem.subjectId === item.exhibitId
        );
        if (index !== -1) item.signCount = signCountData.data.data[index].count;
        index = statusInfo.data.data.findIndex(
          (resultItem: { exhibitId: string }) => resultItem.exhibitId === item.exhibitId
        );
        if (index !== -1)
          item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
      });
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
    clearData
  };
};

/** 签约列表 hook */
export const useMySignedList = () => {
  const store = useStore();
  const data = reactive({
    mySignedList: <ExhibitItem[] | null>null,
    loading: false
  });

  /** 获取已签约列表 */
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!store.state.userData.isLogin) return;

    const signedList = await freelogApp.getSignStatistics({ keywords });
    const ids = signedList.data.data.map(item => item.subjectId).join();

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
      item.defaulterIdentityType = statusItem?.defaulterIdentityType;
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

/** 页面滚动 hook */
export const useMyScroll = (target?: string) => {
  const scrollArea = document.getElementById(target || "app");

  const data = reactive({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0
  });

  /** 页面滚动 */
  const scroll = () => {
    data.scrollTop = scrollArea?.scrollTop || 0;
    data.clientHeight = scrollArea?.clientHeight || 0;
    data.scrollHeight = scrollArea?.scrollHeight || 0;
  };

  /** 滚动到指定位置 */
  const scrollTo = (top: number, behavior: ScrollBehavior = "smooth") => {
    scrollArea?.scroll({ top, behavior });
  };

  /** 回到顶部 */
  const scrollToTop = () => {
    scrollArea?.scroll({ top: 0, behavior: "smooth" });
  };

  scrollArea?.addEventListener("scroll", scroll);
  onUnmounted(() => {
    scrollArea?.removeEventListener("scroll", scroll);
  });

  return {
    ...toRefs(data),
    scrollTo,
    scrollToTop
  };
};
