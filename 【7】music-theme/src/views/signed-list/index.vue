<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { freelogApp } from "freelog-runtime";
import list from "@/components/list.vue";
import { useGlobalStore } from "@/store/global";

const store = useGlobalStore();
const signedData = ref<any[]>([]);

const getList = async () => {
  for (const item of store?.signedList) {
    if (item.articleInfo.articleType === 2) {
      signedData.value?.push(item);
      await getCollectionList(
        item.exhibitId,
        item.exhibitName,
        item.coverImages,
        item?.onlineStatus
      );
    } else {
      signedData.value?.push(item);
    }
  }
};

/** 获取合集里的单品列表 */
let subTotal = 0;
let subSkip = 0;
let subTempData = [];

const getCollectionList = async (
  collectionID: string,
  exhibitName: string,
  images: string[],
  onlineStatus: number
) => {
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
      dataList.forEach((item: any) => {
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
        item.onlineStatus = onlineStatus;
      });
    }
  }

  subTempData.push(...dataList);
  // signedData.value = [...signedData.value, ...dataList];
  signedData.value?.push(...dataList);

  if (subTempData.length < subTotal) {
    subSkip = subSkip + 1_000;
    await getCollectionList(collectionID, exhibitName, images, onlineStatus);
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
