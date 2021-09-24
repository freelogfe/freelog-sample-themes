<template>
  <div
    class="shelf-comic-wrapper p-relative brs-4 over-h text-center cur-pointer transition"
    @click="switchPage('/detail', { id: data.presentableId })"
    :title="data.presentableTitle"
  >
    <img class="w-100p transition" v-lazy="data.cover" :key="data.cover" />
    <div
      class="book-name p-absolute lb-0 w-100p h-50 flex-row align-end px-10 b-box"
    >
      <div class="flex-1 fs-15 lh-30 fc-white lh-30 text-ellipsis">
        {{ data.presentableTitle }}
      </div>
      <i
        className="iconfont fc-white fs-18 h-30 text-center ml-10 transition"
        title="取消收藏"
        @click.stop="operateShelf(data)"
      >
        &#xe658;
      </i>
    </div>
  </div>
</template>

<script lang="ts">
import { useMyRouter } from "../utils/hooks";

export default {
  name: "shelf-comic",

  props: ["data", "operateShelf"],

  setup() {
    const { switchPage } = useMyRouter();

    return { switchPage };
  },
};
</script>

<style lang="scss" scoped>
.shelf-comic-wrapper {
  img:hover {
    transform: scale(1.1);
  }

  .book-name {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.7)
    );

    .iconfont:hover {
      transform: scale(1.4);
    }
  }
}
</style>
