<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { freelogApp } from "freelog-runtime";
import list from "@/components/list.vue";
import { useGlobalStore } from "@/store/global";

const store = useGlobalStore();
const collectionData = ref([]);
const signedData = ref(store.signedList);

const getList = async () => {
  for (const item of store.signedList) {
    if (item.articleInfo.articleType === 2) {
      await getCollectionList(item.exhibitId, item.exhibitName, item.coverImages);
    }
  }
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
  signedData.value = [...signedData.value, ...collectionData.value];

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

<!-- 签约列表页 -->
<template>
  <div class="sign-list-wrapper">
    <list
      :list="signedData"
      :loading="!signedData"
      title="签约记录"
      noDataTip="暂无任何签约记录"
      statusShow
      authShow
    />
  </div>
</template>
