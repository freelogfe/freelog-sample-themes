<template>
  <div class="home-wrapper">
    <my-header :homeHeader="!searchData.keywords" :mobileSearching="!!(inMobile && searchData.keywords)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="header" v-if="searchData.keywords">
        <div class="box-title">查询到{{ listData.length }}个相关结果</div>

        <div class="text-btn mobile" @click="filterBoxShow = true">
          <i className="freelog fl-icon-shaixuan"></i>
          <div class="filter-label">筛选</div>
        </div>
      </div>

      <my-loader v-if="loading" />

      <template v-if="!loading">
        <div class="frame-list">
          <div class="waterfall" v-for="list in listNumber" :key="list">
            <my-frame
              class="frame"
              :data="item"
              v-for="item in waterfall[waterfallList[list - 1]]"
              :key="item.exhibitId"
              @click="clickFrame(item.exhibitId)"
            />
          </div>
        </div>

        <div className="tip" v-show="total === 0">当前节点暂无数据，请稍后查看</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>

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
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div class="search-box-title" v-if="searchData.keywords">查询到{{ listData.length }}个相关结果</div>

      <div class="filter-bar">
        <div class="filter-bar-bg"></div>

        <div class="category-btn" :class="{ active: !searchData.tags }" @click="selectTag()">全部</div>

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
        <div class="frame-list">
          <div class="waterfall" v-for="list in listNumber" :key="list">
            <my-frame
              class="frame"
              :data="item"
              v-for="item in waterfall[waterfallList[list - 1]]"
              :key="item.exhibitId"
              @click="clickFrame(item.exhibitId)"
            />
          </div>
        </div>

        <div className="tip" v-show="total === 0">当前节点暂无数据，请稍后查看</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>
    </div>

    <my-footer />

    <login-btn />

    <detail v-model:id="currentId" @refreshAuth="refreshAuth(currentId)" v-if="!inMobile" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onActivated, onDeactivated, onUnmounted, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll, useMyWaterfall } from "../utils/hooks";
import { useStore } from "vuex";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    detail: defineAsyncComponent(() => import("../views/detail.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
  },

  setup() {
    const store = useStore();
    const tagsList: string[] = store.state.selfConfig.tags?.split(",");
    const { query, route, switchPage } = useMyRouter();
    const { listNumber, waterfall, waterfallList, getListNumber, initWaterfall, setWaterFall } = useMyWaterfall();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    const datasOfGetList = useGetList();

    const data = reactive({
      searchData: {} as {
        keywords?: string;
        tags?: string;
        id?: string;
      },
      currentId: null as null | string,
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

      clickFrame(id: string) {
        if (store.state.inMobile) {
          switchPage("/detail", { id });
        } else {
          data.currentId = id;
        }
        store.commit("setData", { key: "listData", value: datasOfGetList.listData.value });
      },

      refreshAuth(id: string) {
        for (let i = 0; i < waterfallList.value.length; i++) {
          const index = waterfall.value[waterfallList.value[i]].findIndex((item: ExhibitItem) => item.exhibitId === id);
          if (index !== -1) {
            waterfall.value[waterfallList.value[i]][index].isAuth = true;
            break;
          }
        }
      },
    };

    // 获取数据
    const getData = () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };

    // 获取更多数据
    const getMoreData = () => {
      if (scrollTop.value + clientHeight.value === scrollHeight.value) {
        datasOfGetList.getList();
      }
    };

    // 屏幕尺寸变化切换瀑布流列数
    const waterfallResize = () => {
      getListNumber();
      initWaterfall();
      setWaterFall(datasOfGetList.listData.value);
    };

    // 根据链接判断是否进入详情页或打开内容弹窗
    const judgeUrl = () => {
      const { id } = query.value;
      if (!id) return;

      if (store.state.inMobile) {
        // 移动端跳转详情页面
        switchPage("/home", {}, "replace");
        setTimeout(() => {
          switchPage("/detail", { id });
        }, 0);
      } else {
        // PC端弹出内容弹窗
        data.currentId = id;
      }
    };

    watch(
      () => query.value,
      (cur, pre) => {
        if (route.path !== "/home") return;
        if (cur.keywords !== pre.keywords || cur.tags !== pre.tags) getData();
      }
    );

    watch(
      () => scrollTop.value,
      () => {
        getMoreData();
      }
    );

    watch(
      () => datasOfGetList.listData.value,
      async (cur: ExhibitItem[], pre: ExhibitItem[]) => {
        if (datasOfGetList.skip.value === 0) initWaterfall();

        const index = datasOfGetList.skip.value;
        const { inMobile } = store.state;
        let num = 0;
        let frameWidth = 0;
        let minHeight = 0;

        if (inMobile) {
          frameWidth = (document.body.clientWidth - 40) / 2;
          minHeight = 120;
        } else {
          frameWidth = 300;
          minHeight = 230;
        }

        for (let i = index; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            const height = (frameWidth / img.width) * img.height;
            cur[i].height = height < minHeight ? minHeight : height;
            num++;

            if (num === cur.length - pre.length) setWaterFall(cur, index);
          };
        }
      }
    );

    onActivated(() => {
      const homeScrollTop = sessionStorage.getItem("homeScroll");
      scrollTo(Number(homeScrollTop), "auto");

      const { authIds } = store.state;
      if (authIds.length === 0) return;

      authIds.forEach((id: string) => {
        methods.refreshAuth(id);
      });
      store.commit("setData", { key: "authIds", value: [] });
    });

    onDeactivated(() => {
      sessionStorage.setItem("homeScroll", String(scrollTop.value));
    });

    window.addEventListener("resize", waterfallResize);
    onUnmounted(() => {
      window.removeEventListener("resize", waterfallResize);
    });

    judgeUrl();
    getListNumber();
    getData();

    return {
      ...toRefs(store.state),
      tagsList,
      switchPage,
      listNumber,
      waterfall,
      waterfallList,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-home-body {
    width: 100%;
    padding: 15px 15px 0;
    box-sizing: border-box;
    padding-bottom: 98px;

    .header {
      margin: 15px 0 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .box-title {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
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
    }

    .frame-list {
      display: flex;

      .waterfall {
        flex: 1;
        width: 0;

        & + .waterfall {
          margin-left: 10px;
        }

        .frame-wrapper + .frame-wrapper {
          margin-top: 10px;
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

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin: 30px 0;
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
    width: 1230px;
    padding-top: 10px;
    padding-bottom: 148px;

    .search-box-title {
      font-size: 14px;
      color: #999999;
      line-height: 20px;
      margin-top: 20px;
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
      margin-top: 30px;
      margin-bottom: 40px;

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

    .frame-list {
      display: flex;

      .waterfall {
        width: 300px;

        & + .waterfall {
          margin-left: 10px;
        }

        .frame-wrapper + .frame-wrapper {
          margin-top: 10px;
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

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin-top: 30px;
      }
    }
  }
}

@media (min-width: 1600px) {
  .home-body {
    width: 1540px !important;
  }
}
</style>
