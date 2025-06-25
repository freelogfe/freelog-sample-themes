<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onBeforeMount,
  watch,
  onActivated,
  onDeactivated,
  reactive
} from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll } from "@/utils/hooks";
const myArticleV2 = defineAsyncComponent(() => import("@/components/article-v2.vue"));

const store = useStore();
const { query, route, router, switchPage } = useMyRouter();
const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
const datasOfGetList = useGetList();
const data = reactive({
  sortPopupShow: false,
  createDateSortType: "-1",
  searchData: { sort: "createDate:-1" } as { keywords?: string; tags?: string; sort?: string },
  blogInfoPopupShow: false,
  isInitial: true
});

const sortOptions = ["最近发布", "最早发布"];
const activeSort = ref(sortOptions[0]);
const tagsList: string[] = [
  "全部",
  ...((store.state.selfConfig.options_tags || store.state.selfConfig.tags)
    ?.split(",")
    ?.map((tag: string) => tag.trim())
    ?.filter(Boolean) || [])
];
const activeFilter = ref(tagsList[0]);

const setFilter = (option: string) => {
  activeFilter.value = option;
};

// 切换排序
const setSort = (option: string) => {
  activeSort.value = option;

  if (option === "最近发布") {
    option = "-1";
  } else {
    option = "1";
  }

  if (data.createDateSortType === option) return;

  data.createDateSortType = option;
  data.searchData.sort = `createDate:${option}`;
  datasOfGetList.getList(data.searchData, true);
};

// 获取博客列表
const getData = () => {
  datasOfGetList.clearData();
  datasOfGetList.getList({}, true);
};

const columnLength = computed(() => {
  return datasOfGetList.listData.value.filter(ele => ele.articleInfo.articleType === 2).length;
});

const availableListData = computed(() => {
  // 基础过滤条件：只显示博客类型且状态正常且身份类型为0或4的文章
  const baseFilter = (ele: any) =>
    ele.articleInfo.articleType === 2 &&
    ele.articleInfo.status === 1 &&
    [0, 4].includes(ele.defaulterIdentityType!);

  // 先进行基础过滤
  const baseFilteredData = datasOfGetList.listData.value.filter(baseFilter);

  // 根据标签筛选：如果选择"全部"则显示所有，否则按标签过滤
  return activeFilter.value === "全部"
    ? baseFilteredData
    : baseFilteredData.filter((item: any) => item.tags.includes(activeFilter.value));
});

watch(
  () => scrollTop.value,
  cur => {
    if (cur + clientHeight.value === scrollHeight.value && route.path === "/blog") {
      datasOfGetList.getList();
    }
  }
);

onActivated(() => {
  if (router.options.history.state.replaced && !data.isInitial) {
    const homeScrollTop = sessionStorage.getItem("homeScroll");
    scrollTo(Number(homeScrollTop), "auto");

    const { authIds } = store.state;
    if (authIds.length === 0) return;

    authIds.forEach((id: string) => {
      const index = datasOfGetList.listData.value.findIndex(item => item.exhibitId === id);
      if (index !== -1) datasOfGetList.listData.value[index].defaulterIdentityType = 0;
    });
    store.commit("setData", { key: "authIds", value: [] });
  } else {
    getData();
  }

  data.isInitial = false;
});

onDeactivated(() => {
  sessionStorage.setItem("homeScroll", String(scrollTop.value));
});

onBeforeMount(() => {
  getData();
});
</script>

<template>
  <div class="blog-wrapper">
    <!-- 头部 -->
    <div class="blog-header">
      <div class="blog-header-title">专栏</div>
      <div class="blog-header-count">总数{{ columnLength }}</div>
    </div>
    <!-- 排序筛选 -->
    <div class="blog-filter">
      <div class="filter-row">
        <span>排序：</span>
        <div
          v-for="option in sortOptions"
          :key="option"
          class="filter-btn"
          :class="{ active: activeSort === option }"
          @click="setSort(option)"
        >
          {{ option }}
        </div>
      </div>
      <div class="filter-row" style="margin-top: 12px">
        <span>筛选：</span>
        <div
          v-for="option in tagsList"
          :key="option"
          class="tag-btn"
          :class="{ active: activeFilter === option }"
          @click="setFilter(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="article-list">
      <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.blog-wrapper {
  max-width: 1600px;
  padding-top: 20px;
  margin: 0 auto;

  .blog-header {
    .blog-header-title {
      font-weight: 600;
      font-size: 28px;
      color: #222222;
      line-height: 34px;
    }
    .blog-header-count {
      font-weight: 400;
      font-size: 12px;
      color: rgba(34, 34, 34, 0.4);
      line-height: 18px;
      margin-top: 10px;
    }
  }

  .blog-filter {
    margin: 24px 0 20px 0;

    .filter-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      span {
        font-size: 14px;
        color: #222222;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .filter-btn {
        margin-right: 20px;
        padding: 3px 10px;
        border: none;
        border-radius: 13px;
        color: #222222;
        font-size: 14px;
        cursor: pointer;

        &:hover:not(.active) {
          color: #222222;
          font-weight: 600;
        }

        &.active {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      .tag-btn {
        margin-right: 20px;
        padding: 3px 10px;
        border: none;
        border-radius: 13px;
        color: #222222;
        font-size: 14px;
        cursor: pointer;

        &:hover:not(.active) {
          color: #222222;
          font-weight: 600;
        }

        &.active {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .article-list {
    margin-top: 40px;
  }
}

.article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 80px;
}

@media screen and (min-width: 1300px) {
  .article-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>
