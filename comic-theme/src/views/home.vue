<template>
  <div class="home-wrapper">
    <my-header :homeHeader="!searching" :mobileSearching="!!(inMobile && searching)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="shelf-comic-list" v-if="!searching && userData.isLogin && myShelf && myShelf.length !== 0">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="more-shelf" @click="switchPage('/shelf')">
            全部
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
        <div class="search-box-title" v-if="searching">
          <div class="box-title">查询到{{ listData.length }}个相关结果</div>
          <div class="text-btn mobile" @click="filterBoxShow = true">
            <i className="freelog fl-icon-shaixuan"></i>
            <div class="filter-label">筛选</div>
          </div>
        </div>
        <div class="box-header" v-else>
          <div class="box-title">精选漫画</div>
          <div class="text-btn mobile" @click="filterBoxShow = true">
            <i className="freelog fl-icon-shaixuan"></i>
            <div class="filter-label">筛选</div>
          </div>
        </div>

        <my-loader v-if="loading" />

        <template v-if="!loading">
          <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
            <comic :data="item" />
          </div>

          <div class="tip" v-if="listData.length === 0">
            当前节点暂无任何漫画，请稍后查看
          </div>

          <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">
            — 已加载全部漫画 —
          </div>
        </template>
      </div>

      <transition name="fade">
        <div id="modal" class="modal" v-if="filterBoxShow" @click="filterBoxShow = false"></div>
      </transition>
      <transition name="slide-right">
        <div class="filter-box-body" v-if="filterBoxShow">
          <div class="filter-box-header">
            <div class="header-title">按标签筛选</div>
            <div class="close-btn" @click="filterBoxShow = false">
              <i class="freelog fl-icon-guanbi"></i>
            </div>
          </div>
          <div class="tags-box">
            <div
              class="tag"
              :class="{ active: !searchData.tags }"
              @click="
                filterBoxShow = false;
                selectTag();
              "
            >
              全部
            </div>
            <div class="tags-box-list">
              <div
                class="tag"
                :class="{ active: searchData.tags === item }"
                v-for="item in tagsList"
                :key="item"
                @click="
                  filterBoxShow = false;
                  selectTag(item);
                "
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </transition>

      <login-btn />
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div class="comic-list" v-if="!searching && userData.isLogin && myShelf && myShelf.length !== 0">
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="shelf-header-right">
            <div class="shelf-length">全部</div>
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
        <div class="box-title" v-else>精选漫画</div>

        <div class="filter-bar">
          <div class="filter-bar-bg"></div>

          <div class="category-btn" :class="{ active: !searchData.tags }" @click="selectTag()">
            全部
          </div>

          <div
            class="category-btn"
            :class="{ active: searchData.tags === item }"
            v-for="item in tagsList"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>

        <my-loader v-if="loading" />

        <template v-if="!loading">
          <div class="comic-list-box">
            <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
              <comic :data="item" />
            </div>
          </div>

          <div class="tip" v-if="listData.length === 0">
            当前节点暂无任何漫画，请稍后查看
          </div>

          <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">
            — 已加载全部漫画 —
          </div>
        </template>
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
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    comic: defineAsyncComponent(() => import("../components/comic.vue")),
  },

  setup() {
    const store = useStore();
    const tagsList: string[] = store.state.selfConfig.tags?.split(",");
    const { query, route, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    useMyShelf();
    const datasOfGetList = useGetList();

    const data = reactive({
      searchData: {} as { keywords?: string; tags?: string },
      filterBoxShow: false,
    });

    const methods = {
      // 清除搜索
      clearSearch() {
        data.searchData = {};
        switchPage("/home");
      },

      // 筛选标签
      selectTag(tag: string) {
        const { keywords } = data.searchData;
        const query: { keywords?: string; tags?: string } = {};
        if (tag) query.tags = tag;
        if (keywords) query.keywords = keywords;
        switchPage("/home", query);
      },
    };

    const searching = computed(() => {
      return !!data.searchData.keywords;
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
      
      const { authIds } = store.state;
      if (authIds.length === 0) return;

      authIds.forEach((id: string) => {
        const index = datasOfGetList.listData.value.findIndex((item) => item.exhibitId === id);
        if (index !== -1) datasOfGetList.listData.value[index].isAuth = true;
      });
      store.commit("setData", { key: "authIds", value: [] });
    });

    onDeactivated(() => {
      sessionStorage.setItem("homeScroll", String(scrollTop.value));
    });

    getData();

    return {
      tagsList,
      ...toRefs(store.state),
      switchPage,
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
        width: calc(100% - 40px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        margin-left: 20px;
        padding-bottom: 30px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        .box-title {
          font-size: 16px;
          color: #999999;
          line-height: 22px;
        }
      }

      .box-header {
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 0 20px;
        box-sizing: border-box;
        margin-bottom: 15px;

        .box-title {
          font-size: 34px;
          color: #222222;
          line-height: 40px;
          box-sizing: border-box;
        }
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
      box-sizing: border-box;
      overflow: hidden;
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
        padding-left: 12px;
        box-sizing: border-box;

        .tags-box-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          margin-top: 15px;
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
          margin: 0 5px 15px;
          cursor: pointer;

          &.active {
            background: var(--deriveColor);
            color: #fff;
          }
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

          .text-btn {
            font-size: 14px;
            margin-left: 10px;
          }
        }
      }

      .search-box-title {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: -25px;
        margin-bottom: 30px;
      }

      .box-title {
        font-size: 30px;
        line-height: 36px;
        margin-bottom: 10px;
      }

      .filter-bar {
        position: relative;
        width: 100%;
        height: 50px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-top: 20px;
        margin-bottom: 10px;

        .filter-bar-bg {
          position: absolute;
          inset: 0;
          background-color: var(--deriveColor);
          opacity: 0.04;
        }

        .category-btn {
          position: relative;
          height: 24px;
          padding: 2px 8px;
          box-sizing: border-box;
          font-size: 14px;
          color: #666;
          line-height: 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s linear;
          z-index: 1;

          &:hover {
            color: var(--deriveColor);
          }

          &:active {
            color: var(--deriveColor);
            opacity: 0.8;
          }

          &.active {
            background-color: var(--deriveColor);
            color: #fff;
          }

          & + .category-btn {
            margin-left: 4px;
          }
        }
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
    }
  }
}
</style>
