<template>
  <div class="shelf-wrapper flex-column align-center">
    <my-header :getList="search" />

    <div class="content w-100p mw-1412 b-box">
      <div class="fs-24 mt-40 mb-20">我的漫画</div>

      <div class="flex-row flex-wrap">
        <shelf-comic
          class="book-box mb-44"
          :data="item"
          :operateShelf="operateShelf"
          v-for="item in shelf"
          :key="item.resourceId"
        ></shelf-comic>

        <div
          class="add-book-box p-relative shrink-0 mb-44 brs-4 transition cur-pointer"
          @click="switchPage('/')"
          title="去添加漫画"
        >
          <div class="w-100p h-0 pb-75p text-center">
            <img
              class="p-absolute w-32 h-32 t-50p mt--16"
              src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/shelf_last_add.fe952d0f.png"
              alt="加入书架"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, ref } from "@vue/runtime-core";
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { CollectExhibitItem } from "@/utils/interface";

export default {
  name: "shelf",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "shelf-comic": defineAsyncComponent(() => import("../components/shelf-comic.vue")),
  },

  setup() {
    const { switchPage } = useMyRouter();
    const { myShelf, operateShelf } = useMyShelf();
    const searchKey = ref("");
    const shelf = computed(() => {
      return myShelf.value.filter((item: CollectExhibitItem) => item.presentableTitle.includes(searchKey.value));
    });

    const search = (params: { keywords: string }, init: boolean) => {
      if (!init) return [];

      searchKey.value = params.keywords || "";
    };

    return {
      shelf,
      search,
      switchPage,
      operateShelf,
    };
  },
};
</script>

<style lang="scss" scoped>
.shelf-wrapper {
  min-height: 100vh;
  background-image: url(../assets/image/bg.png);

  .content {
    padding: 0 40px;

    .book-box {
      width: 18%;
      margin-right: 2%;
    }

    .add-book-box {
      width: 18%;
      margin-right: 0 !important;
      background-color: #edeeef;

      &:hover {
        background-color: #e0e0e0;
      }
    }
  }
}

@media (max-width: 900px) {
  .content {
    padding: 0 20px;

    .book-box,
    .add-book-box {
      width: 31% !important;
      margin-right: 2% !important;
    }
  }
}

@media (max-width: 600px) {
  .content {
    .book-box,
    .add-book-box {
      width: 46% !important;
      margin-right: 4% !important;
    }
  }
}
</style>
