<template>
  <div class="home-wrapper">
    <my-header :homeHeader="!(inMobile && searching)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile && !loading">
      <div class="shelf-comic-list" v-if="!searching && userData && myShelf.length !== 0">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="more-shelf" @click="switchPage('/shelf')">
            全部{{ myShelf.length }}
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div class="comic-list-box">
          <div class="comic-box" v-for="item in myShelf" :key="item.exhibitId">
            <comic :mode="4" :data="item" />
          </div>
        </div>
      </div>

      <div class="comic-list">
        <div class="search-box-title" v-if="searching">查询到{{ listData.length }}个相关结果</div>
        <div class="box-title" v-else>精选漫画</div>

        <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
          <comic :data="item" />
        </div>

        <div class="tip" v-if="listData.length === 0">当前节点暂无任何漫画，请稍后查看</div>

        <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">
          — 已加载全部漫画 —
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile && !loading">
      <div class="comic-list" v-if="!searching && userData && myShelf.length !== 0">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="shelf-header-right">
            <div class="shelf-length">全部{{ myShelf.length }}</div>
            <div class="text-btn" @click="switchPage('/shelf')">管理收藏</div>
          </div>
        </div>

        <div class="comic-list-box">
          <div class="comic-box" v-for="item in myShelf.filter((_, index) => index < 6)" :key="item.exhibitId">
            <comic :data="item" />
          </div>
        </div>
      </div>

      <div class="comic-list">
        <div class="search-box-title" v-if="searching">查询到{{ listData.length }}个相关结果</div>
        <div class="box-title" v-else>精选小说</div>

        <div class="comic-list-box">
          <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
            <comic :data="item" />
          </div>
        </div>

        <div class="tip" v-if="listData.length === 0">当前节点暂无任何漫画，请稍后查看</div>

        <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">— 已加载全部漫画 —</div>
      </div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, onActivated, onDeactivated, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll, useMyShelf } from "../utils/hooks";
import { useStore } from "vuex";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    comic: defineAsyncComponent(() => import("../components/comic.vue")),
  },

  setup() {
    const store = useStore();
    const { query, route, switchPage } = useMyRouter();
    const { myShelf } = useMyShelf();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    const datasOfGetList = useGetList();

    const data = reactive({
      searchData: {} as { keywords?: string; tags?: string },
    });

    const methods = {
      // 清除搜索
      clearSearch() {
        data.searchData = {};
        switchPage("/home");
      },
    };

    const searching = computed(() => {
      return data.searchData.keywords || data.searchData.tags;
    });

    // 获取数据
    const getData = () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };

    watch(
      () => scrollTop.value,
      (cur) => {
        if (route.path !== "/home") return;
        if (cur + clientHeight.value !== scrollHeight.value) return;

        datasOfGetList.getList();
      }
    );

    watch(
      () => query.value,
      () => {
        if (route.path !== "/home") return;
        if (data.searchData.keywords === query.value.keywords && data.searchData.tags === query.value.tags) return;

        getData();
      }
    );

    onActivated(() => {
      const homeScrollTop = sessionStorage.getItem("homeScroll");
      scrollTo(Number(homeScrollTop), "auto");
    });

    onDeactivated(() => {
      sessionStorage.setItem("homeScroll", String(scrollTop.value));
    });

    getData();

    return {
      ...store.state,
      switchPage,
      myShelf,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
      searching,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-home-body {
    width: 100%;
    padding-bottom: 98px;

    .shelf-comic-list {
      padding: 30px 20px;
      box-sizing: border-box;
      border-bottom: 5px solid rgba(0, 0, 0, 0.03);

      .shelf-header {
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        .box-title {
          font-size: 34px;
          color: #222222;
          line-height: 40px;
        }

        .more-shelf {
          font-size: 16px;
          color: #666666;
          line-height: 22px;
          display: flex;
          align-items: center;

          .freelog {
            width: 7px;
            height: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
            margin-top: 2px;
          }
        }
      }

      .comic-list-box {
        width: calc(100% + 40px);
        margin-left: -20px;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        overflow-x: auto;
        margin-top: 30px;

        &::-webkit-scrollbar {
          display: none;
        }

        .comic-box + .comic-box {
          margin-left: 12px;
        }
      }
    }

    .comic-list {
      width: 100%;
      padding: 30px 0;
      box-sizing: border-box;

      .search-box-title {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
      }

      .box-title {
        font-size: 34px;
        color: #222222;
        line-height: 40px;
        margin-bottom: 15px;
        padding-left: 20px;
        box-sizing: border-box;
      }

      .comic-box {
        width: 100%;
      }

      .tip {
        width: 100%;
        text-align: center;
        font-size: 16px;
        line-height: 22px;
        color: #999;
        margin-top: 100px;

        &.no-more {
          font-size: 14px;
          line-height: 20px;
          margin-top: 30px;
        }
      }
    }
  }

  // PC
  .home-body {
    width: 1160px;
    padding-bottom: 148px;

    .comic-list {
      margin-top: 55px;

      .shelf-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .shelf-header-right {
          display: flex;
          margin-right: 20px;
          line-height: 20px;

          .shelf-length {
            font-size: 14px;
            color: #999999;
          }
        }
      }

      .search-box-title {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: -15px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
      }

      .box-title {
        font-size: 30px;
        line-height: 36px;
        margin-bottom: 10px;
      }

      .text-btn {
        font-size: 14px;
      }

      .comic-list-box {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        .comic-box {
          width: calc((100% - 50px) / 3);
          margin-right: 25px;
          margin-top: 20px;

          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }

      .tip {
        width: 100%;
        text-align: center;
        font-size: 16px;
        line-height: 22px;
        color: #999;
        margin-top: 100px;

        &.no-more {
          font-size: 14px;
          line-height: 20px;
          margin-top: 30px;
        }
      }

      .text-btn {
        margin-left: 10px;
      }
    }
  }
}
</style>
