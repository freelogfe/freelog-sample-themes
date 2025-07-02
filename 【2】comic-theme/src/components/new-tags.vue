<!-- 标签组 -->

<template>
  <div class="tags-wrapper">
    <div
      class="tag"
      :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
      v-for="item in tags"
      :key="item"
      :title="`搜索“${item}”`"
      @click.stop="searchTag(item)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, toRefs } from "vue";
import { useStore } from "vuex";
import { useMyRouter } from "@/utils/hooks";
import { State } from "@/store/index";

export default {
  name: "tags",

  props: {
    tags: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    hoverColor: {
      type: String,
      default: "#e7949f"
    }
  },

  setup() {
    const store = useStore<State>();
    const { switchPage } = useMyRouter();

    const methods = {
      /** 搜索标签 */
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/home", query);
      }
    };

    return {
      ...toRefs(store.state),
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
.tags-wrapper {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .tag {
    display: inline;
    font-size: 12px;
    color: #666666;
    line-height: 18px;

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
        &::before {
          content: "";
          width: 1px;
          height: 10px;
          background: #000000;
          opacity: 0.1;
          display: inline-block;
          margin: 0 5px;
        }
      }

      &:hover {
        color: v-bind("hoverColor");
      }
    }
  }
}
</style>
