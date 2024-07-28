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
  const data = listData.value.sort(i => Number(i.updateDate));
  return data;
});

const albumData = computed(() => {
  const data = listData.value.filter(i => i.articleInfo?.articleType === 2);
  return data;
});

/** 获取展品列表 */
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  const queryParams = {
    articleResourceTypes: "音频",
    isLoadVersionProperty: 1,
    limit: 15
  };
  const list = await freelogApp.getExhibitListByPaging(queryParams);
  const { dataList, totalItem } = list.data.data;

  if (dataList.length !== 0) {
    const ids = dataList.map(item => item.exhibitId).join();

    const [signCountData, statusInfo] = await Promise.all([
      freelogApp.getExhibitSignCount(ids),
      freelogApp.getExhibitAuthStatus(ids)
    ]);

    dataList.forEach(item => {
      let index;
      index = signCountData.data.data.findIndex(
        resultItem => resultItem.subjectId === item.exhibitId
      );
      if (index !== -1) item.signCount = signCountData.data.data[index].count;
      index = statusInfo.data.data.findIndex(resultItem => resultItem.exhibitId === item.exhibitId);
      index = statusInfo.data.data.findIndex(resultItem => resultItem.exhibitId === item.exhibitId);
      if (index !== -1)
        item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
    });
  }

  listData.value = dataList;
  total.value = totalItem;
  loading.value = false;
};

onBeforeMount(() => {
  getList();
});
</script>

<template>
  <HomeBanner />
  <div class="home-popular-album-wrap">
    <HomePopular hasHeader :data="popularData" />
    <HomeAlbum hasHeader :data="albumData" />
  </div>
</template>

<style lang="less" scoped>
.home-popular-album-wrap {
  width: 1280px;
}
</style>
