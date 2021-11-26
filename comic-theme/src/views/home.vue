<template>
  <div class="home-wrapper flex-column align-center">
    <my-header :getList="getList" @search="searching = $event" :defaultTag="params.tag" />

    <div class="home-body w-100p mw-1412 b-box">
      <template v-if="!searching">
        <div class="shelf-title w-100p mt-40 mb-20 flex-row align-center space-between">
          <div class="fs-24">
            我的漫画
            <i class="iconfont fs-20">&#xe6a3;</i>
          </div>
          <div class="more-shelf fs-16 lh-24 ml-20 cur-pointer transition" @click="switchPage('/shelf')">
            查看我的漫画 >
          </div>
        </div>

        <div className="tip text-center fs-18 my-30" v-if="shelf.length === 0">暂无数据，快去收藏漫画到书架吧</div>

        <div class="w-100p flex-row" v-else>
          <shelf-comic
            class="book-box shelf-book"
            :data="item"
            :operateShelf="operateShelf"
            v-for="item in shelf"
            :key="item.presentableId"
          ></shelf-comic>
        </div>
      </template>

      <div class="hot-title fs-24 mt-40 mb-20" v-show="!searching">
        热门漫画
        <i class="iconfont fs-20">&#xe65a;</i>
      </div>

      <div class="hot-title fs-24 mt-40 mb-20" v-show="searching">
        搜索结果
      </div>

      <div class="w-100p flex-row flex-wrap">
        <home-comic class="book-box mb-30" :data="item" v-for="item in listData" :key="item.presentableId"></home-comic>
      </div>
    </div>

    <div
      class="tip text-center fs-18 my-30"
      :class="{ 'mt-100': searching && total === 0 }"
      v-if="total === listData.length || total === 0"
    >
      {{ total === 0 ? "NO DATA" : "END" }}
    </div>

    <about-bar />

    <back-top>
      <div class="back-top-btn p-fixed w-40 h-40 text-center brs-50p over-h r-20 b-60 cur-pointer transition">
        <i class="iconfont fs-20 fc-white">&#xe600;</i>
      </div>
    </back-top>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll, useMyShelf } from "../utils/hooks";
import { getExhibitsList, GetExhibitsListParams } from "../api/freelog";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "shelf-comic": defineAsyncComponent(() => import("../components/shelf-comic.vue")),
    "home-comic": defineAsyncComponent(() => import("../components/home-comic.vue")),
    "about-bar": defineAsyncComponent(() => import("../components/about-bar.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
  },

  setup() {
    const { params, switchPage } = useMyRouter();
    const { myShelf, operateShelf } = useMyShelf();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();

    const datasOfGetList = useGetList(getExhibitsList as (query: Partial<GetExhibitsListParams>) => any);

    const data = reactive({
      searching: false,
    });

    const shelf = computed(() => {
      return myShelf.value.filter((_item, index) => index < 6);
    });

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
      ...datasOfGetList,
      params,
      switchPage,
      shelf,
      operateShelf,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  min-height: 100vh;
  background-image: url(../assets/image/bg.png);

  .home-body {
    padding: 0 40px;

    .shelf-title .iconfont {
      color: #9ac9ff;
    }

    .hot-title .iconfont {
      color: #fc6e51;
    }

    .more-shelf {
      color: #999;

      &:hover {
        color: #333;
      }
    }

    .book-box {
      width: 15%;
      margin-right: 2%;

      &:nth-child(6n) {
        margin-right: 0;
      }
    }
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
    background-color: #9ac9ff;

    &:hover {
      opacity: 1;
      background-color: #86bfff;
    }
  }
}

@media (max-width: 940px) {
  .home-wrapper {
    .home-body {
      .book-box {
        width: 22%;
        margin-right: 4% !important;

        &:nth-child(4n) {
          margin-right: 0 !important;
        }
      }

      .shelf-book:nth-child(5),
      .shelf-book:nth-child(6) {
        display: none !important;
      }
    }
  }
}

@media (max-width: 600px) {
  .home-wrapper {
    .home-body {
      .book-box {
        width: 48%;
        margin-right: 4% !important;

        &:nth-child(2n) {
          margin-right: 0 !important;
        }
      }

      .shelf-book:nth-child(3),
      .shelf-book:nth-child(4) {
        display: none !important;
      }
    }
  }
}

@media (max-width: 400px) {
  .home-wrapper {
    .home-body {
      padding: 0 14px;
    }

    ::v-deep .book-box .comic-name {
      white-space: normal !important;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
}
</style>
