<template>
  <div class="home-comic-wrapper brs-4 over-h">
    <div
      class="book-cover over-h text-center cur-pointer transition"
      @click="switchPage('/detail', { id: data.presentableId })"
    >
      <img
        class="w-100p transition"
        v-lazy="data.coverImages[0]"
        :alt="data.presentableTitle"
        :title="data.presentableTitle"
        :key="data.coverImages[0]"
      />
    </div>

    <div class="comic-info pt-10 px-10 b-box">
      <div
        class="comic-name fs-15 fw-bold text-ellipsis cur-pointer transition"
        @click="switchPage('/detail', { id: data.presentableId })"
      >
        {{ data.presentableTitle }}
      </div>
      <div class="mt-6 text-ellipsis">
        <span class="book-author fs-12">
          {{ getResourceName(data.resourceInfo.resourceName, 0) }}
        </span>
      </div>

      <tags class="mt-10" :data="data.tags" size="small" />
    </div>
  </div>
</template>

<script lang="ts">
import { useMyRouter } from "@/utils/hooks";
import { getResourceName } from "../utils/common";
import { defineAsyncComponent } from "vue";

export default {
  name: "home-comic",

  props: ["data"],

  components: {
    tags: defineAsyncComponent(() => import("./tags.vue")),
  },

  setup() {
    const { switchPage } = useMyRouter();

    return { switchPage, getResourceName };
  },
};
</script>

<style lang="scss" scoped>
.home-comic-wrapper {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .book-author {
    color: #858c96;
  }

  .book-cover {
    width: 100%;
    height: fit-content;

    img:hover {
      transform: scale(1.1);
    }
  }

  .comic-name {
    color: #0d141e;

    &:hover {
      color: #4fa1ff;
    }
  }
}
</style>
