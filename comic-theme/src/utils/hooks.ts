import { GetExhibitsListParams, getUserData, updateUserData } from "@/api/freelog";
import { onUnmounted, reactive, ref, toRefs, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { CollectExhibitItem, ExhibitItem } from "./interface";

/**
 * 路由hook
 */
export const useMyRouter = () => {
  const router = useRouter();
  const route = useRoute();
  const params = ref();

  watchEffect(() => {
    params.value = route.query;
  });

  // 路由跳转方法
  const switchPage = (path: string, query: any = {}) => {
    router.push({ path, query });
  };

  // 路由跳转方法
  const routerBack = (delta = -1) => {
    router.go(delta);
  };

  // 获取当前路由方法
  const getCurrentPath: () => any = () => {
    return router.currentRoute.value.fullPath;
  };

  return { params, switchPage, routerBack, getCurrentPath };
};

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const data = reactive({
    myShelf: [] as CollectExhibitItem[],
    isCollected: false,
  });

  // 获取书架数据
  const getMyShelf = async () => {
    const { shelf } = await getUserData();
    data.myShelf = shelf || [];
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (presentableId: string) => {
    const isCollected = data.myShelf.some((item) => item.presentableId === presentableId);
    return isCollected;
  };

  // 更新书架数据以及收藏情况
  const update = (presentableId: string) => {
    getMyShelf();
    data.isCollected = ifExistInShelf(presentableId);
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    const isCollected = ifExistInShelf(exhibit.presentableId);

    if (isCollected) {
      const index = data.myShelf.findIndex((item) => item.presentableId === exhibit?.presentableId);
      data.myShelf.splice(index, 1);
    } else {
      const { presentableId, coverImages, presentableTitle } = exhibit;
      data.myShelf.push({
        presentableId,
        presentableTitle,
        cover: coverImages[0] || "",
      });
    }
    await updateUserData({ shelf: data.myShelf });
    update(exhibit.presentableId);
  };

  update(id || "");

  return { ...toRefs(data), operateShelf };
};

/**
 * 获取列表数据hook
 */
export const useGetList = (request: (params: Partial<GetExhibitsListParams>) => any) => {
  const data = reactive({
    listData: <ExhibitItem[]>[],
    loading: false,
    total: 0,
    skip: 0,
  });

  const getList = async (params: Partial<GetExhibitsListParams> = {}, init = false) => {
    if (data.loading) return;
    if (data.total === data.listData.length && !init) return;

    data.loading = true;
    data.skip = init ? 0 : data.skip + 10;
    const queryParams = {
      skip: String(data.skip),
      // resourceType: "comic",
      ...params,
    };
    const list = await request(queryParams);
    const { dataList, totalItem } = list.data.data;
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
