<template>
  <div class="home-wrapper">
    <my-header :homeHeader="!(inMobile && searching)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile && !loading">
      <div class="shelf-comic-list" v-if="!searching">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div
            class="more-shelf"
            @click="switchPage('/shelf')"
            v-if="userData && myShelf.length !== 0"
          >
            全部{{ myShelf.length }}
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div class="comic-list-box" v-if="myShelf.length !== 0">
          <div class="comic-box" v-for="item in myShelf" :key="item.exhibitId">
            <comic :inMobileShelf="true" :data="item" />
          </div>
        </div>

        <div class="tip" v-if="!userData">登录后查看我的收藏</div>
        <div class="tip" v-if="userData && myShelf.length === 0">
          暂无数据，快去寻找漫画来收藏吧～
        </div>
      </div>

      <div class="comic-list">
        <div class="search-title" v-if="searching">
          <div>
            “{{ searchData.keywords
            }}{{ searchData.keywords && searchData.tags && "+"
            }}{{ searchData.tags || "" }}”的搜索结果
            <span class="search-comic-total"> ({{ listData.length }}) </span>
          </div>
          <div class="text-btn mobile" @click="clearSearch()">清空搜索条件</div>
        </div>
        <div class="box-title" v-else>精选漫画</div>

        <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
          <comic :data="item" />
        </div>

        <div class="tip" v-if="listData.length === 0">
          当前节点暂无任何漫画，请稍后查看
        </div>

        <div
          class="tip no-more"
          v-if="listData.length !== 0 && listData.length === total"
        >
          — 已加载全部漫画 —
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile && !loading">
      <div class="comic-list" v-if="!searching">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="text-btn" @click="switchPage('/shelf')" v-if="userData">
            管理收藏
          </div>
        </div>

        <div class="comic-list-box" v-if="myShelf.length !== 0">
          <div
            class="comic-box"
            v-for="item in myShelf.filter((_, index) => index < 6)"
            :key="item.exhibitId"
          >
            <comic :data="item" />
          </div>
        </div>

        <div class="tip" v-if="!userData">登录后查看我的收藏</div>
        <div class="tip" v-if="userData && myShelf.length === 0">
          暂无数据，快去寻找漫画来收藏吧～
        </div>
        <div class="tip shelf-tip" v-if="userData && myShelf.length !== 0">
          <span>已收藏 {{ myShelf.length }} 部漫画</span>
          <span class="text-btn" @click="switchPage('/shelf')">查看全部</span>
        </div>
      </div>

      <div class="comic-list">
        <div class="box-title">
          <div class="search-box-title" v-if="searching">
            “{{ searchData.keywords
            }}{{ searchData.keywords && searchData.tags && "+"
            }}{{ searchData.tags || "" }}”的搜索结果
            <span class="search-comic-total">({{ listData.length }})</span>
            <div class="text-btn" @click="clearSearch()">清空搜索条件</div>
          </div>
          <div v-else>精选漫画</div>
        </div>

        <div class="comic-list-box">
          <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
            <comic :data="item" />
          </div>
        </div>

        <div class="tip" v-if="listData.length === 0">
          当前节点暂无任何漫画，请稍后查看
        </div>

        <div
          class="tip no-more"
          v-if="listData.length !== 0 && listData.length === total"
        >
          — 已加载全部漫画 —
        </div>
      </div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, reactive, toRefs, watch } from "vue";
import {
  useGetList,
  useMyRouter,
  useMyScroll,
  useMyShelf,
} from "../utils/hooks";
import { useStore } from "vuex";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(
      () => import("../components/theme-entrance.vue")
    ),
    comic: defineAsyncComponent(() => import("../components/comic.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { myShelf } = useMyShelf();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
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

    watch(
      () => scrollTop.value,
      (cur) => {
        if (cur + clientHeight.value === scrollHeight.value) {
          datasOfGetList.getList();
        }
      }
    );

    watch(
      () => query.value,
      () => {
        getData();
      }
    );

    // 获取数据
    const getData = () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };
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

      .tip {
        width: 100%;
        text-align: center;
        font-size: 16px;
        line-height: 22px;
        color: #999;
        margin-top: 60px;
        margin-bottom: 30px;
      }
    }

    .comic-list {
      width: 100%;
      padding: 30px 0;
      box-sizing: border-box;

      .search-title {
        font-size: 20px;
        color: #222222;
        line-height: 26px;
        margin-bottom: 15px;
        padding-left: 20px;
        box-sizing: border-box;

        .search-comic-total {
          color: #999999;
          margin-left: 10px;
        }

        .text-btn {
          width: fit-content;
          font-size: 14px;
          line-height: 20px;
          margin-top: 10px;
        }
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
        margin-top: 60px;

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
      }

      .box-title {
        font-size: 30px;
        line-height: 36px;
        margin-bottom: 10px;

        .search-box-title {
          display: flex;
          align-items: flex-end;

          .search-comic-total {
            color: #999999;
            margin-left: 10px;
          }

          .text-btn {
            font-size: 14px;
            line-height: 20px;
            margin-left: 30px;
          }
        }
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
        margin-top: 55px;

        &.shelf-tip,
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
