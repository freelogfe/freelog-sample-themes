<template>
  <div class="home-wrapper">
    <my-header homeHeader />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="header" v-if="searchData.keywords || searchData.tags">
        <div class="search-title">
          “{{
            `${searchData.keywords || ""}${
              searchData.keywords && searchData.tags ? "+" : ""
            }${searchData.tags || ""}`
          }}”的搜索结果
          <span className="search-total" v-if="!loading">({{ total }})</span>
        </div>

        <div className="text-btn mobile" @click="clearSearch()">
          清空搜索条件
        </div>
      </div>

      <div class="frame-list">
        <div class="waterfall" v-for="list in listNumber" :key="list">
          <my-frame
            class="frame"
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.exhibitId"
            @click="switchPage('/detail', { id: item.exhibitId })"
          />
        </div>
      </div>

      <div className="tip" v-show="!loading && total === 0">
        当前节点暂无数据，请稍后查看
      </div>
      <div
        className="tip no-more"
        v-show="!loading && listData.length !== 0 && listData.length === total"
      >
        — 已加载全部 —
      </div>
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div class="header" v-if="searchData.keywords || searchData.tags">
        <div class="search-title">
          “{{
            `${searchData.keywords || ""}${
              searchData.keywords && searchData.tags ? "+" : ""
            }${searchData.tags || ""}`
          }}”的搜索结果
          <span className="search-total" v-if="!loading">({{ total }})</span>
          <div className="text-btn" @click="clearSearch()">清空搜索条件</div>
        </div>
      </div>

      <div class="frame-list">
        <div class="waterfall" v-for="list in listNumber" :key="list">
          <my-frame
            class="frame"
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.exhibitId"
            @click="currentId = item.exhibitId"
          />
        </div>
      </div>

      <div className="tip" v-show="!loading && total === 0">
        当前节点暂无数据，请稍后查看
      </div>
      <div
        className="tip no-more"
        v-show="!loading && listData.length !== 0 && listData.length === total"
      >
        — 已加载全部 —
      </div>
    </div>

    <my-footer />

    <login-btn />

    <detail v-model:id="currentId" :listData="listData" v-if="!inMobile" />
  </div>
</template>

<script lang="ts">
import {
  defineAsyncComponent,
  onUnmounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { useStore } from "vuex";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    detail: defineAsyncComponent(() => import("../views/detail.vue")),
    "login-btn": defineAsyncComponent(
      () => import("../components/login-btn.vue")
    ),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList(true);
    let heightList: number[] = [];

    const data = reactive({
      searchData: {} as {
        keywords?: string;
        tags?: string;
        id?: string;
      },
      listNumber: 0,
      waterfall: {} as any,
      waterfallList: ["first", "second", "third", "fourth", "fifth"],
      currentId: null as null | string,
    });

    const methods = {
      // 清除搜索
      clearSearch() {
        data.searchData = {};
        switchPage("/home");
      },
    };

    // 根据屏幕宽度判断瀑布流列数
    const getListNumber = () => {
      const { clientWidth } = document.body;
      const { inMobile } = store.state;
      if (inMobile) {
        data.listNumber = 2;
      } else {
        // 屏幕宽度小于等于 1600 时，显示 4 列，否则显示 5 列
        const listNumber = clientWidth <= 1600 ? 4 : 5;
        if (data.listNumber !== listNumber) data.listNumber = listNumber;
      }
    };

    // 初始化瀑布流数据
    const initWaterfall = () => {
      heightList = [];
      data.waterfall = {};
      for (let i = 0; i < data.listNumber; i++) {
        data.waterfall[data.waterfallList[i]] = [] as ExhibitItem[];
      }
    };

    // 整理瀑布流数据
    const setWaterFall = (startIndex = 0) => {
      for (let i = startIndex; i < datasOfGetList.listData.value.length; i++) {
        let minHeightItemIndex = 0;
        if (heightList.length && heightList.length < data.listNumber) {
          minHeightItemIndex = heightList.length;
        } else if (heightList.length === data.listNumber) {
          const minHeight = Math.min(...heightList);
          minHeightItemIndex = heightList.findIndex(
            (item) => item === minHeight
          );
        }

        data.waterfall[data.waterfallList[minHeightItemIndex]].push(
          datasOfGetList.listData.value[i]
        );
        heightList[minHeightItemIndex] =
          (heightList[minHeightItemIndex] || 0) +
          ((datasOfGetList.listData.value[i] as any).height || 0);
      }

      const { id } = data.searchData;
      if (id && data.currentId !== id) {
        if (store.state.inMobile) {
          // 移动端跳转详情页面
          switchPage("/home");
          setTimeout(() => {
            switchPage("/detail", { id });
          }, 0);
        } else {
          // PC端弹出内容弹窗
          data.currentId = id;
        }
      }
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
      setWaterFall();
    };

    watch(
      () => query.value,
      (cur, pre) => {
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

            if (num === cur.length - pre.length) setWaterFall(index);
          };
        }
      }
    );

    window.addEventListener("resize", waterfallResize);
    onUnmounted(() => {
      window.removeEventListener("resize", waterfallResize);
    });

    getListNumber();
    getData();

    return {
      ...store.state,
      switchPage,
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
      margin: 30px 0 15px;

      .search-title {
        font-size: 20px;
        color: #222222;
        line-height: 26px;
        display: flex;

        .search-total {
          color: #999999;
          margin-left: 10px;
        }
      }

      .text-btn {
        width: fit-content;
        font-size: 14px;
        color: #2784ff;
        line-height: 20px;
        margin-top: 10px;
      }
    }

    .frame-list {
      display: flex;

      .waterfall {
        flex: 1;

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
  }

  // PC
  .home-body {
    width: 1230px;
    padding-top: 60px;
    padding-bottom: 148px;

    .header {
      font-size: 30px;
      line-height: 36px;
      margin-bottom: 30px;

      .search-title {
        display: flex;
        align-items: flex-end;

        .search-total {
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
