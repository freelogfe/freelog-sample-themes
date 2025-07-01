<script setup lang="ts">
import { freelogApp } from "freelog-runtime";
import { ref, onBeforeMount, defineAsyncComponent, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useMyRouter } from "@/utils/hooks";
import { formatDate } from "@/utils/common";
const myArticleV2 = defineAsyncComponent(() => import("@/components/article-v2.vue"));
const tags = defineAsyncComponent(() => import("@/components/tags.vue"));

const route = useRoute();
const store = useStore();
const { switchPage } = useMyRouter();
const exhibitId = route.query.id as string;
const exhibitInfo = ref<any>(null);
const sortOrder = ref<string>("asc"); // 默认排序为正序
const recommendList = ref<any[]>([]);

// 获取展品信息
const getExhibitInfo = async () => {
  const [exhibitInfoResult, statusInfoResult] = await Promise.all([
    freelogApp.getExhibitInfo(exhibitId, { isLoadVersionProperty: 1 }),
    freelogApp.getExhibitAuthStatus(exhibitId)
  ]);

  const { defaulterIdentityType = -1 } = statusInfoResult.data.data[0];

  exhibitInfo.value = {
    ...exhibitInfoResult.data.data,
    defaulterIdentityType
  };

  sortOrder.value =
    (exhibitInfo.value.versionInfo?.exhibitProperty?.catalogueProperty as any)
      ?.collection_sort_list === "collection_sort_descending"
      ? "desc"
      : "asc";

  getColumnList();

  nextTick(() => {
    mountShareWidget();
  });
};

// 获取合集列表
let subTotal = 0;
let subSkip = 0;
let subTempData = [];

const getColumnList = async () => {
  const columnList = await freelogApp.getCollectionSubList(exhibitId, {
    skip: subSkip,
    limit: 1_000,
    isShowDetailInfo: 1,
    sortType: 1
  });

  const { dataList, totalItem } = columnList.data.data as unknown as {
    dataList: any[];
    totalItem: number;
  };
  subTotal = totalItem;

  if (dataList.length !== 0) {
    const ids = dataList.map((item: any) => item.itemId).join();
    const statusInfo = await (freelogApp as any).getCollectionSubAuth(exhibitId, {
      itemIds: ids
    });

    if (statusInfo.data.data) {
      dataList.forEach((item: any) => {
        item.exhibitId = exhibitId;

        const index = statusInfo.data.data.findIndex(
          (resultItem: any) => resultItem.itemId === item.itemId
        );
        if (index !== -1) {
          item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
        }
      });
    }
  }

  subTempData.push(...dataList);
  exhibitInfo.value = {
    ...exhibitInfo.value,
    collectionList: dataList
  };

  if (subTempData.length < subTotal) {
    subSkip = subSkip + 1_000;
    await getColumnList();
  } else {
    subTotal = 0;
    subSkip = 0;
    subTempData = [];
  }
};

const handleSort = () => {
  // 切换排序顺序
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";

  // 使用排序函数
  const compare = (a: any, b: any) => {
    return sortOrder.value === "asc" ? a.sortId - b.sortId : b.sortId - a.sortId;
  };

  // 根据当前排序顺序更新数据
  exhibitInfo.value.collectionList.sort(compare);
};

// 获取推荐列表
const getRecommendList = async () => {
  const res = await (freelogApp as any).getExhibitRecommend(exhibitId, {
    recommendNorm: "sameAuthorAndType,sameTagAndType,sameType,latestCreate",
    size: 10
  });
  const { data: recommendData } = res.data;

  if (recommendData.length !== 0) {
    recommendList.value = recommendData;
  }
};

/** 加载分享插件 */
const mountShareWidget = async () => {
  if (store.state.inMobile) return;

  const container = document.getElementById("share");
  debugger;
  if (!container) return;

  if (exhibitInfo.value?.shareWidget) await exhibitInfo.value.shareWidget.unmount();

  const subDeps = await freelogApp.getSelfDependencyTree();

  const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-展品分享");
  if (!widgetData) return;

  const { articleId, parentNid, nid } = widgetData;
  const topExhibitId = freelogApp.getTopExhibitId();

  const params = {
    articleId,
    parentNid,
    nid,
    topExhibitId,
    container,
    renderWidgetOptions: {
      data: {
        exhibit: exhibitInfo.value,
        type: "博客",
        routerType: "columnDetail"
      }
    }
    // widget_entry: "https://localhost:8201"
  };

  exhibitInfo.value.shareWidget = await freelogApp.mountArticleWidget(params);
};

/** 控制分享弹窗显示 */
const setShareWidgetShow = (value: boolean) => {
  exhibitInfo.value.shareWidget?.setData({ show: value });
};

onBeforeMount(() => {
  getExhibitInfo();
  getRecommendList();
});
</script>

