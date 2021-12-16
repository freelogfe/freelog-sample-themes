import {
  getExhibitAuthStatus,
  getExhibitListByPaging,
  GetExhibitListByPagingParams,
  getExhibitSignCount,
} from "@/api/freelog";
import { onUnmounted, reactive, ref, toRefs, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
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

  // 路由跳转方法
  const switchPage = (path: string, query: any = {}, mode = "push") => {
    (router as any)[mode]({ path, query });
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
      articleResourceTypes: "image,video",
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

  return {
    ...toRefs(data),
    getList,
  };
};

/**
 * 获取页面相关信息hook
 */
export const useMyScroll = () => {
  const data = reactive({
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
  });

  const scroll = () => {
    data.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    data.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    data.scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  };

  window.addEventListener("scroll", scroll);
  onUnmounted(() => {
    window.removeEventListener("scroll", scroll);
  });

  return {
    ...toRefs(data),
  };
};
