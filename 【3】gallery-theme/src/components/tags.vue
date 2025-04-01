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
import { useMyRouter } from "@/utils/hooks";
import { useStore } from "vuex";
import { onMounted, toRefs } from "vue";

export default {
  name: "tags",

  props: {
    tags: {
      type: Array,
      default: () => []
    },
    shouldCalculateWidth: {
      type: Boolean,
      default: false
    }
  },

  setup(props: any, context: any) {
    const store = useStore();
    const { switchPage } = useMyRouter();

    const methods = {
      /** 搜索标签 */
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/home", query);
      }
    };

    onMounted(() => {
      if (!props.inMobile && props.shouldCalculateWidth) {
        let total = 0;
        props.tags.forEach((_: any, index: number) => {
          const tagElement = document.querySelector(
            `.exhibit-info .tag:nth-child(${index + 1})`
          ) as HTMLElement;
          if (tagElement) {
            total += tagElement.offsetWidth;
          }
        });
        context.emit("updateTotalWidth", total);
      }
    });
    return {
      ...toRefs(store.state),
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;

  .tag {
    max-width: 100%;
    box-sizing: border-box;
    font-size: 12px;
    color: #575e6a;
    background-color: #ebecf0;
    height: 24px;
    line-height: 24px;
    padding: 0 8px;
    border-radius: 24px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

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

.more-tag-popup .tags-wrapper .tag {
  margin-bottom: 10px !important;
}
</style>
