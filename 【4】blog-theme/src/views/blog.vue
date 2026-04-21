<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onBeforeMount,
  watch,
  onActivated,
  reactive
} from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll } from "@/utils/hooks";
const myArticleV2 = defineAsyncComponent(() => import("@/components/article-v2.vue"));

const store = useStore();
const { route, router } = useMyRouter();
const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
const datasOfGetList = useGetList();
const data = reactive({
  sortPopupShow: false,
  createDateSortType: "-1",
  searchData: { sort: "createDate:-1", articleResourceTypes: "文章" } as {
    keywords?: string;
    tags?: string;
    sort?: string;
  },
  blogInfoPopupShow: false,
  isInitial: true,
  filterBoxShow: false,
  isClickedConfirmBtn: false,
  tempActiveFilter: "全部" // 临时存储弹窗中的筛选选择
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
  // 在弹窗中只更新临时变量，不直接更新 activeFilter
  if (data.filterBoxShow) {
    data.tempActiveFilter = option;
  } else {
    activeFilter.value = option;
  }
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
  !store.state.inMobile && datasOfGetList.getList(data.searchData, true);
};

// 获取博客列表
const getData = () => {
  datasOfGetList.clearData();
  datasOfGetList.getList(data.searchData, true);
};

const availableListData = computed(() => {
  // 基础过滤条件：只显示博客类型且状态正常且身份类型为0或4的文章
  const baseFilter = (ele: any) =>
    ele.articleInfo.articleType === 1 &&
    ele.articleInfo.status === 1 &&
    [0, 4].includes(ele.defaulterIdentityType!);

  // 先进行基础过滤
  const baseFilteredData = datasOfGetList.listData.value.filter(baseFilter);

  if (store.state.inMobile) {
    if (data.isClickedConfirmBtn) {
      return activeFilter.value === "全部"
        ? baseFilteredData
        : baseFilteredData.filter((item: any) => item.tags.includes(activeFilter.value));
    }
    return baseFilteredData;
  } else {
    // 根据标签筛选：如果选择"全部"则显示所有，否则按标签过滤
    return activeFilter.value === "全部"
      ? baseFilteredData
      : baseFilteredData.filter((item: any) => item.tags.includes(activeFilter.value));
  }
});

// 移动端“确定”按钮，应用筛选条件
const confirmFilter = () => {
  // 将临时选择应用到实际的过滤条件
  activeFilter.value = data.tempActiveFilter;
  data.filterBoxShow = false;
  data.isClickedConfirmBtn = true;
  datasOfGetList.getList(data.searchData, true);
};

// 关闭筛选弹窗，恢复之前的过滤状态
const closeFilterBox = () => {
  data.filterBoxShow = false;
};

watch(
  () => scrollTop.value,
  cur => {
    if (cur + clientHeight.value + 1 >= scrollHeight.value && route.path === "/blog") {
      datasOfGetList.getList(data.searchData);
    }
  }
);

onActivated(() => {
  if (router.options.history.state.replaced && !data.isInitial) {
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

onBeforeMount(() => {
  scrollTo(0, "auto");
  getData();
});
</script>

<template>
  <div class="blog-wrapper" :class="{ 'pc-wrapper': !store.state.inMobile }">
    <div class="is-pc" v-if="!store.state.inMobile">
      <!-- 头部 -->
      <div class="blog-header">
        <div class="blog-header-title">所有文章</div>
        <!-- <div class="blog-header-count">总数{{ availableListData.length }}</div> -->
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
            :title="option"
            @click="setFilter(option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>

    <div class="is-mobile" v-else>
      <div class="header">
        <div class="title">所有文章</div>
        <div
          class="text-btn mobile filter"
          @click="
            () => {
              data.filterBoxShow = true;
            }
          "
        >
          <i className="freelog fl-icon-shaixuan"></i>
          <div class="filter-label">筛选</div>
        </div>
      </div>

      <!-- 移动端筛选弹窗 -->
      <transition name="fade">
        <div id="modal" class="modal" v-if="data.filterBoxShow" @click="closeFilterBox"></div>
      </transition>
      <transition name="slide-right">
        <div class="filter-box-body" v-if="data.filterBoxShow">
          <div class="filter-box-header">
            <div class="header-title">筛选</div>
            <div class="close-btn" @click="closeFilterBox">
              <i class="freelog fl-icon-guanbi"></i>
            </div>
          </div>
          <div class="tags-box">
            <!-- 排序 -->
            <div class="top-bar">
              排序：
              <div class="category-btn-box">
                <div
                  v-for="option in sortOptions"
                  :key="option"
                  class="tag"
                  :class="{ active: activeSort === option }"
                  @click="setSort(option)"
                >
                  {{ option }}
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div class="bottom-bar">
              标签：

              <div class="category-btn-box">
                <div
                  class="tag"
                  :class="{ active: data.tempActiveFilter === item }"
                  v-for="item in tagsList"
                  :key="item"
                  @click="setFilter(item)"
                >
                  {{ item }}
                </div>
              </div>
            </div>

            <!-- 点击确定后执行筛选 -->
            <div class="confirm-btn" @click="confirmFilter">确定</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 主内容区：有列表时不占满剩余高度；无列表时 flex:1，便于空态/首屏 loading 在剩余区域居中 -->
    <div class="blog-body" :class="{ 'blog-body--fill': availableListData.length === 0 }">
      <div
        class="article-list"
        v-if="availableListData.length > 0"
        :class="{ 'mobile-list': store.state.inMobile, 'pc-list': !store.state.inMobile }"
      >
        <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
      </div>

      <div class="no-data" v-else-if="!datasOfGetList.myLoading.value">
        <div class="no-data-text">暂无任何结果</div>
      </div>
      <div
        v-if="datasOfGetList.myLoading.value"
        class="loading-container"
        :class="{ 'loading-container--fill': availableListData.length === 0 }"
      >
        <img src="@/assets/images/loading.svg" alt="加载中" class="loading-icon" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blog-wrapper {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(100vh - 158px);
  padding: 30px 20px;

  &.pc-wrapper {
    min-height: calc(100vh - 148px);
    padding-top: 20px;
    margin: 0 auto;
    width: 90%;
    min-width: 965px;
    max-width: 1600px;
  }

  .is-pc {
    flex-shrink: 0;

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
      margin: 40px 0;

      .filter-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        /* 换行间距用 gap，避免 tag 的 margin-bottom 参与交叉轴对齐导致与左侧文案不齐 */
        row-gap: 15px;
        margin-bottom: 8px;

        span {
          font-size: 14px;
          color: #222222;
          margin-right: 10px;
          flex-shrink: 0;
          line-height: 26px;
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
          max-width: 250px;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

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
  }

  .is-mobile {
    flex-shrink: 0;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .title {
        font-weight: 600;
        font-size: 30px;
        color: #222222;
        line-height: 36px;
      }

      .text-btn {
        display: flex;
        align-items: center;

        .freelog {
          font-size: 18px;
        }

        .filter-label {
          font-size: 16px;
          line-height: 22px;
          margin-left: 5px;
        }
      }

      .filter {
        display: flex;
        justify-content: end;

        .freelog {
          font-size: 18px;
        }

        .filter-label {
          font-size: 16px;
          line-height: 22px;
          margin-left: 5px;
        }
      }
    }

    .modal {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 101;
    }

    .filter-box-body {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 340px;
      background: #ffffff;
      border-radius: 0px 10px 10px 0px;
      padding: 0 20px;
      padding-bottom: 30px;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      z-index: 101;

      .filter-box-header {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 26px;

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
        }

        .close-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 6px;

          .freelog {
            font-size: 12px;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .tags-box {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 30px;
        box-sizing: border-box;

        .top-bar,
        .bottom-bar {
          display: flex;
          flex-direction: column;
          color: #666666;

          .category-btn-box {
            display: flex;
            flex-wrap: wrap;
            margin-top: 15px;
          }
        }

        .tag {
          width: fit-content;
          height: 38px;
          border-radius: 38px;
          padding: 9px 15px;
          box-sizing: border-box;
          background: #ebecf0;
          font-size: 14px;
          color: #575e6a;
          line-height: 20px;
          margin: 0 10px 15px 0;
          cursor: pointer;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &.active {
            background: var(--deriveColor);
            color: #fff;
          }
        }

        .confirm-btn {
          width: 100%;
          height: 48px;
          background: #222222;
          border-radius: 4px;
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
          line-height: 48px;
          text-align: center;
          margin-top: auto;
        }
      }
    }
  }
}

.blog-body {
  display: flex;
  flex-direction: column;
  min-height: 0;

  &--fill {
    flex: 1;
  }
}

.article-list.pc-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 80px;
  margin-top: 25px;
}

.article-list.mobile-list {
  margin-top: 30px;
  .article-wrapper-v2 {
    margin-bottom: 30px;
  }
  .article-wrapper-v2:last-child {
    border-bottom: none;
    margin-bottom: 0px;
  }
}

// Loading 样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  margin: 20px 0;

  &.loading-container--fill {
    flex: 1;
    margin: 0;
    min-height: 0;
  }

  .loading-icon {
    width: 32px;
    height: 32px;
    animation: rotate 1s linear infinite;
    margin-bottom: 8px;
  }

  .loading-text {
    font-size: 14px;
    color: #999999;
    line-height: 20px;
  }
}

// 暂无结果：在 blog-body 剩余区域内水平 + 垂直居中
.no-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
}

.no-data-text {
  text-align: center;
  font-size: 28px;
  font-weight: 400;
  color: #999999;
}
.tip.no-more {
  text-align: center;
  font-size: 14px;
  color: #999999;
  line-height: 20px;
  margin: 20px 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (min-width: 1300px) {
  .article-list.pc-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>
