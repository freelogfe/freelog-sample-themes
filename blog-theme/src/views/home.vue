<template>
  <div class="home-wrapper bg-white flex-column align-center">
    <my-header :getList="getList" :searchData="searchData" @search="searchData = $event" />

    <div class="home-body w-100p b-box">
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

      <div class="blog-list">
        <frame
          :data="item"
          v-for="item in listData"
          :key="item.presentableId"
          @click="currentId = item.presentableId"
        />
      </div>
    </div>

    <div
      class="tip text-center fs-18 my-30"
      :class="{ 'mt-100': total === 0 }"
      v-if="total === listData.length || total === 0"
    >
      {{ total === 0 ? "NO DATA" : "END" }}
    </div>

    <detail-popup v-model:id="currentId" :listData="listData" :getList="getList" @search="searchData.tags = $event" />

    <about-bar />

    <back-top>
      <div class="back-top-btn p-fixed w-40 h-40 text-center brs-50p over-h r-20 b-60 cur-pointer transition">
        <i class="iconfont fs-20 fc-white">&#xe600;</i>
      </div>
    </back-top>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { getExhibitsList, GetExhibitsListParams } from "../api/freelog";

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
      currentId: "",
      searchData: {} as { keywords?: string; tags?: string },
    });

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

  .blog-list {
    display: grid;
    grid-gap: 36px;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
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
