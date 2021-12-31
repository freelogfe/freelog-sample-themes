import { getExhibitAuthStatus, getExhibitListById, GetExhibitListByIdParams, getExhibitListByPaging, GetExhibitListByPagingParams, getExhibitSignCount, getUserData, setUserData } from "@/api/freelog";
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
    query.value = route.query;
  });

  // 路由跳转方法
  const switchPage = (path: string, query: any = {}) => {
    const { locationHistory } = store.state;
    const index = locationHistory.findIndex((item: { path: string }) => item.path === path);
    const IF_HOME_AND_NO_SEARCH = path === "/home" && (!query || Object.keys(query).length === 0);
    if (index !== -1 || IF_HOME_AND_NO_SEARCH) {
      locationHistory.splice(index);
      router.replace({ path, query });
    } else {
      router.push({ path, query });
    }
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
    if (path !== "/home" || (path === "/home" && Object.keys(query.value).length !== 0)) {
      locationHistory.push({ path: "/home" });
    }
    const current = { path, query: query.value };
    locationHistory.push(current);
    store.commit("setData", { key: "locationHistory", value: locationHistory });
  };
  initLocationHistory();

  return { query, switchPage, routerBack, getCurrentPath };
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
      articleResourceTypes: "comic",
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
 * 获取页面相关信息hook
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

  const scrollToTop = () => {
    app?.scroll({ top: 0, behavior: "smooth" });
  };

  app?.addEventListener("scroll", scroll);
  onUnmounted(() => {
    app?.removeEventListener("scroll", scroll);
  });

  return {
    ...toRefs(data),
    scrollToTop,
  };
};
