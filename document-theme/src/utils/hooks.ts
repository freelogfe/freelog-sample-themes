import { getExhibitAuthStatus, getExhibitListByPaging, GetExhibitListByPagingParams } from "@/api/freelog";
import { onUnmounted, reactive, ref, toRefs, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ExhibitItem } from "../api/interface";

/**
 * 路由hook
 */
export const useMyRouter = () => {
  const router = useRouter();
  const route = useRoute();
  const query = ref();

  watchEffect(() => {
    query.value = route.query;
  });

  router.beforeEach((to, from, next) => {
    if (to.fullPath !== from.fullPath) {
      next();
    } else {
      router.replace("/");
    }
  });

  /**
   * 路由跳转方法
   * @param path 路由
   * @param query 参数
   * @param mode 路由修改模式 0-全部替换参数 1-保留原有参数的基础上修改参数
   */
  const switchPage = (path: string, query: any = {}, mode = 0) => {
    router.push({ path, query: mode === 0 ? query : { ...router.currentRoute.value.query, ...query } });
  };

  // 路由跳转方法
  const routerBack = () => {
    router.back();
  };

  // 获取当前路由方法
  const getCurrentPath: () => any = () => {
    return router.currentRoute.value.fullPath;
  };

  return { query, switchPage, routerBack, getCurrentPath };
};

/**
 * 获取列表数据hook
 */
export const useGetList = (inList = false) => {
  const store = useStore();
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
    data.skip = init ? 0 : data.skip + 100;
    const queryParams: GetExhibitListByPagingParams = {
      skip: data.skip,
      articleResourceTypes: "markdown",
      limit: params.limit || 100,
      ...params,
      isLoadVersionProperty: 1,
    };
    const list = await getExhibitListByPaging(queryParams);
    const { dataList, totalItem } = list.data.data;
    if (dataList.length !== 0) {
      const idList: string[] = [];
      dataList.forEach((item: ExhibitItem) => {
        idList.push(item.exhibitId);
      });
      const ids = idList.join(",");
      const statusInfo = await getExhibitAuthStatus(ids);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          dataList[index].isAuth = item.isAuth;
        });
      }
    }
    data.listData = init ? dataList : [...data.listData, ...dataList];
    inList && store.commit("setData", { key: "listData", value: data.listData });
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

  const scrollTo = (top: number, behavior: ScrollBehavior = "smooth") => {
    app?.scroll({ top, behavior });
  };

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
    scrollToTop,
  };
};