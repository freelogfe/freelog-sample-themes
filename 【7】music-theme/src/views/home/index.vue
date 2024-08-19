<script setup lang="ts">
import { ref, watch, onBeforeMount, computed } from "vue";
import { freelogApp } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";

import HomeBanner from "./home-banner.vue";
import HomePopular from "./home-popular.vue";
import HomeAlbum from "@/components/album.vue";

import type { Exhibit } from "@/interface";

const store = useGlobalStore();
const listData = ref<Exhibit[]>([]);
const collectionData = ref<Exhibit[]>([]);
const total = ref<number>(0);
const loading = ref<boolean>(false);

watch(
  () => store.authIdList,
  cur => {
    cur.forEach(id => {
      const item = listData.value.find(data => data.exhibitId === id);
      if (item) item.defaulterIdentityType = 0;
    });
  }
);

const popularData = computed(() => {
  const traditionalExhibit = listData.value.filter(i => i.articleInfo?.articleType === 1);
  const data = [...traditionalExhibit, ...collectionData.value]
    .sort(i => Number(i.updateDate))
    .slice(0, 12);

  return data;
});

const albumData = computed(() => {
  const data = listData.value.filter(i => i.articleInfo?.articleType === 2).slice(0, 5);
  return data;
});

/** 获取展品列表 */
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  const queryParams = {
    articleResourceTypes: "音频",
    isLoadVersionProperty: 1,
    limit: 100
  };
  const list = await freelogApp.getExhibitListByPaging(queryParams);
  const { dataList, totalItem } = list.data.data;

  if (dataList.length !== 0) {
    const ids = dataList.map(item => item.exhibitId).join();

    const [signCountData, statusInfo] = await Promise.all([
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids)
    ]);

    // 使用for...of确保顺序执行
    for (const item of dataList) {
      let index;
      index = signCountData.data.data.findIndex(
        resultItem => resultItem.subjectId === item.exhibitId
      );
      if (index !== -1) {
        item.signCount = signCountData.data.data[index].count;
      }
      index = statusInfo.data.data.findIndex(resultItem => resultItem.exhibitId === item.exhibitId);
      if (index !== -1) {
        item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
      }

      // 获取合集里的单品列表
      if (item.articleInfo.articleType === 2) {
        await getCollectionList(item.exhibitId, item.exhibitName, item.coverImages);
      }
    }
  }

  listData.value = dataList;
  total.value = totalItem;
  loading.value = false;
};

/** 获取合集里的单品列表 */
let subTotal = 0;
let subSkip = 0;
let subTempData = [];

const getCollectionList = async (collectionID: string, exhibitName: string, images: string[]) => {
  const subList = await freelogApp.getCollectionSubList(collectionID, {
    skip: subSkip,
    limit: 1_000,
    isShowDetailInfo: 1
  });
  const { dataList, totalItem } = subList.data.data;
  subTotal = totalItem;

  if (dataList.length !== 0) {
    const ids = dataList.map((item: any) => item.itemId).join();
    const statusInfo = await (freelogApp as any).getCollectionSubAuth(collectionID, {
      itemIds: ids
    });

    if (statusInfo.data.data) {
      dataList.forEach((item: Exhibit) => {
        const index = statusInfo.data.data.findIndex(
          resultItem => resultItem.itemId === item.itemId
        );
        if (index !== -1) {
          item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
        }

        item.updateDate = item.articleInfo.latestVersionReleaseDate;
        item.coverImages = images;
        item.versionInfo = { exhibitProperty: item.articleInfo?.articleProperty };
        item.exhibitTitle = item.itemTitle;
        item.exhibitIntro = item.articleInfo.intro;
        item.albumName = exhibitName;
        item.exhibitId = collectionID;
      });
    }
  }

  subTempData.push(...dataList);
  collectionData.value = [...collectionData.value, ...dataList];

  if (subTempData.length < subTotal) {
    subSkip = subSkip + 1_000;
    await getCollectionList(collectionID, exhibitName, images);
  } else {
    subTotal = 0;
    subSkip = 0;
    subTempData = [];
  }
};

onBeforeMount(() => {
  getList();
});
</script>

<template>
  <HomeBanner />
  <div class="home-popular-album-wrap" :class="{ pc: !store.inMobile, mobile: store.inMobile }">
    <HomePopular hasHeader :data="popularData" />
    <HomeAlbum hasHeader :data="albumData" />
  </div>
</template>

<style lang="less" scoped>
.home-popular-album-wrap {
  &.pc {
    width: 1280px;
  }

  &.mobile {
    width: 100%;
  }
}
</style>
