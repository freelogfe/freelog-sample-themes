<template>
  <div class="home-wrapper bg-white flex-column align-center">
    <my-header :getList="getList" :searchData="searchData" @search="searchData = $event" />

    <div class="home-body w-100p b-box text-align-left">
      <div class="fs-20 mt-40 mb-20 fw-thin">
        <span class="fs-24" v-show="!searchData.keywords && !searchData.tags">Latest</span>
        <span v-show="searchData.keywords">
          <span>Searched in</span>
          <span class="fs-30 fw-bold ml-10">{{ searchData.keywords }}</span>
        </span>
        <span v-show="searchData.tags">
          <span class="mx-10" v-show="searchData.keywords">{{ `&` }}</span>
          <span>Tagged in</span>
          <span class="fs-30 fw-bold ml-10">{{ searchData.tags }}</span>
        </span>
      </div>

      <div class="flex-row">
        <div class="waterfall flex-1 ml-self-36" v-for="list in listNumber" :key="list">
          <frame
            class="w-100p mt-self-36"
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.exhibitId"
            @click="currentId = item.exhibitId"
          />
        </div>
      </div>
    </div>

    <div
      class="tip text-center fs-18 my-30"
      :class="{ 'mt-100': total === 0 }"
      v-if="total === listData.length || total === 0"
    >
      {{ total === 0 ? "NO DATA" : "END" }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onUnmounted, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { ExhibitItem } from "../api/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    frame: defineAsyncComponent(() => import("../components/frame.vue")),
  },

  setup() {
    const { query, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList();
    const data = reactive({
      waterfall: {} as any,
      listNumber: 0,
      waterfallList: ["waterfallFirst", "waterfallSecond", "waterfallThird", "waterfallFourth"],
      currentId: "",
      searchData: {} as { keywords?: string; tags?: string },
    });
    let heightList: number[] = [];

    const methods = {
      backToTop() {
        document.documentElement.scroll({ top: 0, behavior: "smooth" });
        document.body.scroll({ top: 0, behavior: "smooth" });
      },
    };

    watch(
      () => data.currentId,
      (cur) => {
        setTimeout(() => {
          document.body.style.overflow = cur ? "hidden" : "auto";
        }, 0);
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

    const resize = () => {
      getListNumber();
    };

    window.addEventListener("resize", resize);
    onUnmounted(() => {
      window.removeEventListener("resize", resize);
    });

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

    getListNumber();
    if (!query.value.tag) datasOfGetList.getList({}, true);

    return {
      ...toRefs(data),
      ...methods,
      ...datasOfGetList,
      query,
      switchPage,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  .home-body {
    padding: 0 72px;
  }

  .tip {
    color: #ccccd0;

    &::before,
    &::after {
      content: " ";
      height: 1px;
      width: 60px;
      background-color: #e6e6e6;
      margin: 0 30px;
    }
  }

  .back-top-btn {
    opacity: 0.6;
    background-color: #0d0c22;

    &:hover {
      opacity: 1;
    }
  }
}

@media (max-width: 1200px) {
  .home-body {
    padding: 0 32px !important;
  }
}

@media (max-width: 768px) {
  .home-body {
    padding: 0 20px !important;
  }
}
</style>
