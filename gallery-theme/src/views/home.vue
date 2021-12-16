<template>
  <div class="home-wrapper">
    <my-header homeHeader />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="header">
        <div class="sort" v-if="!searchData.keywords && !searchData.tags">
          最新
          <i class="freelog fl-icon-zhankaigengduo"></i>
        </div>

        <template v-if="searchData.keywords || searchData.tags">
          <div class="search-title">
            “{{
              `${searchData.keywords || ""}${searchData.keywords && searchData.tags ? "+" : ""}${
                searchData.tags || ""
              }`
            }}”的搜索结果
            <span className="search-total">({{ total }})</span>
          </div>

          <div className="clear-search-btn" @click="clearSearch()">清空搜索条件</div>
        </template>
      </div>

      <div class="article-list">
        <my-frame :data="item" v-for="item in listData" :key="item.exhibitId" />
      </div>

      <div className="tip" v-show="total === 0">当前节点暂无任何书籍，请稍后查看</div>
      <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部书籍 —</div>
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div class="header">
        <div
          class="sort"
          @mouseover="sortPopupShow = true"
          @mouseleave="sortPopupShow = false"
          v-if="!searchData.keywords && !searchData.tags"
        >
          {{ createDateSortType === "-1" ? "最新" : "最早" }} <i class="freelog fl-icon-zhankaigengduo"></i>

          <transition name="slide-down-scale">
            <div class="sort-popup" v-show="sortPopupShow">
              <div class="sort-popup-body">
                <div class="user-box-btn" @click="sort('-1')">最新</div>
                <div class="user-box-btn" @click="sort('1')">最早</div>
              </div>
            </div>
          </transition>
        </div>

        <div class="search-title" v-if="searchData.keywords || searchData.tags">
          “{{
            `${searchData.keywords || ""}${searchData.keywords && searchData.tags ? "+" : ""}${searchData.tags || ""}`
          }}”的搜索结果
          <span className="search-total">({{ total }})</span>
          <div className="clear-search-btn" @click="clearSearch()">清空搜索条件</div>
        </div>
      </div>

      <div class="article-list">
        <my-frame :data="item" v-for="item in listData" :key="item.exhibitId" />
      </div>

      <div className="tip" v-show="total === 0">当前节点暂无任何书籍，请稍后查看</div>
      <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部书籍 —</div>
    </div>

    <my-footer />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onUnmounted, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { useStore } from "vuex";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList();
    let heightList: number[] = [];

    const data = reactive({
      sortPopupShow: false,
      createDateSortType: "-1",
      searchData: {} as { keywords?: string; tags?: string; sort?: string },
      waterfall: {} as any,
      listNumber: 0,
      waterfallList: ["waterfallFirst", "waterfallSecond", "waterfallThird", "waterfallFourth"],
    });

    const methods = {
      // 排序
      sort(sortType: string) {
        if (data.createDateSortType === sortType) return;

        data.createDateSortType = sortType;
        data.searchData.sort = `createDate:${sortType}`;
        datasOfGetList.getList(data.searchData, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchData = {};
        switchPage("/");
      },
    };

    watch(
      () => datasOfGetList.listData.value,
      async (cur, pre) => {
        if (datasOfGetList.skip.value === 0) initWaterfall();

        const dom: any = document.getElementsByClassName("waterfall")[0];

        const index = datasOfGetList.skip.value === 0 ? 0 : pre?.length || 0;

        for (let i = index; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            img.height = Math.random() * 1400;
            const height = (dom.offsetWidth / img.width) * img.height;
            (cur[i] as any).height = height / 2 > 200 ? height / 2 : 200;

            if (i === cur.length - 1) setWaterFall(index);
          };
        }
      }
    );

    watch(
      () => data.listNumber,
      () => {
        setWaterFall();
      }
    );

    const setWaterFall = (startIndex = 0) => {
      const GAP_HEIGHT = 36;
      for (let i = startIndex; i < datasOfGetList.listData.value.length; i++) {
        let minHeightItemIndex = 0;
        if (heightList.length < data.listNumber && heightList.length !== 0) {
          minHeightItemIndex = heightList.length;
        } else if (heightList.length === data.listNumber) {
          const minHeight = Math.min(...heightList);
          minHeightItemIndex = heightList.findIndex((item) => item === minHeight);
        }

        data.waterfall[data.waterfallList[minHeightItemIndex]].push(datasOfGetList.listData.value[i]);
        heightList[minHeightItemIndex] =
          (heightList[minHeightItemIndex] || 0) + ((datasOfGetList.listData.value[i] as any).height || 0) + GAP_HEIGHT;
      }
    };

    const getListNumber = () => {
      let currentNumber = 0;
      const { clientWidth } = document.body;
      if (clientWidth <= 615) {
        currentNumber = 1;
      } else if (clientWidth <= 945) {
        currentNumber = 2;
      } else if (clientWidth <= 1331) {
        currentNumber = 3;
      } else {
        currentNumber = 4;
      }
      if (currentNumber === data.listNumber) return;

      data.listNumber = currentNumber;
      initWaterfall();
    };

    const initWaterfall = () => {
      heightList = [];
      data.waterfall = {};
      for (let i = 0; i < data.listNumber; i++) {
        data.waterfall[data.waterfallList[i]] = [] as ExhibitItem[] | { height: number }[];
      }
    };

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
      data.searchData = { ...data.searchData, ...query.value };
      datasOfGetList.getList(data.searchData, true);
    };
    getListNumber();
    getData();

    window.addEventListener("resize", getListNumber);
    onUnmounted(() => {
      window.removeEventListener("resize", getListNumber);
    });

    return {
      ...store.state,
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
    padding: 0 20px;
    box-sizing: border-box;
    padding-bottom: 98px;

    .header {
      margin: 30px 0 15px;

      .sort {
        font-size: 34px;
        line-height: 40px;
        display: flex;
        align-items: center;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
          transform: rotate(90deg);
        }
      }

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

      .clear-search-btn {
        font-size: 14px;
        color: #2784ff;
        line-height: 20px;
        margin-top: 10px;

        &:active {
          color: #2376e5;
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
    width: 920px;
    padding-top: 55px;
    padding-bottom: 148px;

    .header {
      font-size: 30px;
      line-height: 36px;
      margin-bottom: 30px;

      .sort {
        position: relative;
        width: fit-content;
        display: flex;
        align-items: center;
        cursor: pointer;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
          transform: rotate(90deg);
        }

        .sort-popup {
          position: absolute;
          left: 0;
          top: 100%;
          padding-top: 5px;
          z-index: 1;

          .sort-popup-body {
            width: 118px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            padding: 10px 0;

            .user-box-btn {
              width: 100%;
              height: 40px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              line-height: 40px;
              cursor: pointer;
            }
          }
        }
      }

      .search-title {
        display: flex;
        align-items: flex-end;

        .search-total {
          color: #999999;
          margin-left: 10px;
        }

        .clear-search-btn {
          font-size: 14px;
          color: #2784ff;
          line-height: 20px;
          margin-left: 30px;
          cursor: pointer;

          &:hover {
            color: #529dff;
          }

          &:active {
            color: #2376e5;
          }
        }
      }
    }

    .article-list {
      display: flex;
      flex-wrap: wrap;
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
</style>
