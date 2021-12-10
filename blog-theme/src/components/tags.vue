<template>
  <div class="tags-wrapper">
    <div
      class="tag"
      :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
      v-for="item in tags"
      :key="item"
      :title="`搜索“${item}”`"
      @click="searchTag(item)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script lang="ts">
import { useMyRouter } from "@/utils/hooks";
import { useStore } from "vuex";

export default {
  name: "tags",

  props: {
    tags: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    const store = useStore();
    const { switchPage } = useMyRouter();

    const methods = {
      // 搜索标签
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/", query);
      },
    };

    return {
      ...store.state,
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;

  .tag {
    box-sizing: border-box;
    font-size: 12px;
    color: #575e6a;
    background-color: #ebecf0;
    height: 24px;
    padding: 0 8px;
    border-radius: 24px;
    display: flex;
    align-items: center;

    // mobile
    &.in-mobile {
      & + .tag {
        margin-left: 8px;
      }

      &:active {
        background-color: #a0a5ae;
        color: #fff;
      }
    }

    // PC
    &.in-pc {
      cursor: pointer;
      transition: all 0.2s linear;

      & + .tag {
        margin-left: 5px;
      }

      &:hover {
        background-color: #a0a5ae;
        color: #fff;
      }
    }
  }
}
</style>
