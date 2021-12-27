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
          <span className="search-total">({{ total }})</span>
        </div>

        <div className="clear-search-btn" @click="clearSearch()">
          清空搜索条件
        </div>
      </div>

      <div class="frame-list">
        <my-frame :data="item" v-for="item in listData" :key="item.exhibitId" />
      </div>

      <div className="tip" v-show="total === 0">
        当前节点暂无数据，请稍后查看
      </div>
      <div
        className="tip no-more"
        v-show="listData.length !== 0 && listData.length === total"
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
          <span className="search-total">({{ total }})</span>
          <div className="clear-search-btn" @click="clearSearch()">
            清空搜索条件
          </div>
        </div>
      </div>

      <div class="frame-list">
        <div class="waterfall" v-for="list in listNumber" :key="list">
          <my-frame
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.exhibitId"
            @click="currentId = item.exhibitId"
          />
        </div>
      </div>

      <div className="tip" v-show="total === 0">
        当前节点暂无数据，请稍后查看
      </div>
      <div
        className="tip no-more"
        v-show="listData.length !== 0 && listData.length === total"
      >
        — 已加载全部 —
      </div>
    </div>

    <my-footer />

    <detail-popup v-model:id="currentId" :listData="listData" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { useStore } from "vuex";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    "detail-popup": defineAsyncComponent(
      () => import("../components/detail-popup.vue")
    ),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList();
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

    watch(
      () => query.value,
      (cur, pre) => {
        if (cur.keywords !== pre.keywords || cur.tags !== pre.tags) getData();
      }
    );

    watch(
      () => scrollTop.value,
      (cur) => {
        if (cur + clientHeight.value === scrollHeight.value) {
          datasOfGetList.getList();
        }
      }
    );

    watch(
      () => datasOfGetList.listData.value,
      async (cur: ExhibitItem[]) => {
        if (datasOfGetList.skip.value === 0) initWaterfall();

        const index = datasOfGetList.skip.value;

        for (let i = index; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            const height = (300 / img.width) * img.height;
            cur[i].height = height;

            if (i === cur.length - 1) setWaterFall(index);
          };
        }
      }
    );

    // 根据屏幕宽度判断瀑布流列数
    const getListNumber = () => {
      const { clientWidth } = document.body;
      // 屏幕宽度小于等于 1600 时，显示 4 列，否则显示 5 列
      data.listNumber = clientWidth <= 1600 ? 4 : 5;
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
      const GAP_HEIGHT = 10;
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
          ((datasOfGetList.listData.value[i] as any).height || 0) +
          GAP_HEIGHT;
      }

      if (data.searchData.id && data.currentId !== data.searchData.id) {
        data.currentId = data.searchData.id;
      }
    };

    // 获取数据
    const getData = () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };

    getListNumber();
    getData();

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
