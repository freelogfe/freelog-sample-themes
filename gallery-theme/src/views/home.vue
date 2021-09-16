<template>
  <div class="home-wrapper bg-white flex-column align-center">
    <my-header :getList="getList" @search="searching = $event" />

    <div class="home-body w-100p b-box">
      <div class="fs-24 mt-40 mb-20 fw-thin" v-show="!searching">Latest</div>

      <div class="fs-24 mt-40 mb-20 fw-thin" v-show="searching">Tagged in {{ "mobile" }}</div>

      <div class="flex-row">
        <div class="waterfall flex-1 ml-self-36" v-for="list in listNumber" :key="list">
          <frame
            class="w-100p mt-self-36"
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.presentableId"
            @click="showModal(item.presentableId)"
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

    <detail-popup v-model:show="modalShow" :listData="listData" :id="currentId" />

    <about-bar />

    <back-top>
      <div class="back-top-btn p-fixed w-40 h-40 text-center brs-50p over-h r-20 b-60 cur-pointer transition">
        <i class="iconfont fs-20 fc-white">&#xe600;</i>
      </div>
    </back-top>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onUnmounted, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { getExhibitsList, GetExhibitsListParams } from "@/api/freelog";
import { ExhibitItem } from "@/utils/interface";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    frame: defineAsyncComponent(() => import("../components/frame.vue")),
    "detail-popup": defineAsyncComponent(() => import("../components/detail-popup.vue")),
    "about-bar": defineAsyncComponent(() => import("../components/about-bar.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
  },

  setup() {
    const { params, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList(getExhibitsList as (query: Partial<GetExhibitsListParams>) => any);
    const data = reactive({
      waterfall: {} as any,
      listNumber: 0,
      waterfallList: ["waterfallFirst", "waterfallSecond", "waterfallThird", "waterfallFourth"],
      modalShow: false,
      currentId: "",
      searching: false,
    });
    let heightList: number[] = [];

    const methods = {
      showModal(presentableId: string) {
        data.currentId = presentableId;
        data.modalShow = true;
      },

      backToTop() {
        document.documentElement.scroll({ top: 0, behavior: "smooth" });
        document.body.scroll({ top: 0, behavior: "smooth" });
      },
    };

    watch(
      () => data.modalShow,
      (cur) => {
        document.body.style.overflow = cur ? "hidden" : "auto";
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
        const dom: any = document.getElementsByClassName("waterfall")[0];

        const index = pre?.length || 0;

        for (let i = index; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            img.height = Math.random() * 800;
            (cur[i] as any).height = (dom.offsetWidth / img.width) * img.height;
            (cur[i] as any).height = (cur[i] as any).height > 300 ? (cur[i] as any).height : 300;

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
          (heightList[minHeightItemIndex] || 0) + ((datasOfGetList.listData.value[i] as any).height || 0);
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

      heightList = [];
      data.waterfall = {};
      for (let i = 0; i < currentNumber; i++) {
        data.waterfall[data.waterfallList[i]] = [] as ExhibitItem[] | { height: number }[];
      }
      data.listNumber = currentNumber;
    };

    getListNumber();
    if (!params.value.tag) datasOfGetList.getList({}, true);

    return {
      ...toRefs(data),
      ...methods,
      ...datasOfGetList,
      params,
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