<template>
  <div class="column-detail-wrapper">
    <div class="column-detail-header">
      <!-- 合集封面 -->
      <div class="column-cover">
        <img :src="exhibitInfo?.coverImages?.[0]" alt="column-cover" />
      </div>

      <div class="column-info">
        <div class="top">
          <span class="title">{{ exhibitInfo?.exhibitTitle }}</span>
          <div
            class="share-btn"
            @mouseenter.stop="setShareWidgetShow(true)"
            @mouseleave.stop="setShareWidgetShow(false)"
          >
            <span class="share-btn-text"> <i class="freelog fl-icon-fenxiang"></i>分享 </span>

            <div id="share" class="share-wrapper" />
          </div>
        </div>
        <div class="bottom">
          <div class="author-avatar">
            <img
              :src="`https://image.freelog.com/avatar/${exhibitInfo?.articleInfo?.articleOwnerId}`"
              alt="头像"
            />
          </div>
          <div class="author-name">{{ exhibitInfo?.articleInfo?.articleOwnerName }}</div>
          <div class="divider"></div>
          <div class="date">
            {{
              formatDate(exhibitInfo?.articleInfo?.versions?.[0]?.createDate) ||
              formatDate(exhibitInfo?.articleInfo?.firstVersionReleaseDate)
            }}
          </div>
          <div class="divider"></div>
          <span class="type">专栏</span>
          <div class="divider"></div>
          <span
            class="status"
            :class="exhibitInfo?.articleInfo?.serializeStatus === 1 ? 'completed' : 'ongoing'"
          >
            {{ exhibitInfo?.articleInfo?.serializeStatus === 1 ? "完结" : "更新中" }}
          </span>
          <span class="count">{{ exhibitInfo?.collectionList?.totalItem }}</span>
        </div>

        <div class="tags" v-if="exhibitInfo?.tags?.length">
          <tags :tags="exhibitInfo?.tags" :maxWidthObj="{ isVaild: false, maxWidth: 80 }" />
        </div>
      </div>
    </div>

    <!-- 排序 -->
    <div class="sort" @click="handleSort">
      <span>{{ sortOrder === "asc" ? "正序" : "倒序" }}</span>
      <span class="triangle" :class="sortOrder === 'asc' ? 'asc' : 'desc'"></span>
    </div>

    <!-- 内容 -->
    <div class="article-list">
      <my-article-v2 :data="item" v-for="item in exhibitInfo?.collectionList" :key="item.itemId" />
    </div>

    <!-- 其他专栏 -->
    <div class="recommend-column" v-if="recommendList.length">
      <div class="recommend-header">
        <div class="recommend-column-title">其他专栏</div>
        <span class="more" @click="switchPage('/')">更多 >></span>
      </div>

      <!-- 推荐内容 -->
      <div class="article-list recommend-list">
        <my-article-v2 :data="item" v-for="item in recommendList" :key="item.exhibitId" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.column-detail-wrapper {
  max-width: 1600px;
  padding-top: 20px;
  margin: 0 auto;

  .column-cover {
    width: 100%;
    height: 654px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .column-info {
    padding: 50px 0 30px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-weight: 600;
        font-size: 36px;
        color: #222222;
        line-height: 46px;
      }

      .share-btn {
        flex-shrink: 0;
        position: relative;
        display: flex;
        align-items: center;
        margin-left: 30px;
        cursor: pointer;

        .share-btn-text {
          padding: 9px 15px;
          border: 1px solid #666666;
          border-radius: 4px;
          font-size: 14px;
          line-height: 20px;
          color: #222;
          transition: all 0.2s linear;

          &:hover,
          &.active {
            opacity: 0.8;
          }

          &:active {
            opacity: 0.6;
          }

          .fl-icon-fenxiang {
            margin-right: 6px;
          }
        }

        .share-wrapper {
          position: absolute;
          right: 0;
          top: 100%;
          z-index: 1;
        }
      }
    }

    .bottom {
      display: flex;
      align-items: center;
      margin: 15px 0;
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;

      .author-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .author-name {
        font-weight: 400;
        font-size: 12px;
        color: #666666;
        line-height: 18px;
        margin-left: 5px;
      }

      .date {
        font-weight: 400;
        font-size: 12px;
        color: #666666;
        line-height: 18px;
      }

      .divider {
        width: 1px;
        height: 12px;
        background: rgba(0, 0, 0, 0.2);
        margin: 0 5px;
      }

      .status {
        margin-right: 5px;

        &.completed {
          color: #e9a923;
        }

        &.ongoing {
          color: #42c28c;
        }
      }
    }
  }
}

.sort {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 30px 0;

  font-weight: 400;
  font-size: 14px;
  color: #000000;
  line-height: 20px;

  // &:hover {
  //   color: #e7949f;
  //   .triangle {
  //     &.asc {
  //       border-top: 4px solid #e7949f;
  //     }
  //     &.desc {
  //       border-bottom: 4px solid #e7949f;
  //     }
  //   }
  // }

  .triangle {
    width: 0;
    height: 0;
    border-right: 3px solid transparent;
    border-left: 3px solid transparent;
    margin-left: 5px;

    &.asc {
      border-top: 4px solid #222222;
    }
    &.desc {
      border-bottom: 4px solid #222222;
    }
  }
}

.article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 100px;
}

.recommend-list {
  margin-top: 30px;
}

.recommend-column {
  .recommend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    font-weight: 600;
    font-size: 14px;
    color: #222222;
    line-height: 20px;

    .more {
      font-weight: 400;
      color: #0f2027;
    }
  }
}

@media screen and (min-width: 1300px) {
  .article-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>
